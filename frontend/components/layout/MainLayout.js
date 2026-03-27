import React from "react";
import { useRouter } from "next/router";
import AppLayout from "./AppLayout";
import AuthLayout from "./AuthLayout";

/**
 * MainLayout Component
 *
 * Automatically switches between Standard App Layout and Auth Layout
 * based on the current route.
 */
const MainLayout = ({ children }) => {
  const router = useRouter();

  // Define routes that use the specialized AuthLayout
  // login, signup, forget password, 2fa, etc.
  const isAuthRoute =
    router.pathname.startsWith("/auth") ||
    ["/login", "/signup"].includes(router.pathname);

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

  return <AppLayout>{children}</AppLayout>;
};

export default MainLayout;
