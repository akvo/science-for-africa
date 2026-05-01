"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::collaboration-invite.collaboration-invite",
  ({ strapi }) => ({
    /**
     * Accept a collaboration invite by its numeric id. Idempotent — calling
     * this more than once is a no-op once the invite is accepted. If the
     * caller is authenticated and the invite has no linked user yet, the
     * current user is attached as `invitedUser`.
     */
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      try {
        const { pagination, filters } = ctx.query;
        const page = parseInt(pagination?.page) || 1;
        const pageSize = parseInt(pagination?.pageSize) || 6;
        const limit = pageSize;
        const start = (page - 1) * pageSize;

        const [data, total] = await Promise.all([
          strapi
            .documents("api::collaboration-invite.collaboration-invite")
            .findMany({
              filters: {
                ...(filters || {}),
                invitedUser: { id: user.id },
              },
              populate: {
                collaborationCall: true,
              },
              status: "published",
              limit,
              start,
            }),
          strapi
            .documents("api::collaboration-invite.collaboration-invite")
            .count({
              filters: {
                ...(filters || {}),
                invitedUser: { id: user.id },
              },
              status: "published",
            }),
        ]);

        const pageCount = Math.ceil(total / pageSize);

        return {
          data,
          meta: {
            pagination: {
              page,
              pageSize,
              pageCount,
              total,
            },
          },
        };
      } catch (err) {
        strapi.log.error(
          `[DEBUG] collaboration-invite find error: ${err.message}`,
        );
        return ctx.badRequest(err.message);
      }
    },

    async accept(ctx) {
      const { id } = ctx.params;

      // Look up by numeric id (used in invite emails) and translate to
      // the Strapi v5 documentId so we can use the Documents API for the
      // update — that keeps any draft/published layers in sync.
      const row = await strapi.db
        .query("api::collaboration-invite.collaboration-invite")
        .findOne({
          where: { id },
          populate: ["collaborationCall", "invitedUser"],
        });

      if (!row) {
        return ctx.notFound("Invite not found");
      }

      if (row.inviteStatus === "Declined") {
        return ctx.badRequest("This invite has been declined");
      }

      const user = ctx.state.user;
      const data = {};
      if (row.inviteStatus !== "Accepted") data.inviteStatus = "Accepted";
      if (user && !row.invitedUser) data.invitedUser = user.id;

      if (Object.keys(data).length > 0) {
        await strapi
          .documents("api::collaboration-invite.collaboration-invite")
          .update({ documentId: row.documentId, data });
      }

      const updated = await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .findOne({
          documentId: row.documentId,
          populate: ["collaborationCall"],
        });

      return { success: true, data: updated };
    },

    async decline(ctx) {
      const { id } = ctx.params;

      const row = await strapi.db
        .query("api::collaboration-invite.collaboration-invite")
        .findOne({
          where: { id },
          populate: ["invitedUser"],
        });

      if (!row) {
        return ctx.notFound("Invite not found");
      }

      if (row.inviteStatus === "Accepted") {
        return ctx.badRequest("This invite has already been accepted");
      }

      const user = ctx.state.user;
      const data = {};
      if (row.inviteStatus !== "Declined") data.inviteStatus = "Declined";
      if (user && !row.invitedUser) data.invitedUser = user.id;

      if (Object.keys(data).length > 0) {
        await strapi
          .documents("api::collaboration-invite.collaboration-invite")
          .update({ documentId: row.documentId, data });
      }

      const updated = await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .findOne({ documentId: row.documentId });

      return { success: true, data: updated };
    },
  }),
);
