"use strict";

/**
 * community-membership controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::community-membership.community-membership",
  ({ strapi }) => ({
    /**
     * Override find to only return memberships for the current user
     */
    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      try {
        const { pagination } = ctx.query;
        const page = parseInt(pagination?.page) || 1;
        const pageSize = parseInt(pagination?.pageSize) || 6;
        const limit = pageSize;
        const start = (page - 1) * pageSize;

        const [data, total] = await Promise.all([
          strapi
            .documents("api::community-membership.community-membership")
            .findMany({
              filters: {
                user: { id: user.id },
              },
              populate: {
                community: {
                  populate: {
                    parent: true,
                    subCommunities: true,
                    moderators: true,
                    createdByUser: true,
                  },
                },
              },
              status: "published",
              limit,
              start,
            }),
          strapi
            .documents("api::community-membership.community-membership")
            .count({
              filters: {
                user: { id: user.id },
              },
              status: "published",
            }),
        ]);

        const pageCount = Math.ceil(total / pageSize);

        return {
          data,
          meta: {
            pagination: {
              page,
              pageSize,
              pageCount,
              total,
            },
          },
        };
      } catch (err) {
        strapi.log.error(`[DEBUG] find error: ${err.message}`);
        return ctx.badRequest(err.message);
      }
    },

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
        // Find the membership for this user and community
        const memberships = await strapi
          .documents("api::community-membership.community-membership")
          .findMany({
            filters: {
              user: { id: user.id },
              community: {
                $or: [{ documentId: id }, { id: id }],
              },
            },
            status: "published",
          });

        if (!memberships || memberships.length === 0) {
          return ctx.notFound("Membership not found");
        }

        const membership = memberships[0];

        // Delete the membership
        await strapi
          .documents("api::community-membership.community-membership")
          .delete({
            documentId: membership.documentId,
          });

        return { success: true };
      } catch (err) {
        strapi.log.error(`[DEBUG] leave error: ${err.message}`);
        return ctx.badRequest(err.message);
      }
    },
  }),
);
