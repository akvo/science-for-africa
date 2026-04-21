"use strict";

/**
 * community-membership controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::community-membership.community-membership",
  ({ strapi }) => ({
    /**
     * Custom leave action for the current user
     */
    async leave(ctx) {
      const { id } = ctx.params; // community documentId (v5) or id
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      try {
        // Find the membership for this user and this community
        // In v5, we often use filters on relations
        const memberships = await strapi
          .documents("api::community-membership.community-membership")
          .findMany({
            filters: {
              user: { id: user.id },
              community: {
                $or: [{ id: id }, { documentId: id }],
              },
            },
            status: "published",
          });

        if (memberships.length === 0) {
          return ctx.notFound("Membership not found");
        }

        // Delete the membership(s)
        for (const membership of memberships) {
          await strapi
            .documents("api::community-membership.community-membership")
            .delete({
              documentId: membership.documentId,
            });
        }

        // Optional: Decrement community member count (can also be done in lifecycle)

        return { success: true };
      } catch (error) {
        strapi.log.error("LeaveCommunity Error: " + error.message);
        return ctx.internalServerError(error.message);
      }
    },
  }),
);
