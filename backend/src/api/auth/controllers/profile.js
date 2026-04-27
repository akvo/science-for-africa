"use strict";

/**
 * profile controller
 */

module.exports = ({ strapi }) => ({
  /**
   * Returns the profile of the currently authenticated user with deep population
   */
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const membershipLimit = ctx.query.membershipLimit
        ? parseInt(ctx.query.membershipLimit)
        : undefined;

      const profile = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: user.documentId || user.id,
          populate: {
            highestEducationInstitution: true,
            institutionMemberships: {
              populate: {
                institution: true,
              },
            },
            interests: true,
            profilePhoto: true,
            pageCover: true,
            memberships: {
              populate: {
                community: true,
              },
            },
          },
        });

      // Apply membership limit if requested to reduce frontend payload size
      if (membershipLimit && profile.memberships) {
        profile.memberships = profile.memberships.slice(0, membershipLimit);
      }

      // Manually fetch collaboration invites since programmatic relations can be tricky for population
      const invites = await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .findMany({
          filters: {
            invitedUser: user.id,
            inviteStatus: "Accepted",
          },
          populate: ["collaborationCall"],
          status: "published",
        });

      if (profile) {
        profile.collaborationInvites = invites;
      }

      return profile;
    } catch (error) {
      strapi.log.error("Me Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },

  async findUsers(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const users = await strapi
        .documents("plugin::users-permissions.user")
        .findMany({
          fields: [
            "id",
            "email",
            "fullName",
            "firstName",
            "lastName",
            "position",
            "roleType",
          ],
          populate: {
            highestEducationInstitution: true,
            institutionMemberships: {
              populate: {
                institution: true,
              },
            },
          },
          limit: 100,
        });

      return users;
    } catch (error) {
      strapi.log.error("FindUsers Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },

  async update(ctx) {
    const userSession = ctx.state.user;
    const body = ctx.request.body;

    if (!userSession) {
      return ctx.unauthorized();
    }

    // Whitelist allowed fields to prevent arbitrary updates
    const allowedFields = [
      "displayName",
      "biography",
      "firstName",
      "lastName",
      "fullName",
      "position",
      "interests",
      "educationTopic",
      "educationLevel",
      "languagePreferences",
      "orcidId",
      "socialLinks",
      "profilePhoto",
      "pageCover",
      "institution",
      "onboardingComplete",
      "userType",
      "institutionName",
      "educationInstitutionName",
      "roleType",
      "highestEducationInstitution",
      "affiliationInstitution",
    ];

    const data = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    });

    // Validation: Biography character limit (Baseline UAC Requirement)
    if (data.biography && data.biography.length > 275) {
      return ctx.badRequest("Biography must be 275 characters or less.");
    }

    try {
      // 0. Fetch the full user record with numeric ID and documentId
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            $or: [
              { id: typeof userSession.id === "number" ? userSession.id : -1 },
              {
                documentId:
                  typeof userSession.id === "string"
                    ? userSession.id
                    : userSession.documentId || "",
              },
            ],
          },
        });

      if (!user) {
        return ctx.unauthorized("User record not found");
      }

      // 1. Handle highestEducationInstitution (on-the-fly creation)
      if (
        data.highestEducationInstitution &&
        typeof data.highestEducationInstitution === "object"
      ) {
        const { name, id, documentId } = data.highestEducationInstitution;
        const targetId = documentId || id;

        if (!targetId && name) {
          // Check if it already exists (case-insensitive)
          let inst = await strapi.db
            .query("api::institution.institution")
            .findOne({
              where: { name: { $containsi: name } },
            });

          if (!inst) {
            const created = await strapi
              .documents("api::institution.institution")
              .create({
                data: {
                  name,
                  type: "Academic",
                  country: "Unknown",
                  verified: false,
                  locale: "en",
                },
              });
            inst = await strapi.db
              .query("api::institution.institution")
              .findOne({ where: { documentId: created.documentId } });
          }
          data.highestEducationInstitution = inst.id;
        } else if (targetId) {
          // Resolve numeric ID if needed
          if (typeof targetId === "string") {
            const inst = await strapi.db
              .query("api::institution.institution")
              .findOne({ where: { documentId: targetId } });
            data.highestEducationInstitution = inst?.id || targetId;
          } else {
            data.highestEducationInstitution = targetId;
          }
        }
      }

      // 2. Handle affiliationInstitution (on-the-fly creation + membership)
      if (data.affiliationInstitution) {
        let targetId =
          data.affiliationInstitution.documentId ||
          data.affiliationInstitution.id;
        const name = data.affiliationInstitution.name;

        let inst;
        if (!targetId && name) {
          // Check if it already exists
          inst = await strapi.db.query("api::institution.institution").findOne({
            where: { name: { $containsi: name } },
          });

          if (!inst) {
            const created = await strapi
              .documents("api::institution.institution")
              .create({
                data: {
                  name,
                  type: "Academic",
                  country: "Unknown",
                  verified: false,
                  locale: "en",
                },
              });
            inst = await strapi.db
              .query("api::institution.institution")
              .findOne({ where: { documentId: created.documentId } });
          }
        } else if (targetId) {
          inst = await strapi.db.query("api::institution.institution").findOne({
            where: {
              $or: [
                { id: typeof targetId === "number" ? targetId : -1 },
                { documentId: typeof targetId === "string" ? targetId : "" },
              ],
            },
          });
        }

        if (inst) {
          // Check if membership already exists using numeric IDs
          const existingMembership = await strapi.db
            .query("api::institution-membership.institution-membership")
            .findOne({
              where: { user: user.id, institution: inst.id },
            });

          if (!existingMembership) {
            try {
              await strapi
                .documents("api::institution-membership.institution-membership")
                .create({
                  data: {
                    user: String(user.documentId),
                    institution: String(inst.documentId),
                    type: "member",
                    verificationStatus: false,
                    locale: "en",
                  },
                });
            } catch (err) {
              strapi.log.error("Membership Create Error: " + err.message);
              // Continue anyway to avoid blocking profile update
            }
          }
        }
        delete data.affiliationInstitution;
      }

      // 3. Remove deprecated fields
      delete data.institution;
      delete data.institutionName;
      delete data.educationInstitutionName;

      // Handle relation mapping for Document Service
      if (
        data.highestEducationInstitution &&
        typeof data.highestEducationInstitution === "number"
      ) {
        const inst = await strapi.db
          .query("api::institution.institution")
          .findOne({ where: { id: data.highestEducationInstitution } });
        data.highestEducationInstitution = inst?.documentId;
      }

      // 4. Update the user using Document Service
      try {
        const updatedUser = await strapi
          .documents("plugin::users-permissions.user")
          .update({
            documentId: String(user.documentId),
            data,
            populate: {
              highestEducationInstitution: true,
              institutionMemberships: {
                populate: {
                  institution: true,
                },
              },
              interests: true,
              profilePhoto: true,
              pageCover: true,
            },
          });

        if (!updatedUser) {
          throw new Error("Update failed: document not found");
        }

        return updatedUser;
      } catch (err) {
        strapi.log.error("Document Update Error: " + err.message);
        throw err;
      }
    } catch (error) {
      console.error("[AUTH-ERR] UpdateMe Full Error:", error);
      if (error.details && error.details.errors) {
        console.error(
          "[AUTH-ERR] Validation Details:",
          JSON.stringify(error.details.errors, null, 2),
        );
      }
      strapi.log.error("UpdateMe Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },
});
