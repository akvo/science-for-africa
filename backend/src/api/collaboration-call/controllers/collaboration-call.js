"use strict";

const { createCoreController } = require("@strapi/strapi").factories;
const { emailTemplate } = require("../../../helpers/email-template");

module.exports = createCoreController(
  "api::collaboration-call.collaboration-call",
  ({ strapi }) => ({
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

        // Create invites
        const emails = inviteEmails || [];
        const mentors = mentorEmails || [];
        const createdInvites = [];

        for (const email of emails) {
          const role = mentors.includes(email) ? "Mentor" : "Collaborator";

          // Check if user exists in the system
          const existingUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({ where: { email } });

          const invite = await strapi.entityService.create(
            "api::collaboration-invite.collaboration-invite",
            {
              data: {
                email,
                status: "Pending",
                role,
                invitedUser: existingUser ? existingUser.id : null,
                collaborationCall: collaborationCall.id,
                invitedAt: new Date().toISOString(),
              },
            },
          );

          createdInvites.push(invite);

          // Send invitation email
          const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:3000";
          const acceptUrl = `${frontendUrl}/collaboration/invite/${invite.id}/accept`;
          const roleLabel = role === "Mentor" ? "a Mentor" : "a Collaborator";

          try {
            await strapi.plugin("email").service("email").send({
              to: email,
              subject: `You're invited to collaborate: ${title}`,
              html: emailTemplate({
                title: "Collaboration Invitation",
                body: `
                  <p>Hello,</p>
                  <p>You've been invited as <strong>${roleLabel}</strong> to join a collaboration call on the Science for Africa platform.</p>
                  <h2 style="color:#008080;margin:24px 0 8px;">${title}</h2>
                  <p style="color:#666;">${description}</p>
                  <p style="margin-top:24px;">
                    <a href="${acceptUrl}" style="display:inline-block;padding:12px 32px;background-color:#008080;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">
                      Accept Invitation
                    </a>
                  </p>
                  <p style="margin-top:16px;font-size:13px;color:#999;">
                    If the button doesn't work, copy and paste this link:<br/>
                    <a href="${acceptUrl}" style="color:#008080;">${acceptUrl}</a>
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
