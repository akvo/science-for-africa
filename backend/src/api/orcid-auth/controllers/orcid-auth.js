"use strict";

const REDIRECT_PATH = "/auth/orcid/callback";

function getRedirectUri() {
  const frontendUrl = (
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${frontendUrl}${REDIRECT_PATH}`;
}

module.exports = {
  /**
   * GET /api/orcid-auth/authorize
   * Query: ?returnTo=onboarding|profile
   *
   * Returns the ORCID OAuth authorization URL. The frontend redirects the
   * user's browser to this URL to begin the OAuth flow.
   */
  async authorize(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const returnTo = ctx.query.returnTo || "profile";

    try {
      const orcidService = strapi.service("api::orcid-auth.orcid-auth");
      const redirectUri = getRedirectUri();

      // Encode user id and returnTo in state so callback knows context
      const state = Buffer.from(
        JSON.stringify({ userId: user.id, documentId: user.documentId, returnTo }),
      ).toString("base64url");

      const authorizeUrl = orcidService.buildAuthorizeUrl(redirectUri, state);

      return { data: { authorizeUrl } };
    } catch (error) {
      strapi.log.error("ORCID authorize error:", error.message);
      return ctx.badRequest(error.message);
    }
  },

  /**
   * POST /api/orcid-auth/callback
   * Body: { code, state }
   *
   * Exchanges the authorization code for a token, fetches profile data,
   * updates the user record, and returns the profile + returnTo destination.
   */
  async callback(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { code, state } = ctx.request.body;

    if (!code) {
      return ctx.badRequest("Missing authorization code.");
    }

    try {
      const orcidService = strapi.service("api::orcid-auth.orcid-auth");
      const redirectUri = getRedirectUri();

      // Decode state
      let returnTo = "profile";
      if (state) {
        try {
          const parsed = JSON.parse(
            Buffer.from(state, "base64url").toString(),
          );
          returnTo = parsed.returnTo || "profile";
        } catch {
          // ignore parse errors, use default
        }
      }

      // Exchange code for token + authenticated ORCID iD
      const tokenData = await orcidService.exchangeCode(code, redirectUri);
      const { orcidId } = tokenData;

      if (!orcidId) {
        return ctx.badRequest("ORCID authentication failed — no ORCID iD returned.");
      }

      // Fetch full profile from public API
      const profile = await orcidService.validateAndFetch(orcidId);

      // Update user record
      const updateData = {
        orcidId,
        verified: true,
      };

      if (profile) {
        if (profile.firstName) updateData.firstName = profile.firstName;
        if (profile.lastName) updateData.lastName = profile.lastName;
        if (profile.fullName) updateData.fullName = profile.fullName;
        if (profile.biography) updateData.biography = profile.biography;
        if (profile.position) updateData.position = profile.position;

        if (profile.interests && Array.isArray(profile.interests)) {
          updateData.interests = profile.interests
            .slice(0, 5)
            .map((name) => ({ name }));
        }
      }

      await strapi.documents("plugin::users-permissions.user").update({
        documentId: user.documentId,
        data: updateData,
      });

      return {
        data: {
          ...(profile || {}),
          orcidId,
          verified: true,
          returnTo,
        },
      };
    } catch (error) {
      strapi.log.error("ORCID callback error:", error.message);
      return ctx.badRequest(error.message);
    }
  },

  /**
   * POST /api/orcid-auth/validate (legacy — public API only, no OAuth)
   * Body: { orcidId: "0000-0002-1825-0097" }
   */
  async validate(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { orcidId } = ctx.request.body;
    if (!orcidId) {
      return ctx.badRequest("Missing orcidId.");
    }

    try {
      const orcidService = strapi.service("api::orcid-auth.orcid-auth");
      const profile = await orcidService.validateAndFetch(orcidId);

      if (!profile) {
        return ctx.notFound("ORCID iD not found. Please check and try again.");
      }

      const updateData = {
        orcidId,
        verified: true,
      };

      if (profile.firstName) updateData.firstName = profile.firstName;
      if (profile.lastName) updateData.lastName = profile.lastName;
      if (profile.fullName) updateData.fullName = profile.fullName;
      if (profile.biography) updateData.biography = profile.biography;
      if (profile.position) updateData.position = profile.position;

      if (profile.interests && Array.isArray(profile.interests)) {
        updateData.interests = profile.interests
          .slice(0, 5)
          .map((name) => ({ name }));
      }

      await strapi.documents("plugin::users-permissions.user").update({
        documentId: user.documentId,
        data: updateData,
      });

      return { data: { ...profile, verified: true } };
    } catch (error) {
      strapi.log.error("ORCID validate error:", error.message);
      return ctx.badRequest(error.message);
    }
  },
};
