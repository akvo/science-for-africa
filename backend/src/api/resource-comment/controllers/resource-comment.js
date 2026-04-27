"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

const USER_FIELDS = ["id", "documentId", "username", "email", "fullName", "firstName", "lastName", "roleType"];

async function populateAuthor(strapi, item) {
  if (!item) return item;

  const raw = await strapi.db.query("api::resource-comment.resource-comment").findOne({
    where: { documentId: item.documentId },
    populate: ["author"],
  });

  if (raw?.author) {
    const user = {};
    for (const field of USER_FIELDS) {
      if (raw.author[field] !== undefined) {
        user[field] = raw.author[field];
      }
    }
    item.author = user;
  }

  return item;
}

module.exports = createCoreController(
  "api::resource-comment.resource-comment",
  ({ strapi }) => ({
    async find(ctx) {
      const response = await super.find(ctx);
      if (Array.isArray(response?.data)) {
        response.data = await Promise.all(
          response.data.map((item) => populateAuthor(strapi, item)),
        );
      }
      return response;
    },

    async create(ctx) {
      const response = await super.create(ctx);

      const user = ctx.state.user;
      if (user && response?.data?.documentId) {
        await strapi.documents("api::resource-comment.resource-comment").update({
          documentId: response.data.documentId,
          data: { author: user.id },
        });
      }

      return response;
    },
  }),
);
