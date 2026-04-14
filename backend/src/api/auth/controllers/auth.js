"use strict";

/**
 * auth controller
 */

module.exports = ({ strapi }) => ({
  /**
   * Updates the profile of the currently authenticated user
   * Expects a payload that already matches the backend schema (Flattened DTO)
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

  async updateMe(ctx) {
    const user = ctx.state.user;
    const body = ctx.request.body;

    if (!user) {
      return ctx.unauthorized();
    }

    // Update the user using the entityService.
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
