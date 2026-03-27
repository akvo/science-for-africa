"use strict";

/**
 * `two-factor-lock` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // 1. Pre-processing Guard: Manual JWT check for Partial JWTs
    const authHeader = ctx.header.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const decoded =
          await strapi.plugins["users-permissions"].services.jwt.verify(token);

        if (decoded && decoded.partial === true) {
          const allowedPaths = [
            "/api/auth/2fa/verify",
            "/api/auth/2fa/status",
            "/api/auth/2fa/login",
            "/api/auth/local",
            "/_health",
          ];

          const isAllowed = allowedPaths.some((path) =>
            ctx.path.startsWith(path),
          );

          if (!isAllowed) {
            return ctx.forbidden(
              "Two-factor authentication required. Please verify your TOTP code.",
            );
          }
        }
      } catch (err) {
        // Invalid JWT will be handled by Strapi's own auth later
      }
    }

    // 2. Execute original request
    await next();

    // 3. Post-processing Interceptor (for Login)
    if (
      (ctx.path === "/api/auth/local" || ctx.path === "/api/auth/local/") &&
      ctx.method === "POST" &&
      ctx.status === 200 &&
      ctx.body.user &&
      ctx.body.jwt
    ) {
      const { user } = ctx.body;

      if (user.twoFactorEnabled) {
        const partialJwt = strapi
          .service("api::auth.auth")
          .issuePartialToken(user);

        ctx.body = {
          jwt: partialJwt,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          requires2FA: true,
        };
      }
    }
  };
};
