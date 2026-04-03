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
    // We use apiClient here. If it redirects, axios will follow.
    // If it succeeds (200), we return the data or a success flag.
    const response = await apiClient.get(
      `/auth/email-confirmation?confirmation=${token}`,
    );

    // Strapi might return a result or just redirect.
    // If axios followed the redirect and got a 200, it's a success.
    return response.data || { success: true };
  } catch (error) {
    // If it's a redirect that axios couldn't handle or a real error:
    console.error("Error verifying email:", error);
    return error;
  }
}

/**
 * Login a user
 */
export async function loginUser(credentials) {
  return postToStrapi("/auth/local", credentials, false);
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
