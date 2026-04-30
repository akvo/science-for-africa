"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::resource.resource",
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;
      const { filters = {}, populate, sort, pagination } = ctx.query;

      // Construct the base filter
      let queryFilters = { ...filters };

      if (!user) {
        // Unauthenticated: only approved
        queryFilters.status = { $eq: "approved" };
      } else {
        // Authenticated: show approved OR owned by current user
        queryFilters = {
          ...queryFilters,
          $or: [
            { status: { $eq: "approved" } },
            { uploadedBy: { documentId: { $eq: user.documentId } } },
          ],
        };
      }

      // Use core service find for paginated results in Strapi v5
      const { results, pagination: resPagination } = await strapi
        .service("api::resource.resource")
        .find({
          filters: queryFilters,
          populate: populate || ["file", "uploadedBy"],
          sort: sort || "createdAt:desc",
          pagination: {
            page: parseInt(pagination?.page) || 1,
            pageSize: parseInt(pagination?.pageSize) || 25,
          },
          locale: ctx.query.locale,
        });

      return {
        data: results,
        meta: { pagination: resPagination },
      };
    },

    async findOne(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      const resource = await strapi
        .documents("api::resource.resource")
        .findOne({
          documentId: id,
          populate: ["file", "uploadedBy"],
          locale: ctx.query.locale,
        });

      if (!resource) return ctx.notFound();

      const isOwner =
        user && resource.uploadedBy?.documentId === user.documentId;
      const isApproved = resource.status === "approved";

      if (!isOwner && !isApproved) {
        return ctx.forbidden("This resource is pending approval.");
      }

      return { data: resource };
    },

    async delete(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized();

      // 1. Fetch resource with owner
      const resource = await strapi
        .documents("api::resource.resource")
        .findOne({
          documentId: id,
          populate: ["uploadedBy"],
        });

      if (!resource) return ctx.notFound();

      // 2. Ownership check
      const ownerId = resource.uploadedBy?.documentId;
      const currentUserId = user.documentId;

      const isOwner = ownerId === currentUserId;
      if (!isOwner) {
        return ctx.forbidden("You can only delete your own resources.");
      }

      // 3. Delete the resource
      await strapi.documents("api::resource.resource").delete({
        documentId: id,
      });

      return { success: true };
    },
  }),
);
