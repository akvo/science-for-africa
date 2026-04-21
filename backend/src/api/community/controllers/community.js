"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

/**
 * Augment a community entity with a live `posts` count derived from
 * collaboration-call records that reference this community by name.
 * `subscribers` is left as its stored value (defaults to 0) until a
 * subscribe/join flow exists to populate it.
 */
async function augmentWithCounts(strapi, item) {
  if (!item || !item.name) return item;
  const postsCount = await strapi.db
    .query("api::collaboration-call.collaboration-call")
    .count({ where: { communityName: item.name } });
  return { ...item, posts: postsCount };
}

module.exports = createCoreController(
  "api::community.community",
  ({ strapi }) => ({
    async find(ctx) {
      const response = await super.find(ctx);
      if (Array.isArray(response?.data)) {
        response.data = await Promise.all(
          response.data.map((item) => augmentWithCounts(strapi, item)),
        );
      }
      return response;
    },

    async findOne(ctx) {
      const response = await super.findOne(ctx);
      if (response?.data) {
        response.data = await augmentWithCounts(strapi, response.data);
      }
      return response;
    },
  }),
);
