"use strict";

/**
 * Interest Controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::interest.interest",
  ({ strapi }) => ({
    async delete(ctx) {
      ctx.throw(
        403,
        "Interests cannot be deleted for safety. Use the isActive flag to deactivate them instead.",
      );
    },
  }),
);
