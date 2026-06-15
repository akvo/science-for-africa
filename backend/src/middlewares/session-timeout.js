"use strict";

const crypto = require("crypto");

/**
 * `session-timeout` middleware
 */
module.exports = (config, { strapi }) => {
  const bypassPaths = [
    "/auth/local",
    "/auth/local/register",
    "/auth/verify-otp",
    "/auth/resend-otp",
    "/auth/registration-status",
    "/connect/google/callback",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/logout",
  ];

  return async (ctx, next) => {
    const authHeader = ctx.header.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const path = ctx.path.replace(/\/$/, "");
    const isBypassed = bypassPaths.some((bp) => path.endsWith(bp));

    if (isBypassed) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    let payload;

    try {
      payload =
        await strapi.plugins["users-permissions"].services.jwt.verify(token);
    } catch (err) {
      // If token signature is invalid, let users-permissions handle/reject it.
      return next();
    }

    if (!payload || !payload.id) {
      return next();
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    // Query active session
    let session = await strapi.db
      .query("api::user-session.user-session")
      .findOne({
        where: { tokenHash },
      });

    const idleTimeoutMs =
      parseInt(process.env.SESSION_IDLE_TIMEOUT_MINUTES || "30", 10) *
      60 *
      1000;
    const absoluteTimeoutMs =
      parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT_MINUTES || "1440", 10) *
      60 *
      1000;

    if (!session) {
      // Session does not exist yet (first request with a new valid JWT).
      // Create session in the database.
      await strapi.db.query("api::user-session.user-session").create({
        data: {
          tokenHash,
          user: payload.id,
          lastActivity: now,
          createdAt: now,
          ipAddress: ctx.ip,
          userAgent: ctx.headers["user-agent"] || "",
        },
      });
    } else {
      // Check idle timeout
      const lastActivity = new Date(session.lastActivity);
      if (now.getTime() - lastActivity.getTime() > idleTimeoutMs) {
        await strapi.db.query("api::user-session.user-session").delete({
          where: { id: session.id },
        });
        return ctx.unauthorized("Session expired due to inactivity.");
      }

      // Check absolute timeout
      const createdAt = new Date(session.createdAt);
      if (now.getTime() - createdAt.getTime() > absoluteTimeoutMs) {
        await strapi.db.query("api::user-session.user-session").delete({
          where: { id: session.id },
        });
        return ctx.unauthorized("Session lifetime expired.");
      }

      // Update last activity timestamp
      await strapi.db.query("api::user-session.user-session").update({
        where: { id: session.id },
        data: {
          lastActivity: now,
        },
      });
    }

    return next();
  };
};
