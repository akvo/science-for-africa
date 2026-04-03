"use strict";

/**
 * auth controller
 */

module.exports = ({ strapi }) => ({
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
