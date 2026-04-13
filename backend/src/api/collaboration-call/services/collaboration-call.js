"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::collaboration-call.collaboration-call",
);
