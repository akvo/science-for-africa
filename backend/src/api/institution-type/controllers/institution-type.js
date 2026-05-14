"use strict";

/**
 * institution-type controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::institution-type.institution-type",
  ({ strapi }) => ({
    /**
     * Override the delete action to block all deletion requests
     * for safety. Users should use the 'isActive' flag instead.
     */
    async delete(ctx) {
      return ctx.forbidden(
        "Institution types cannot be deleted. Please use the 'isActive' flag to deactivate this entry for safety and historical data integrity.",
      );
    },
  }),
);
