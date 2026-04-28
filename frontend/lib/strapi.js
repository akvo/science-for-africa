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
 * Fetch localized content from Strapi with an automatic fallback to English
 * if the requested locale returns empty results.
 */
export async function fetchLocalized(endpoint, currentLocale) {
  try {
    // 1. Try fetching with current locale
    const separator = endpoint.includes("?") ? "&" : "?";
    let response = await fetchFromStrapi(
      `${endpoint}${separator}locale=${currentLocale}`,
    );

    // 2. If empty and not 'en', fallback to 'en'
    if (
      (!response?.data ||
        (Array.isArray(response.data) && response.data.length === 0)) &&
      currentLocale !== "en"
    ) {
      console.warn(
        `No content found for locale "${currentLocale}" at ${endpoint}. Falling back to "en".`,
      );
      response = await fetchFromStrapi(`${endpoint}${separator}locale=en`);
    }

    return response;
  } catch (error) {
    console.error(`Error in fetchLocalized for ${endpoint}:`, error);
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
 * Verify email with OTP code
 */
export async function verifyOtp(email, otpCode) {
  return postToStrapi("/auth/verify-otp", { email, otpCode }, false);
}

/**
 * Resend email verification OTP
 */
export async function resendOtp(email) {
  return postToStrapi("/auth/resend-otp", { email }, false);
}

/**
 * Check registration/verification status
 */
export async function getRegistrationStatus(email) {
  try {
    const response = await apiClient.get(
      `/auth/registration-status?email=${encodeURIComponent(email)}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error checking registration status:", error);
    return error;
  }
}

/**
 * Verify email with token (link-based)
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

  // We now pass affiliationInstitution and educationInstitution as objects
  // The backend handles creation/lookup.
  // Note: OnboardingStep3 uses 'educationInstitution' in store,
  // but backend uses 'highestEducationInstitution'.
  if (data.educationInstitution) {
    data.highestEducationInstitution = data.educationInstitution;
    delete data.educationInstitution;
  }

  if (data.userType === "institution") {
    delete data.educationLevel;
    delete data.educationTopic;
    delete data.highestEducationInstitution;
    delete data.orcidId;
    delete data.position;
  }

  // Cleanup empty strings
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
 * Fetch a single community by name (exact match, relations populated).
 * Useful when we only have the community name (e.g. stored on a
 * collaboration call as a free-text `communityName`) and need the full
 * community record.
 */
export async function fetchCommunityByName(name) {
  return fetchFromStrapi(
    `/communities?filters[name][$eq]=${encodeURIComponent(name)}&populate[subCommunities]=true&populate[parent]=true&populate[moderators]=true&populate[createdByUser]=true`,
  );
}

/**
 * Join a community (authenticated)
 */
export async function joinCommunity(documentId) {
  try {
    const response = await apiClient.post(`/communities/${documentId}/join`);
    return response.data;
  } catch (error) {
    console.error("Error joining community:", error);
    return error;
  }
}

/**
 * Leave a community (authenticated)
 */
export async function leaveCommunity(documentId) {
  try {
    const response = await apiClient.post(`/communities/${documentId}/leave`);
    return response.data;
  } catch (error) {
    console.error("Error leaving community:", error);
    return error;
  }
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
 * Accept a collaboration invite by its numeric id.
 */
export async function acceptCollaborationInvite(id) {
  try {
    const response = await apiClient.post(
      `/collaboration-invites/${id}/accept`,
    );
    return response.data;
  } catch (error) {
    console.error("Error accepting collaboration invite:", error);
    return error;
  }
}

/**
 * Fetch a single collaboration call by its documentId (Strapi v5).
 * Populates createdByUser and accepted invites so the detail page can
 * render the mentor/collaborator sidebar.
 */
export async function fetchCollaborationCall(documentId) {
  return fetchFromStrapi(
    `/collaboration-calls/${documentId}?populate[createdByUser]=true&populate[invites][populate][invitedUser]=true`,
  );
}

/**
 * Fetch chat messages for a collaboration call (oldest-first).
 * Requires auth — backend filters by the call's documentId and populates
 * a safe subset of author fields.
 */
export async function fetchChatMessages(callDocumentId) {
  return fetchFromStrapi(
    `/chat-messages?filters[collaborationCall][documentId][$eq]=${encodeURIComponent(
      callDocumentId,
    )}`,
  );
}

/**
 * Post a chat message to a collaboration call. Author is derived from the
 * authenticated user server-side — never trusted from the request body.
 */
export async function postChatMessage(callDocumentId, text) {
  try {
    const response = await apiClient.post("/chat-messages", {
      data: { text, collaborationCall: callDocumentId },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting chat message:", error);
    return error;
  }
}

/**
 * Fetch resources for a community (by community documentId).
 * Optionally filter by resourceType.
 */
export async function fetchResources(communityId, resourceType) {
  let qs = `?filters[community][documentId][$eq]=${encodeURIComponent(communityId)}&populate[file]=true&populate[uploadedBy]=true&sort=createdAt:desc`;
  if (resourceType && resourceType !== "all") {
    qs += `&filters[resourceType][$eq]=${encodeURIComponent(resourceType)}`;
  }
  return fetchFromStrapi(`/resources${qs}`);
}

/**
 * Create a resource with file upload (multipart/form-data).
 * Strapi expects: data (JSON string) + files.file (the uploaded file).
 */
export async function createResource({ name, resourceType, communityId, file }) {
  const jwt = (await import("./auth-store")).useAuthStore.getState().jwt;
  const { getBackendApiUrl } = await import("./url-helpers");
  const baseUrl = getBackendApiUrl();
  const headers = { Authorization: `Bearer ${jwt}` };

  // Step 1: Upload file via Strapi's upload endpoint
  const uploadForm = new FormData();
  uploadForm.append("files", file, file.name);

  const uploadRes = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers,
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `File upload failed (${uploadRes.status})`);
  }

  const uploaded = await uploadRes.json();
  const fileId = uploaded?.[0]?.id;
  if (!fileId) throw new Error("File upload returned no file ID");

  // Step 2: Create the resource record with the uploaded file ID
  const createRes = await fetch(`${baseUrl}/resources`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        name,
        resourceType,
        file: fileId,
        community: { connect: [communityId] },
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Resource creation failed (${createRes.status})`);
  }

  return createRes.json();
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

/**
 * Fetch the current authenticated user's profile with all relations
 */
export async function fetchUserProfile() {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
