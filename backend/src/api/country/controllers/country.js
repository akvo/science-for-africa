"use strict";

/**
 * country controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::country.country", ({ strapi }) => ({
  /**
   * Double Protection: Hard-coded override to prevent accidental deletion.
   * Return 403 Forbidden unconditionally.
   */
  async delete(ctx) {
    return ctx.forbidden(
      "Core country models cannot be deleted. Deactivate them instead.",
    );
  },
}));
