import React, { useEffect } from "react";
import { useRouter } from "next/router";
import AppLayout from "./AppLayout";
import AuthLayout from "./AuthLayout";
import Meta from "../seo/Meta";
import { useAuthStore } from "@/lib/auth-store";

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
