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

      const profile = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: {
            roleType: true,
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
            collaborationInvites: {
              populate: {
                collaborationCall: true,
              },
            },
          },
        });

      if (!profile) {
        return ctx.notFound("Profile not found");
      }

      // Format community memberships: filter out duplicates and apply limit
      const uniqueMemberships = [];
      const seenCommunities = new Set();

      if (profile.memberships) {
        profile.memberships.forEach((m) => {
          if (m.community && !seenCommunities.has(m.community.documentId)) {
            uniqueMemberships.push(m);
            seenCommunities.add(m.community.documentId);
          }
        });
      }

      // Apply limit if provided
      profile.memberships = membershipLimit
        ? uniqueMemberships.slice(0, membershipLimit)
        : uniqueMemberships;

      return profile;
    } catch (error) {
      strapi.log.error("Profile Fetch Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },

  /**
   * Search for users with populated roles for mentor assignment
   */
  async findUsers(ctx) {
    try {
      const { query } = ctx;
      const filters = {};

      if (query._q) {
        filters.$or = [
          { username: { $containsi: query._q } },
          { email: { $containsi: query._q } },
          { fullName: { $containsi: query._q } },
        ];
      }

      const users = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          where: filters,
          populate: {
            roleType: true,
            profilePhoto: true,
          },
          orderBy: { fullName: "asc" },
          limit: query.limit ? parseInt(query.limit) : 20,
        });

      return users;
    } catch (error) {
      strapi.log.error("FindUsers Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },

  /**
   * Updates the profile of the currently authenticated user
   */
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
      "onboardingComplete",
      "userType",
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

    // Character limit for biography
    if (data.biography && data.biography.length > 275) {
      return ctx.badRequest("Biography must be 275 characters or less.");
    }

    try {
      // 0. Fetch the user using session ID
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: userSession.id },
        });

      if (!user) {
        return ctx.notFound("User not found");
      }

      // 1. Handle highestEducationInstitution (on-the-fly creation if name provided)
      if (
        data.highestEducationInstitution &&
        typeof data.highestEducationInstitution === "object"
      ) {
        const { name, id, documentId } = data.highestEducationInstitution;
        const targetId = documentId || id;

        if (!targetId && name) {
          let inst = await strapi.db
            .query("api::institution.institution")
            .findOne({
              where: { name: { $containsi: name } },
            });

          if (!inst) {
            inst = await strapi.db
              .query("api::institution.institution")
              .create({
                data: { name, verified: false, locale: "en" },
              });
          }
          data.highestEducationInstitution = inst.id;
        } else if (targetId) {
          // If it's a documentId string, resolve to numeric ID for db.query
          if (typeof targetId === "string" && isNaN(parseInt(targetId))) {
            const inst = await strapi.db
              .query("api::institution.institution")
              .findOne({
                where: { documentId: targetId },
              });
            data.highestEducationInstitution = inst?.id;
          } else {
            data.highestEducationInstitution = parseInt(targetId);
          }
        }
      }

      // 2. Handle affiliationInstitution (on-the-fly creation + membership)
      if (
        data.affiliationInstitution &&
        typeof data.affiliationInstitution === "object"
      ) {
        const { name, id, documentId } = data.affiliationInstitution;
        const targetId = documentId || id;

        let inst;
        if (!targetId && name) {
          inst = await strapi.db.query("api::institution.institution").findOne({
            where: { name: { $containsi: name } },
          });

          if (!inst) {
            inst = await strapi.db
              .query("api::institution.institution")
              .create({
                data: { name, verified: false, locale: "en" },
              });
          }
        } else if (targetId) {
          const isNumeric =
            !isNaN(parseInt(targetId)) &&
            String(parseInt(targetId)) === String(targetId);
          inst = await strapi.db.query("api::institution.institution").findOne({
            where: isNumeric
              ? { id: parseInt(targetId) }
              : { documentId: targetId },
          });
        }

        if (inst) {
          // Check for existing membership
          const existingMembership = await strapi.db
            .query("api::institution-membership.institution-membership")
            .findOne({
              where: { user: user.id, institution: inst.id },
            });

          if (!existingMembership) {
            await strapi.db
              .query("api::institution-membership.institution-membership")
              .create({
                data: {
                  user: user.id,
                  institution: inst.id,
                  type: "member",
                  verificationStatus: false,
                  locale: "en",
                },
              });
          }
        }
        delete data.affiliationInstitution;
      }

      // Handle roleType if it's a documentId or Name
      if (
        data.roleType &&
        typeof data.roleType === "string" &&
        isNaN(parseInt(data.roleType))
      ) {
        let role = await strapi.db
          .query("api::individual-role.individual-role")
          .findOne({
            where: { documentId: data.roleType },
          });

        // Fallback to name if documentId not found
        if (!role) {
          role = await strapi.db
            .query("api::individual-role.individual-role")
            .findOne({
              where: { name: data.roleType },
            });
        }
        data.roleType = role?.id;
      }

      // Handle interests (convert names to IDs)
      if (data.interests && Array.isArray(data.interests)) {
        const resolvedInterests = [];
        for (const item of data.interests) {
          const name = typeof item === "string" ? item : item.name;
          if (name) {
            let interest = await strapi.db
              .query("api::interest.interest")
              .findOne({
                where: { name: { $containsi: name } },
              });

            if (!interest) {
              interest = await strapi.db
                .query("api::interest.interest")
                .create({
                  data: { name, locale: "en" },
                });
            }
            resolvedInterests.push(interest.id);
          }
        }
        data.interests = resolvedInterests;
      }

      // Clean up deprecated fields
      delete data.institution;
      delete data.institutionName;
      delete data.educationInstitutionName;

      // [AUTH-DEBUG] beforeUpdate User
      strapi.log.info(
        `[AUTH-DEBUG] beforeUpdate User: where=${JSON.stringify({ id: user.id })} data=${JSON.stringify(data)}`,
      );

      // Update the user
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data,
      });

      // Fetch the updated user with full population
      const updatedUser = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: user.documentId,
          populate: {
            roleType: true,
            highestEducationInstitution: true,
            institutionMemberships: {
              populate: { institution: true },
            },
            interests: true,
            profilePhoto: true,
            pageCover: true,
            memberships: {
              populate: { community: true },
            },
            collaborationInvites: {
              populate: { collaborationCall: true },
            },
          },
        });

      return updatedUser;
    } catch (error) {
      strapi.log.error("UpdateMe Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },
});
