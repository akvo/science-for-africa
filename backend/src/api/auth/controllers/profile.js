"use strict";

/**
 * profile controller
 */

module.exports = ({ strapi }) => ({
  /**
   * Returns the profile of the currently authenticated user with deep population
   */
  async getMe(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const fullUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        user.id,
        {
          populate: {
            institution: true,
            interests: true,
            profilePhoto: true,
            pageCover: true,
            memberships: {
              populate: {
                community: true,
              },
            },
          },
        },
      );

      // Manually fetch collaboration invites since programmatic relations can be tricky for population
      const invites = await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .findMany({
          filters: {
            invitedUser: user.id,
            inviteStatus: "Accepted",
          },
          populate: ["collaborationCall"],
          status: "published",
        });

      fullUser.collaborationInvites = invites;

      return fullUser;
    } catch (error) {
      strapi.log.error("GetMe Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },

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
