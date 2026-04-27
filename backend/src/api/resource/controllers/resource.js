"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

const USER_FIELDS = ["id", "documentId", "username", "email", "fullName", "firstName", "lastName", "roleType"];

async function populateUploader(strapi, item) {
  if (!item) return item;

  // Fetch the raw DB row to get uploaded_by_id
  const raw = await strapi.db.query("api::resource.resource").findOne({
    where: { documentId: item.documentId },
    populate: ["uploadedBy"],
  });

  if (raw?.uploadedBy) {
    const user = {};
    for (const field of USER_FIELDS) {
      if (raw.uploadedBy[field] !== undefined) {
        user[field] = raw.uploadedBy[field];
      }
    }
    item.uploadedBy = user;
  }

  return item;
}

module.exports = createCoreController(
  "api::resource.resource",
  ({ strapi }) => ({
    async find(ctx) {
      const response = await super.find(ctx);
      if (Array.isArray(response?.data)) {
        response.data = await Promise.all(
          response.data.map((item) => populateUploader(strapi, item)),
        );
      }
      return response;
    },

    async findOne(ctx) {
      const response = await super.findOne(ctx);
      if (response?.data) {
        response.data = await populateUploader(strapi, response.data);
      }
      return response;
    },

    async create(ctx) {
      const response = await super.create(ctx);

      const user = ctx.state.user;
      if (user && response?.data?.documentId) {
        await strapi.documents("api::resource.resource").update({
          documentId: response.data.documentId,
          data: { uploadedBy: user.id },
        });
        // Return user info immediately
        const userInfo = {};
        for (const field of USER_FIELDS) {
          if (user[field] !== undefined) userInfo[field] = user[field];
        }
        response.data.uploadedBy = userInfo;
      }

      return response;
    },
  }),
);
