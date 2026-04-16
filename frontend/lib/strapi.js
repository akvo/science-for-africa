import apiClient from "./api-client";

/**
 * Fetch data from Strapi
 */
export async function fetchFromStrapi(endpoint) {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching from Strapi:", error);
    return null;
  }
}

/**
 * Post data to Strapi
 */
export async function postToStrapi(endpoint, data, wrapInData = true) {
  try {
    const payload = wrapInData ? { data } : data;
    const response = await apiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    // apiClient interceptor already transforms the error
    console.error("Error posting to Strapi:", error);
    return error;
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData) {
  return postToStrapi("/auth/local/register", userData, false);
}

/**
 * Login a user
 */
export async function loginUser(credentials) {
  return postToStrapi("/auth/local", credentials, false);
}

/**
 * Send password reset email
 */
export async function forgotPassword(email) {
  return postToStrapi("/auth/forgot-password", { email }, false);
}

/**
 * Reset password with code
 */
export async function resetPassword({ code, password, passwordConfirmation }) {
  return postToStrapi(
    "/auth/reset-password",
    { code, password, passwordConfirmation },
    false,
  );
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
    const response = await apiClient.get(
      `/auth/email-confirmation?confirmation=${token}`,
    );
    return response.data || { success: true };
  } catch (error) {
    console.error("Error verifying email:", error);
    return error;
  }
}

/**
 * Transforms frontend onboarding data to match backend schema contract
 */
export function transformProfileUpdatePayload(userData) {
  const data = { ...userData };

  if (data.interests && Array.isArray(data.interests)) {
    data.interests = data.interests.map((item) =>
      typeof item === "string" ? { name: item } : item,
    );
  }

  if (data.affiliationInstitution) {
    if (data.affiliationInstitution.id) {
      data.institution = data.affiliationInstitution.id;
    } else if (data.affiliationInstitution.name) {
      data.institutionName = data.affiliationInstitution.name;
    }
    delete data.affiliationInstitution;
  }

  if (data.educationInstitution && data.educationInstitution.name) {
    data.educationInstitutionName = data.educationInstitution.name;
    delete data.educationInstitution;
  }

  if (data.userType === "institution") {
    delete data.educationLevel;
    delete data.educationTopic;
    delete data.educationInstitutionName;
    delete data.orcidId;
    delete data.position;
  }

  Object.keys(data).forEach((key) => {
    if (data[key] === "") {
      delete data[key];
    }
  });

  if (data.onboardingComplete === undefined) {
    data.onboardingComplete = true;
  }

  return data;
}

/**
 * Create a collaboration call with invites
 */
export async function createCollaborationCall(payload) {
  try {
    const response = await apiClient.post(
      "/collaboration-calls/create-with-invites",
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating collaboration call:", error);
    return error;
  }
}

/**
 * Fetch all communities (with sub-communities populated)
 */
export async function fetchCommunities() {
  return fetchFromStrapi(
    "/communities?populate[subCommunities]=true&populate[parent]=true&sort=name:asc",
  );
}

/**
 * Fetch a single community by slug (with relations populated)
 */
export async function fetchCommunity(slug) {
  return fetchFromStrapi(
    `/communities?filters[slug][$eq]=${slug}&populate[subCommunities]=true&populate[parent]=true&populate[moderators]=true&populate[createdByUser]=true`,
  );
}

/**
 * Fetch collaboration calls for a given community (by community name).
 * Returns them newest-first.
 */
export async function fetchCollaborationCalls(communityName) {
  const qs = communityName
    ? `?filters[communityName][$eq]=${encodeURIComponent(communityName)}&sort=createdAt:desc`
    : `?sort=createdAt:desc`;
  return fetchFromStrapi(`/collaboration-calls${qs}`);
}

/**
 * Update authenticated user profile
 */
export async function updateUserProfile(userData) {
  try {
    const payload = transformProfileUpdatePayload(userData);
    // apiClient automatically adds the Authorization header from useAuthStore
    const response = await apiClient.put("/auth/me", payload);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return error;
  }
}
