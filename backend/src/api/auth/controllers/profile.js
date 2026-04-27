"use strict";

/**
 * profile controller
 */

module.exports = ({ strapi }) => ({
  /**
   * Updates the profile of the currently authenticated user
   */
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const profile = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: user.documentId || user.id, // User-permissions might use id or documentId
          populate: {
            highestEducationInstitution: true,
            institutionMemberships: {
              populate: {
                institution: true,
              },
            },
            interests: true,
          },
        });

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
    const user = ctx.state.user;
    const body = ctx.request.body;

    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const data = { ...body };

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
            inst = await strapi
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
          }
          data.highestEducationInstitution = inst.documentId || inst.id;
        } else if (targetId) {
          data.highestEducationInstitution = targetId;
        }
      }

      // 2. Handle affiliationInstitution (on-the-fly creation + membership)
      if (data.affiliationInstitution) {
        let instId =
          data.affiliationInstitution.documentId ||
          data.affiliationInstitution.id;
        const name = data.affiliationInstitution.name;

        if (!instId && name) {
          // Check if it already exists
          let inst = await strapi.db
            .query("api::institution.institution")
            .findOne({
              where: { name: { $containsi: name } },
            });

          if (!inst) {
            inst = await strapi
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
          }
          instId = inst.documentId || inst.id;
        }

        if (instId) {
          // Check if membership already exists
          const existingMembership = await strapi.db
            .query("api::institution-membership.institution-membership")
            .findOne({
              where: { user: user.id, institution: instId },
            });

          if (!existingMembership) {
            await strapi
              .documents("api::institution-membership.institution-membership")
              .create({
                data: {
                  user: user.documentId || user.id,
                  institution: instId,
                  type: "member",
                  verificationStatus: false,
                  locale: "en",
                },
              });
          }
        }
        delete data.affiliationInstitution;
      }

      // 3. Remove deprecated fields if they somehow slipped in
      delete data.institution;
      delete data.institutionName;
      delete data.educationInstitutionName;

      const updatedUser = await strapi
        .documents("plugin::users-permissions.user")
        .update({
          documentId: user.documentId || user.id,
          data,
          populate: {
            highestEducationInstitution: true,
            institutionMemberships: {
              populate: {
                institution: true,
              },
            },
            interests: true,
          },
        });

      return updatedUser;
    } catch (error) {
      strapi.log.error("UpdateMe Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },
});
