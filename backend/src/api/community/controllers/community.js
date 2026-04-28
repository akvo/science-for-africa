"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

/**
 * Augment a community entity with live counts:
 * - `posts`       → collaboration-call records referencing this community
 * - `subscribers` → number of users in the `members` relation
 */
async function augmentWithCounts(strapi, item, userId) {
  if (!item || !item.name) return item;

  const postsCount = await strapi.db
    .query("api::collaboration-call.collaboration-call")
    .count({ where: { communityName: item.name } });

  const full = await strapi.db
    .query("api::community.community")
    .findOne({
      where: { documentId: item.documentId },
      populate: { members: { select: ["id"] } },
    });
  const members = full?.members || [];

  const augmented = { ...item, posts: postsCount, subscribers: members.length };
  if (userId) {
    augmented.isMember = members.some((m) => m.id === userId);
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

      const { id } = ctx.params;
      const community = await strapi.db
        .query("api::community.community")
        .findOne({
          where: { documentId: id },
          populate: { members: { select: ["id"] } },
        });

      if (!community) return ctx.notFound("Community not found");

      const alreadyMember = community.members.some((m) => m.id === user.id);
      if (alreadyMember) {
        return {
          data: { isMember: true, subscribers: community.members.length },
        };
      }

      await strapi.db.query("api::community.community").update({
        where: { id: community.id },
        data: { members: { connect: [{ id: user.id }] } },
      });

      return {
        data: { isMember: true, subscribers: community.members.length + 1 },
      };
    },

    /**
     * POST /api/communities/:id/leave
     */
    async leave(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const { id } = ctx.params;
      const community = await strapi.db
        .query("api::community.community")
        .findOne({
          where: { documentId: id },
          populate: { members: { select: ["id"] } },
        });

      if (!community) return ctx.notFound("Community not found");

      const isMember = community.members.some((m) => m.id === user.id);
      if (!isMember) {
        return {
          data: { isMember: false, subscribers: community.members.length },
        };
      }

      await strapi.db.query("api::community.community").update({
        where: { id: community.id },
        data: { members: { disconnect: [{ id: user.id }] } },
      });

      return {
        data: { isMember: false, subscribers: community.members.length - 1 },
      };
    },
  }),
);
