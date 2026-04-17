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
const MainLayout = ({ children, title, description }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // 1. Guard for Authenticated Users accessing Onboarding
    if (
      isAuthenticated &&
      user?.onboardingComplete &&
      router.pathname === "/onboarding"
    ) {
      router.push("/");
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
  }, [isAuthenticated, user, router.pathname, router]);

  // Define routes that use the specialized AuthLayout
  // login, signup, forget password, 2fa, etc.
  const isAuthRoute =
    router.pathname.startsWith("/auth") ||
    ["/login", "/signup", "/onboarding"].includes(router.pathname);

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
    <AppLayout>
      <Meta title={title} description={description} />
      {children}
    </AppLayout>
  );
};

export default MainLayout;
