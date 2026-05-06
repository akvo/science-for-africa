"use strict";

module.exports = {
  /**
   * POST /api/orcid-auth/validate
   * Body: { orcidId: "0000-0002-1825-0097" }
   *
   * Validates the ORCID iD against the public API, fetches profile data,
   * updates the user record, and returns the profile payload.
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

      // Update user record
      const updateData = {
        orcidId,
        verified: true,
      };

      if (profile.firstName) updateData.firstName = profile.firstName;
      if (profile.lastName) updateData.lastName = profile.lastName;
      if (profile.fullName) updateData.fullName = profile.fullName;
      if (profile.biography) updateData.biography = profile.biography;
      if (profile.position) updateData.position = profile.position;

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
