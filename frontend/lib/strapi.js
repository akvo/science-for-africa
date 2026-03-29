const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337/api";

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
    );
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
    console.error("Error verifying email:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

