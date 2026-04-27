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
      },
    },
    {
      method: "GET",
      path: "/auth/me",
      handler: "profile.getMe",
      config: {
        description: "Get current user profile with population",
      },
    },
    {
      method: "POST",
      path: "/auth/verify-otp",
      handler: "auth.verifyOtp",
      config: {
        auth: false,
        description: "Verify user email via OTP",
      },
    },
    {
      method: "POST",
      path: "/auth/resend-otp",
      handler: "auth.resendOtp",
      config: {
        auth: false,
        description: "Verify user email via OTP",
      },
    },
    {
      method: "GET",
      path: "/auth/registration-status",
      handler: "auth.registrationStatus",
      config: {
        auth: false,
        description: "Check if an email is already verified",
      },
    },
    {
      method: "GET",
      path: "/auth/users",
      handler: "profile.findUsers",
      config: {
        description: "List users for mentor assignment",
      },
    },
  ],
};
