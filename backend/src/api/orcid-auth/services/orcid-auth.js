"use strict";

/**
 * ORCID OAuth + Public API service.
 *
 * OAuth flow:
 *   1. Frontend redirects user to ORCID authorize URL
 *   2. ORCID redirects back with an authorization code
 *   3. Backend exchanges code for access token + authenticated ORCID iD
 *   4. Backend fetches public profile data using the ORCID iD
 *   5. Backend updates user record and returns profile data
 *
 * Env vars:
 *   ORCID_CLIENT_ID     – from ORCID developer tools
 *   ORCID_CLIENT_SECRET – from ORCID developer tools
 *   ORCID_API_URL       – defaults to https://pub.orcid.org
 *   ORCID_OAUTH_URL     – defaults to https://orcid.org (use https://sandbox.orcid.org for dev)
 *   NEXT_PUBLIC_FRONTEND_URL – frontend base URL for redirect
 */

const ORCID_API_URL = () =>
  process.env.ORCID_API_URL || "https://pub.orcid.org";

const ORCID_OAUTH_URL = () =>
  process.env.ORCID_OAUTH_URL || "https://orcid.org";

/**
 * Validate ORCID iD format (0000-0000-0000-000X)
 */
function isValidOrcidFormat(orcidId) {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcidId);
}

/**
 * Build the ORCID OAuth authorization URL.
 * @param {string} redirectUri – the callback URL
 * @param {string} state – opaque state parameter (e.g. JWT or user identifier)
 */
function buildAuthorizeUrl(redirectUri, state) {
  const clientId = process.env.ORCID_CLIENT_ID;
  if (!clientId) {
    throw new Error("ORCID_CLIENT_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "/authenticate",
    redirect_uri: redirectUri,
    state,
  });

  return `${ORCID_OAUTH_URL()}/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange an authorization code for an access token and authenticated ORCID iD.
 * Returns { accessToken, orcidId, name } or throws on error.
 */
async function exchangeCode(code, redirectUri) {
  const clientId = process.env.ORCID_CLIENT_ID;
  const clientSecret = process.env.ORCID_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("ORCID OAuth credentials are not configured");
  }

  const res = await fetch(`${ORCID_OAUTH_URL()}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    strapi.log.error(`ORCID token exchange failed (${res.status}): ${text}`);
    throw new Error("Failed to exchange ORCID authorization code");
  }

  const data = await res.json();

  return {
    accessToken: data.access_token,
    orcidId: data.orcid,
    name: data.name,
  };
}

/**
 * Fetch a section of the ORCID public profile.
 * @param {string} orcidId – e.g. "0000-0002-1825-0097"
 * @param {string} section – e.g. "person", "educations", "employments"
 */
async function fetchSection(orcidId, section) {
  const url = `${ORCID_API_URL()}/v3.0/${orcidId}/${section}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    strapi.log.warn(
      `ORCID fetch ${section} failed (${res.status}): ${await res.text()}`,
    );
    return null;
  }

  return res.json();
}

/**
 * Validate an ORCID iD exists and fetch public profile data.
 * Returns null if the ORCID iD is not found.
 */
async function validateAndFetch(orcidId) {
  if (!isValidOrcidFormat(orcidId)) {
    throw new Error(
      "Invalid ORCID format. Expected: 0000-0000-0000-0000",
    );
  }

  const [person, educations, employments] = await Promise.all([
    fetchSection(orcidId, "person"),
    fetchSection(orcidId, "educations"),
    fetchSection(orcidId, "employments"),
  ]);

  // If person is null, the ORCID doesn't exist
  if (!person) return null;

  const result = { orcidId };

  // Name
  const givenName = person?.name?.["given-names"]?.value;
  const familyName = person?.name?.["family-name"]?.value;
  if (givenName) result.firstName = givenName;
  if (familyName) result.lastName = familyName;
  if (givenName || familyName) {
    result.fullName = [givenName, familyName].filter(Boolean).join(" ");
  }

  // Biography
  if (person?.biography?.content) {
    result.biography = person.biography.content;
  }

  // Keywords -> interests
  if (person?.keywords?.keyword?.length) {
    result.interests = person.keywords.keyword.map((k) => k.content);
  }

  // Country
  if (person?.addresses?.address?.length) {
    result.country = person.addresses.address[0].country;
  }

  // Latest education
  const eduGroups = educations?.group || [];
  const eduSummaries = eduGroups.flatMap(
    (g) =>
      g["education-summary"] ||
      g.summaries?.map((s) => s["education-summary"]) ||
      [],
  );
  if (eduSummaries.length) {
    const latest = eduSummaries[0];
    result.education = {
      institution: latest.organization?.name || "",
      degree: latest["role-title"] || "",
      department: latest["department-name"] || "",
    };
  }

  // Latest employment -> institution & position
  const empGroups = employments?.group || [];
  const empSummaries = empGroups.flatMap(
    (g) =>
      g["employment-summary"] ||
      g.summaries?.map((s) => s["employment-summary"]) ||
      [],
  );
  if (empSummaries.length) {
    const latest = empSummaries[0];
    result.institution = latest.organization?.name || "";
    result.position = latest["role-title"] || "";
  }

  return result;
}

module.exports = {
  isValidOrcidFormat,
  buildAuthorizeUrl,
  exchangeCode,
  validateAndFetch,
};
