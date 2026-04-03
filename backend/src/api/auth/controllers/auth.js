"use strict";

/**
 * auth controller
 */

module.exports = ({ strapi }) => ({
  /**
   * Generates 2FA registration secret and QR code for the authenticated user
   */
  async generate2FA(ctx) {
    const user = ctx.state.user;

    if (user.twoFactorEnabled) {
      return ctx.badRequest("Two-factor authentication is already enabled");
    }

    const { secret, qrCodeUrl } = await strapi
      .service("api::auth.auth")
      .generateSecret(user);

    // Save the secret temporarily to the user (not enabled yet)
    await strapi.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return { qrCodeUrl };
  },

  /**
   * Verifies and enables 2FA for the authenticated user
   */
  async verify2FA(ctx) {
    const { code } = ctx.request.body;

    if (!code) {
      return ctx.badRequest("Verification code is required");
    }

    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { id: ctx.state.user.id },
      select: ["id", "twoFactorSecret"],
    });

    if (!user.twoFactorSecret) {
      return ctx.badRequest("2FA secret has not been generated");
    }

    const isTokenValid = strapi
      .service("api::auth.auth")
      .verifyToken(code, user.twoFactorSecret);

    if (!isTokenValid) {
      return ctx.badRequest("Invalid 2FA code");
    }

    // Enable 2FA for the user
    await strapi.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return {
      success: true,
      message: "Two-factor authentication enabled successfully",
    };
  },

  /**
   * Step 2 login: Verify TOTP code and issue full JWT
   */
  async login2FA(ctx) {
    const { code } = ctx.request.body;

    if (!code) {
      return ctx.badRequest("Verification code is required");
    }

    // Since users are already authenticated with a partial JWT,
    // ctx.state.user is already populated, but we need the secret.
    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { id: ctx.state.user.id },
      select: ["id", "twoFactorSecret", "twoFactorEnabled"],
    });

    if (!user || !user.twoFactorEnabled) {
      return ctx.badRequest(
        "Two-factor authentication is not enabled for this account",
      );
    }

    const isTokenValid = strapi
      .service("api::auth.auth")
      .verifyToken(code, user.twoFactorSecret);

    if (!isTokenValid) {
      return ctx.badRequest("Invalid 2FA code");
    }

    // Issue a FULL access token
    const fullJwt = await strapi.service("api::auth.auth").issueFullToken(user);

    return {
      jwt: fullJwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  },

  /**
   * Get 2FA Status for the authenticated user
   */
  async getStatus(ctx) {
    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { id: ctx.state.user.id },
      select: ["twoFactorEnabled"],
    });

    return {
      enabled: !!user.twoFactorEnabled,
    };
  },

  /**
   * Updates the profile of the currently authenticated user
   * Expects a payload that already matches the backend schema (Flattened DTO)
   */
  async updateMe(ctx) {
    const user = ctx.state.user;
    const body = ctx.request.body;

    if (!user) {
      return ctx.unauthorized();
    }

    // Update the user using the entityService.
    // We expect the payload to be already transformed by the frontend.
    try {
      const updatedUser = await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: body,
          populate: ["institution", "interests"],
        },
      );

      return updatedUser;
    } catch (error) {
      strapi.log.error("UpdateMe Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },
});
