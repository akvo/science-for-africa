"use strict";

/**
 * individual-role controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::individual-role.individual-role",
  ({ strapi }) => ({
    async delete(ctx) {
      return ctx.forbidden(
        "Deletion of individual roles is prohibited to maintain data integrity. Use 'isActive: false' to deactivate instead.",
      );
    },
  }),
);
