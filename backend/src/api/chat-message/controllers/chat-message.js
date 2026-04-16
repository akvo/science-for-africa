"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

/**
 * Safe subset of user fields to expose on `author`. Authenticated users don't
 * have the global users-permissions `find`/`findOne` action, so the default
 * sanitizer would strip the relation entirely. We query the DB directly and
 * shape the response ourselves.
 */
const USER_PUBLIC_FIELDS = [
  "id",
  "documentId",
  "username",
  "email",
  "firstName",
  "lastName",
  "fullName",
  "position",
];

module.exports = createCoreController(
  "api::chat-message.chat-message",
  ({ strapi }) => ({
    /**
     * List chat messages for a collaboration call. The frontend filters via
     *   ?filters[collaborationCall][documentId][$eq]=<callId>
     * Ordered oldest-first so the chat thread reads top-to-bottom.
     */
    async find(ctx) {
      const callDocumentId =
        ctx.query?.filters?.collaborationCall?.documentId?.$eq ||
        ctx.query?.filters?.collaborationCall?.documentId;

      if (!callDocumentId) {
        return ctx.badRequest(
          "Missing filters[collaborationCall][documentId][$eq] query param",
        );
      }

      const rows = await strapi.db
        .query("api::chat-message.chat-message")
        .findMany({
          where: {
            collaborationCall: { documentId: callDocumentId },
          },
          orderBy: { createdAt: "asc" },
          populate: {
            author: { select: USER_PUBLIC_FIELDS },
          },
        });

      return { data: rows, meta: {} };
    },

    /**
     * Post a chat message. `author` is always taken from the authenticated
     * user — never trusted from the request body.
     */
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const body = ctx.request.body?.data || ctx.request.body || {};
      const text = typeof body.text === "string" ? body.text.trim() : "";
      const callDocumentId = body.collaborationCall;

      if (!text) return ctx.badRequest("text is required");
      if (!callDocumentId)
        return ctx.badRequest("collaborationCall is required");

      const call = await strapi.db
        .query("api::collaboration-call.collaboration-call")
        .findOne({ where: { documentId: callDocumentId } });

      if (!call) return ctx.notFound("Collaboration call not found");

      const created = await strapi.entityService.create(
        "api::chat-message.chat-message",
        {
          data: {
            text,
            collaborationCall: call.id,
            author: user.id,
          },
        },
      );

      const withAuthor = await strapi.db
        .query("api::chat-message.chat-message")
        .findOne({
          where: { id: created.id },
          populate: { author: { select: USER_PUBLIC_FIELDS } },
        });

      return { data: withAuthor, meta: {} };
    },
  }),
);
