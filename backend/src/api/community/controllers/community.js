"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

/**
 * Augment a community entity with live counts using the community-membership
 * content type (the single source of truth for membership).
 *
 * - `posts`       → collaboration-call records referencing this community
 * - `subscribers` → number of community-membership records for this community
 * - `isMember`    → whether the current user has a membership record
 */
async function augmentWithCounts(strapi, item, userId) {
  if (!item || !item.documentId) return item;

  const postsCount = await strapi.db
    .query("api::collaboration-call.collaboration-call")
    .count({ where: { communityName: item.name } });

  const subscribersCount = await strapi.db
    .query("api::community-membership.community-membership")
    .count({ where: { community: { documentId: item.documentId } } });

  const augmented = {
    ...item,
    posts: postsCount,
    subscribers: subscribersCount,
  };

  if (userId) {
    const membership = await strapi.db
      .query("api::community-membership.community-membership")
      .findOne({
        where: {
          user: { id: userId },
          community: { documentId: item.documentId },
        },
      });
    augmented.isMember = !!membership;
  }

  return augmented;
}

module.exports = createCoreController(
  "api::community.community",
  ({ strapi }) => ({
    async find(ctx) {
      const userId = ctx.state?.user?.id;
      const response = await super.find(ctx);
      if (Array.isArray(response?.data)) {
        response.data = await Promise.all(
          response.data.map((item) => augmentWithCounts(strapi, item, userId)),
        );
      }
      return response;
    },

    async findOne(ctx) {
      const userId = ctx.state?.user?.id;
      const response = await super.findOne(ctx);
      if (response?.data) {
        response.data = await augmentWithCounts(strapi, response.data, userId);
      }
      return response;
    },

    /**
     * POST /api/communities/:id/join
     */
    async join(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const { id } = ctx.params; // community documentId

      // Verify community exists
      const community = await strapi.db
        .query("api::community.community")
        .findOne({ where: { documentId: id } });

      if (!community) return ctx.notFound("Community not found");

      // Check if already a member
      const existing = await strapi.db
        .query("api::community-membership.community-membership")
        .findOne({
          where: {
            user: { id: user.id },
            community: { documentId: id },
          },
        });

      const subscribersCount = await strapi.db
        .query("api::community-membership.community-membership")
        .count({ where: { community: { documentId: id } } });

      if (existing) {
        return {
          success: true,
          data: { isMember: true, subscribers: subscribersCount },
        };
      }

      // Create membership record
      await strapi
        .documents("api::community-membership.community-membership")
        .create({
          data: {
            user: user.id,
            community: community.documentId,
            role: "Member",
            joinedAt: new Date(),
          },
          status: "published",
        });

      return {
        success: true,
        data: { isMember: true, subscribers: subscribersCount + 1 },
      };
    },

    /**
     * POST /api/communities/:id/leave
     */
    async leave(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const { id } = ctx.params; // community documentId

      // Find existing membership
      const membership = await strapi.db
        .query("api::community-membership.community-membership")
        .findOne({
          where: {
            user: { id: user.id },
            community: { documentId: id },
          },
        });

      const subscribersCount = await strapi.db
        .query("api::community-membership.community-membership")
        .count({ where: { community: { documentId: id } } });

      if (!membership) {
        return {
          success: true,
          data: { isMember: false, subscribers: subscribersCount },
        };
      }

      // Delete membership record
      await strapi
        .documents("api::community-membership.community-membership")
        .delete({
          documentId: membership.documentId,
        });

      return {
        success: true,
        data: {
          isMember: false,
          subscribers: Math.max(0, subscribersCount - 1),
        },
      };
    },
  }),
);
