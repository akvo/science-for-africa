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

    // If 2FA is required, the backend returns a custom object { requires2FA: true, email: ... }
    if (result && result.requires2FA) {
      return result;
    }

    return result;
  } catch (error) {
    console.error("Error during login:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
