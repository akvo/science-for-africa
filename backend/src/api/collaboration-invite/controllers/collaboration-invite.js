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

      return { data: updated };
    },
  }),
);
