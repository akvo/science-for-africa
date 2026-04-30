"use strict";

/**
 * community-membership service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::community-membership.community-membership",
);
