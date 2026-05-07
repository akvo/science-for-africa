"use strict";

/**
 * ORCID Public API service.
 * Validates an ORCID iD and fetches public profile data.
 * No OAuth or user login required — uses the public API.
 *
 * Optional env:
 *   ORCID_API_URL – defaults to https://pub.orcid.org
 */

const ORCID_API_URL = () =>
  process.env.ORCID_API_URL || "https://pub.orcid.org";

/**
 * Validate ORCID iD format (0000-0000-0000-000X)
 */
function isValidOrcidFormat(orcidId) {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcidId);
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
  validateAndFetch,
};
