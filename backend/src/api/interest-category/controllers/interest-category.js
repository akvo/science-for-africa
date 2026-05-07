"use strict";

/**
 * interest-category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::interest-category.interest-category",
  ({ strapi }) => ({
    async delete(ctx) {
      ctx.throw(
        403,
        "Interest categories cannot be deleted for safety. Use the isActive flag to deactivate them instead.",
      );
    },
  }),
);
