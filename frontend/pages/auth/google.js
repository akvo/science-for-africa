import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/lib/auth-store";
import axios from "axios";
import Meta from "@/components/seo/Meta";
import { getBackendApiUrl } from "@/lib/url-helpers";

const GoogleCallback = ({ jwt, user, error }) => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (error) {
      console.error("[AUTH-DEBUG] Google authentication failed:", error);
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (jwt && user) {
      console.log("[AUTH-DEBUG] Session established for:", user.email);
      setAuth(user, jwt, true);

      // Redirect based on onboarding status
      if (user.onboardingComplete) {
        router.push("/");
      } else {
        router.push("/onboarding");
      }
    }
  }, [jwt, user, error, router, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Meta title={error ? "Authentication Failed" : "Authenticating..."} />
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          {error ? "Authentication Failed" : "Authenticating with Google..."}
        </h1>
        <p className="text-brand-gray-500 mt-2">
          {error
            ? "Please try again."
            : "Please wait while we set up your session."}
        </p>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { query } = context;
  const { jwt, access_token, id_token, code } = query;

  const publicBackendUrl = getBackendApiUrl();

  // Smart Swap for Docker SSR:
  // getServerSideProps runs inside the container. If the backend URL points to 'localhost',
  // it must be swapped to the internal service name 'backend' to be reachable.
  const internalBackendUrl = publicBackendUrl
    .replace("localhost", "backend")
    .replace("127.0.0.1", "backend");

  // FLOW A: We already have a JWT from a direct backend redirect (Native Strapi Handshake)
  if (jwt) {
    try {
      // Use custom /auth/me for full population (institutions, interests, etc.)
      const response = await axios.get(`${internalBackendUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      return {
        props: {
          jwt,
          user: response.data || null,
          error: null,
        },
      };
    } catch (error) {
      return {
        props: {
          error: "Failed to establish session: " + error.message,
          jwt: null,
          user: null,
        },
      };
    }
  }

  // FLOW B: Token Exchange (Legacy or Handshake-less flow)
  const tokenToExchange = access_token || id_token || code;

  if (!tokenToExchange) {
    return { props: { error: null } };
  }

  try {
    // Exchange with Strapi
    const exchangeResponse = await axios.get(
      `${internalBackendUrl}/auth/google/callback`,
      {
        params: { access_token: tokenToExchange },
      },
    );

    const { jwt: exchangedJwt } = exchangeResponse.data;

    // Follow-up fetch for full profile
    const profileResponse = await axios.get(`${internalBackendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${exchangedJwt}` },
    });

    return {
      props: {
        jwt: exchangedJwt,
        user: profileResponse.data || null,
        error: null,
      },
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message;

    console.error("[SSR-AUTH-DEBUG] Handshake failed:", errorMessage);

    return {
      props: {
        error: errorMessage,
        jwt: null,
        user: null,
      },
    };
  }
}

export default GoogleCallback;
