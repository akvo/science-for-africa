const API_URL =
  (typeof window !== "undefined" && window.__ENV?.NEXT_PUBLIC_BACKEND_URL) ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:1337/api";

export async function fetchFromStrapi(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching from Strapi:", error);
    return null;
  }
}

export async function postToStrapi(endpoint, data, wrapInData = true) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wrapInData ? { data } : data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error:
          errorData.error?.message || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error posting to Strapi:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData) {
  // Auth endpoints in Strapi do not use the { data: ... } wrapper
  return postToStrapi("/auth/local/register", userData, false);
}

/**
 * Resend email confirmation
 */
export async function resendVerification(email) {
  return postToStrapi("/auth/send-email-confirmation", { email }, false);
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(token) {
  try {
    const response = await fetch(
      `${API_URL}/auth/email-confirmation?confirmation=${token}`,
      { redirect: "manual" },
    );

    // With redirect: 'manual', a 302 redirect results in a response with status 0 and type 'opaqueredirect'
    // or an actual 302 if it's same-origin. Strapi redirects ONLY after successful verification.
    if (
      response.type === "opaqueredirect" ||
      response.status === 0 ||
      (response.status >= 300 && response.status < 400)
    ) {
      return { success: true };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error:
          errorData.error?.message || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // If it's successful but not JSON (e.g. redirected to an HTML page),
    // it usually means success in Strapi's email confirmation flow.
    return { success: true };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Login a user
 */
export async function loginUser(credentials) {
  // credentials: { identifier, password }
  try {
    const result = await postToStrapi("/auth/local", credentials, false);

    return result;
  } catch (error) {
    console.error("Error during login:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

/**
 * Transforms frontend onboarding data to match backend schema contract
 */
export function transformProfileUpdatePayload(userData) {
  const data = { ...userData };

  // 1. Map Interests: array of strings -> component objects [{name: "string"}]
  if (data.interests && Array.isArray(data.interests)) {
    data.interests = data.interests.map((item) =>
      typeof item === "string" ? { name: item } : item,
    );
  }

  // 2. Map Affiliation Institution: {id, name} -> institution (relation ID) or institutionName (string)
  if (data.affiliationInstitution) {
    if (data.affiliationInstitution.id) {
      data.institution = data.affiliationInstitution.id;
    } else if (data.affiliationInstitution.name) {
      data.institutionName = data.affiliationInstitution.name;
    }
    delete data.affiliationInstitution;
  }

  // 3. Map Education Institution: {id, name} -> educationInstitutionName (string)
  if (data.educationInstitution && data.educationInstitution.name) {
    data.educationInstitutionName = data.educationInstitution.name;
    delete data.educationInstitution;
  }

  // 4. Type-Specific Cleanup for Institutions
  // Institutions skip the Career and ORCID steps, so we should NOT send these fields
  if (data.userType === "institution") {
    delete data.educationLevel;
    delete data.educationTopic;
    delete data.educationInstitutionName;
    delete data.orcidId;
    delete data.position; // Position is also an individual field in Step 3
  }

  // 5. Universal Sanitization: Remove any remaining empty strings
  // This prevents Strapi from failing on optional enums or regex fields
  Object.keys(data).forEach((key) => {
    if (data[key] === "") {
      delete data[key];
    }
  });

  // 6. Ensure onboardingComplete is explicitly handled
  if (data.onboardingComplete === undefined) {
    data.onboardingComplete = true;
  }

  return data;
}

/**
 * Update authenticated user profile
 */
export async function updateUserProfile(userData, token) {
  try {
    const payload = transformProfileUpdatePayload(userData);

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error:
          errorData.error?.message || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
