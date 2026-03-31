"use strict";

const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

/**
 * auth service
 */

module.exports = ({ strapi }) => ({
  /**
   * Generates a new 2FA secret for a user
   */
  async generateSecret(user) {
    const appName = strapi.config.get("server.appName", "Science for Africa");
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${appName}:${user.email}`,
      issuer: appName,
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32, // Store the base32 version
      qrCodeUrl,
    };
  },

  /**
   * Verifies a TOTP code against a secret
   */
  verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1, // Allow for 30s clock drift
    });
  },

  /**
   * Issues a full access JWT after successful 2FA
   */
  async issueFullToken(user) {
    return strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });
  },

  /**
   * Issues a partial JWT after password login
   */
  issuePartialToken(user) {
    return strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
      partial: true,
    });
  },
});
