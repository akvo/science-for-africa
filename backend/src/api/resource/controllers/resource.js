"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::resource.resource",
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;
      const { filters = {} } = ctx.query;

      // If unauthenticated or a regular user, apply status filter
      // We allow administrators (if they use this endpoint) or the owner to see all statuses
      if (!user) {
        // Unauthenticated: only approved
        ctx.query.filters = {
          ...filters,
          status: { $eq: "approved" },
        };
      } else {
        // Authenticated: show approved OR owned by current user
        ctx.query.filters = {
          ...filters,
          $or: [
            { status: { $eq: "approved" } },
            { uploadedBy: { id: { $eq: user.id } } },
          ],
        };
      }

      return await super.find(ctx);
    },

    async findOne(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      const resource = await strapi
        .documents("api::resource.resource")
        .findOne({
          documentId: id,
          populate: ["uploadedBy"],
        });

      if (!resource) return ctx.notFound();

      const isOwner = user && resource.uploadedBy?.id === user.id;
      const isApproved = resource.status === "approved";

      if (!isOwner && !isApproved) {
        return ctx.forbidden("This resource is pending approval.");
      }

      return await super.findOne(ctx);
    },
  }),
);
