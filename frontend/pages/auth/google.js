import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/lib/auth-store";
import axios from "axios";

const GoogleCallback = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const { access_token, id_token, jwt: jwtParam } = router.query;

      // Try different parameter names that Strapi might use
      const jwt = access_token || id_token || jwtParam;

      if (!jwt) {
        return;
      }

      try {
        // Fetch user info to verify and check onboarding status
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337/api"}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        );

        const user = response.data;

        // Save auth state (automatically persistent for Google)
        setAuth(user, jwt, true); // Added true for isPersistent

        // Redirect based on onboarding status
        if (user.onboardingComplete) {
          router.push("/");
        } else {
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Google authentication failed:", error);
        router.push("/login?error=google_auth_failed");
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          Authenticating with Google...
        </h1>
        <p className="text-brand-gray-500 mt-2">
          Please wait while we set up your session.
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
