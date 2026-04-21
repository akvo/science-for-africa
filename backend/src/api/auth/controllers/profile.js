"use strict";

/**
 * profile controller
 */

module.exports = ({ strapi }) => ({
  /**
   * Updates the profile of the currently authenticated user
   */
  async findUsers(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: [
            "id",
            "email",
            "fullName",
            "firstName",
            "lastName",
            "position",
            "roleType",
          ],
          populate: ["institution"],
          pagination: { pageSize: 100 },
        },
      );

      return users;
    } catch (error) {
      strapi.log.error("FindUsers Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },

  async update(ctx) {
    const user = ctx.state.user;
    const body = ctx.request.body;

    if (!user) {
      return ctx.unauthorized();
    }

    // Whitelist allowed fields to prevent arbitrary updates
    const allowedFields = [
      "displayName",
      "biography",
      "firstName",
      "lastName",
      "fullName",
      "position",
      "interests",
      "educationTopic",
      "educationLevel",
      "languagePreferences",
      "orcidId",
      "socialLinks",
      "profilePhoto",
      "pageCover",
      "institution",
      "onboardingComplete",
      "userType",
      "institutionName",
      "educationInstitutionName",
    ];

    const data = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    });

    // Validation: Biography character limit (Baseline UAC Requirement)
    if (data.biography && data.biography.length > 275) {
      return ctx.badRequest("Biography must be 275 characters or less.");
    }

    try {
      const updatedUser = await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data,
          populate: ["institution", "interests", "profilePhoto", "pageCover"],
        },
      );

      return updatedUser;
    } catch (error) {
      strapi.log.error("UpdateMe Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },
});
