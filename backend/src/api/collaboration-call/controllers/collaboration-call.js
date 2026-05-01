"use strict";

const { createCoreController } = require("@strapi/strapi").factories;
const { emailTemplate } = require("../../../helpers/email-template");
const { getFrontendUrl } = require("../../../utils/url-helpers");

/**
 * Select a safe subset of user fields to expose when populating
 * `invitedUser` / `createdByUser`. The default core controller strips these
 * relations entirely because authenticated users don't have the global
 * users-permissions `find`/`findOne` action. We handle populate manually so
 * callers always get the mentor/collaborator details they need to render.
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
  "api::collaboration-call.collaboration-call",
  ({ strapi }) => ({
    /**
     * Override the default `findOne` so nested user relations survive the
     * permission sanitizer. We query the DB directly and shape the response
     * ourselves.
     */
    async findOne(ctx) {
      const { id } = ctx.params;
      const call = await strapi.db
        .query("api::collaboration-call.collaboration-call")
        .findOne({
          where: { documentId: id },
          populate: {
            createdByUser: { select: USER_PUBLIC_FIELDS },
            invites: {
              populate: { invitedUser: { select: USER_PUBLIC_FIELDS } },
            },
          },
        });

      if (!call) return ctx.notFound("Collaboration call not found");

      return { data: call, meta: {} };
    },

    async createWithInvites(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const {
        title,
        description,
        startDate,
        endDate,
        topics,
        communityName,
        inviteEmails,
        mentorEmails,
      } = ctx.request.body;

      // Validate required fields
      if (!title || !description || !startDate || !endDate) {
        return ctx.badRequest(
          "Missing required fields: title, description, startDate, endDate",
        );
      }

      if (title.length > 200) {
        return ctx.badRequest("Title must be 200 characters or less");
      }

      if (description.length > 275) {
        return ctx.badRequest("Description must be 275 characters or less");
      }

      if (new Date(endDate) <= new Date(startDate)) {
        return ctx.badRequest("End date must be after start date");
      }

      try {
        // Create the collaboration call
        const collaborationCall = await strapi.entityService.create(
          "api::collaboration-call.collaboration-call",
          {
            data: {
              title,
              description,
              startDate,
              endDate,
              topics: topics || [],
              communityName: communityName || "",
              status: "Active",
              createdByUser: user.id,
            },
          },
        );

        // Build a deduplicated map of email -> role. A mentor email that
        // also appears in inviteEmails should only generate a single invite
        // (with role "Mentor"). Mentors are ALWAYS processed even when the
        // user chose "Skip" and passed an empty inviteEmails list.
        const emailRoles = new Map();
        for (const email of inviteEmails || []) {
          if (email) emailRoles.set(email, "Collaborator");
        }
        for (const email of mentorEmails || []) {
          if (email) emailRoles.set(email, "Mentor");
        }
        const createdInvites = [];

        // Resolve frontend URL using the shared utility
        const frontendUrl = getFrontendUrl();

        for (const [email, role] of emailRoles) {
          // Check if user exists in the system
          const existingUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({ where: { email } });

          const invite = await strapi.entityService.create(
            "api::collaboration-invite.collaboration-invite",
            {
              data: {
                email,
                inviteStatus: "Pending",
                role,
                invitedUser: existingUser ? existingUser.id : null,
                collaborationCall: collaborationCall.id,
                invitedAt: new Date().toISOString(),
              },
            },
          );

          createdInvites.push(invite);

          // Send invitation email
          const acceptUrl = `${frontendUrl}/collaboration/invite/${invite.id}/accept`;
          const roleLabel = role === "Mentor" ? "a Mentor" : "a Collaborator";

          try {
            await strapi
              .plugin("email")
              .service("email")
              .send({
                to: email,
                subject: `You're invited to collaborate: ${title}`,
                html: emailTemplate({
                  title: "Collaboration Invitation",
                  body: `
                  <p>Hello,</p>
                  <p>You've been invited as <strong>${roleLabel}</strong> to join a collaboration call on the Science for Africa platform.</p>

                  <div style="margin: 24px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #008080;">
                    <h2 style="color:#008080;margin:0 0 8px;font-size:18px;">${title}</h2>
                    <p style="color:#666;margin:0;font-size:14px;line-height:1.5;">${description}</p>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${acceptUrl}" style="background-color: #008080; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Accept Invitation
                    </a>
                  </div>

                  <p style="margin-top:24px;font-size:13px;color:#999;">
                    If the button doesn't work, you can also copy and paste the following link into your browser:<br/>
                    <a href="${acceptUrl}" style="color:#008080;word-break:break-all;">${acceptUrl}</a>
                  </p>
                `,
                  footer:
                    "You received this email because someone invited you to collaborate on Science for Africa.",
                }),
              });
          } catch (emailError) {
            strapi.log.warn(
              `Failed to send invite email to ${email}: ${emailError.message}`,
            );
          }
        }

        // Re-fetch the collaboration call with populated invites
        const result = await strapi.entityService.findOne(
          "api::collaboration-call.collaboration-call",
          collaborationCall.id,
          {
            populate: ["invites", "createdByUser"],
          },
        );

        return result;
      } catch (error) {
        strapi.log.error("CreateWithInvites Error: " + error.message);
        return ctx.internalServerError(error.message);
      }
    },
  }),
);
