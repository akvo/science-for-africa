"use strict";

/**
 * auth controller
 */

module.exports = ({ strapi }) => ({
  /**
   * Verifies the user's email using a 6-digit OTP code
   */
  async verifyOtp(ctx) {
    const { email, otpCode } = ctx.request.body;

    if (!email || !otpCode) {
      return ctx.badRequest("Email and OTP code are required.");
    }

    strapi.log.debug(
      `Attempting OTP verification for: ${email} with code: ${otpCode}`,
    );

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          email: email.toLowerCase(),
          otpCode,
          otpExpiration: { $gt: new Date() },
        },
      });

    if (!user) {
      strapi.log.warn(
        `OTP verification failed for: ${email}. User not found or code invalid/expired.`,
      );
      return ctx.badRequest("Invalid or expired OTP code.");
    }

    strapi.log.info(
      `OTP verification success for: ${email}. Confirming user...`,
    );

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: {
        confirmed: true,
        verificationStatus: "verified",
        confirmationToken: null,
        otpCode: null,
        otpExpiration: null,
      },
    });

    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    return {
      success: true,
      message: "Email verified successfully.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        confirmed: true,
      },
      jwt,
    };
  },

  /**
   * Resends the OTP verification code with rate limiting
   */
  async resendOtp(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest("Email is required.");
    }

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: email.toLowerCase() },
      });

    if (!user) {
      return ctx.badRequest("User not found.");
    }

    if (user.confirmed) {
      return ctx.badRequest("This account is already verified.");
    }

    const now = new Date();

    if (user.lastOtpSentAt) {
      const lastSent = new Date(user.lastOtpSentAt);
      const diffSeconds = Math.floor(
        (now.getTime() - lastSent.getTime()) / 1000,
      );
      if (diffSeconds < 60) {
        return ctx.send(
          {
            error: `Please wait ${60 - diffSeconds} seconds before resending.`,
          },
          429,
        );
      }
    }

    let resendCount = user.otpResendCount || 0;
    let windowStart = user.otpResendWindowStart
      ? new Date(user.otpResendWindowStart)
      : now;

    if (now.getTime() - windowStart.getTime() > 60 * 60 * 1000) {
      resendCount = 0;
      windowStart = now;
    }

    if (resendCount >= 3) {
      strapi.log.warn(`Resend limit reached for: ${email}`);
      return ctx.send(
        { error: "Maximum resend attempts reached. Try again in 1 hour." },
        429,
      );
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(now.getTime() + 60 * 60 * 1000);

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: {
        otpCode: newOtpCode,
        otpExpiration: expiration,
        lastOtpSentAt: now,
        otpResendCount: resendCount + 1,
        otpResendWindowStart: windowStart,
      },
    });

    try {
      const settings = await strapi
        .store({ type: "plugin", name: "users-permissions", key: "email" })
        .get();

      strapi.log.debug(
        `Sending resend-otp email to: ${user.email} with code: ${newOtpCode}`,
      );
      const confirmationTemplate = settings.email_confirmation;

      await strapi
        .plugin("email")
        .service("email")
        .sendTemplatedEmail(
          {
            to: user.email,
            from: confirmationTemplate.options.from.email,
          },
          {
            subject: confirmationTemplate.options.object,
            html: confirmationTemplate.options.message,
            text: confirmationTemplate.options.message.replace(
              /<[^>]*>?/gm,
              "",
            ),
          },
          {
            USER: user,
            CODE: user.confirmationToken,
            OTP_CODE: newOtpCode,
          },
        );
    } catch (err) {
      strapi.log.error("Failed to send resend-otp email: " + err.message);
    }

    return {
      success: true,
      message: "A new verification code has been sent to your email.",
    };
  },

  /**
   * Checks the registration/verification status of an email
   */
  async registrationStatus(ctx) {
    const { email } = ctx.query;

    if (!email) {
      return ctx.badRequest("Email is required.");
    }

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: email.toLowerCase() },
      });

    if (!user) {
      return ctx.notFound("User not found.");
    }

    return {
      email: user.email,
      confirmed: user.confirmed,
    };
  },
});
