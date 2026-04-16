"use strict";

/**
 * auth routes
 */

module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/auth/me",
      handler: "profile.update",
      config: {
        description: "Update current user profile",
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/verify-otp",
      handler: "auth.verifyOtp",
      config: {
        auth: false,
        description: "Verify user email via OTP",
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/resend-otp",
      handler: "auth.resendOtp",
      config: {
        auth: false,
        description: "Resend email verification OTP",
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/auth/registration-status",
      handler: "auth.registrationStatus",
      config: {
        auth: false,
        description: "Check if an email is already verified",
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/auth/users",
      handler: "profile.findUsers",
      config: {
        description: "List users for mentor assignment",
        prefix: "",
      },
    },
  ],
};
