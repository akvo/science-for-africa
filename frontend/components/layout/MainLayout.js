import React, { useEffect } from "react";
import { useRouter } from "next/router";
import AppLayout from "./AppLayout";
import AuthLayout from "./AuthLayout";
import Meta from "../seo/Meta";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

/**
 * MainLayout Component
 *
 * Automatically switches between Standard App Layout and Auth Layout
 * based on the current route.
 */
const MainLayout = ({
  children,
  title,
  description,
  noContainer,
  showFooter,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Sync display language with user's language preference on load
  useEffect(() => {
    if (
      isAuthenticated &&
      user?.languagePreferences &&
      user.languagePreferences !== router.locale
    ) {
      const { pathname, query, asPath } = router;
      router.replace({ pathname, query }, asPath, {
        locale: user.languagePreferences,
      });
    }
  }, [isAuthenticated, user?.languagePreferences]);

  useEffect(() => {
    // 1. Guard for Authenticated Users accessing Auth pages (login/signup/onboarding)
    if (isAuthenticated && user?.onboardingComplete) {
      if (
        router.pathname === "/login" ||
        router.pathname === "/signup" ||
        router.pathname === "/onboarding"
      ) {
        router.push("/");
        return;
      }
    }

    // 2. Guard for Authenticated Users who haven't completed onboarding
    if (
      isAuthenticated &&
      !user?.onboardingComplete &&
      !router.pathname.startsWith("/auth") &&
      router.pathname !== "/onboarding" &&
      router.pathname !== "/login" &&
      router.pathname !== "/signup"
    ) {
      router.push("/onboarding");
    }

    // 3. Guard for Unauthenticated Users accessing Onboarding
    if (!isAuthenticated && router.pathname === "/onboarding") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router.pathname, router]);

  // 4. Session Timeout Idle Detection
  useEffect(() => {
    if (!isAuthenticated) return;

    // Reset last active on mount/boot
    useAuthStore.getState().updateLastActive();

    let lastUpdate = 0;
    const handleActivity = () => {
      const now = Date.now();
      // Throttle Zustand updates to once every 10 seconds to reduce rendering overhead
      if (now - lastUpdate > 10 * 1000) {
        lastUpdate = now;
        useAuthStore.getState().updateLastActive();
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const idleTimeoutMinutes = parseInt(
      process.env.NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MINUTES || "30",
      10
    );
    const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;

    const interval = setInterval(() => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) return;

      const now = Date.now();
      if (state.lastActive && now - state.lastActive > idleTimeoutMs) {
        state.logout();
        toast.error("Your session has expired due to inactivity. Please log in again.");
        router.push("/login?reason=expired");
      }
    }, 10 * 1000); // Check every 10 seconds

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated, router]);

  // Define routes that use the specialized AuthLayout
  // login, signup, forget password, 2fa, etc.
  const isAuthRoute =
    router.pathname.startsWith("/auth") ||
    ["/login", "/signup", "/onboarding"].includes(router.pathname);

  // Don't render auth pages for authenticated users — show nothing while redirecting
  if (
    isAuthRoute &&
    isAuthenticated &&
    user?.onboardingComplete &&
    (router.pathname === "/login" ||
      router.pathname === "/signup" ||
      router.pathname === "/onboarding")
  ) {
    return null;
  }

  if (isAuthRoute) {
    // Map paths to auth steps
    const stepMap = {
      "/signup": 1,
      "/login": 1,
      "/auth/verify-email": 2,
      "/auth/two-factor": 3,
    };
    const activeStep = stepMap[router.pathname] || 1;

    return <AuthLayout activeStep={activeStep}>{children}</AuthLayout>;
  }

  return (
    <AppLayout noContainer={noContainer} showFooter={showFooter}>
      <Meta title={title} description={description} />
      {children}
    </AppLayout>
  );
};

export default MainLayout;
