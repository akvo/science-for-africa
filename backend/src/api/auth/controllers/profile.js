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

      // Resolve documentId if missing (common in some auth states)
      if (!user.documentId) {
        const u = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: user.id },
          });
        user.documentId = u?.documentId;
      }

      const profile = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        user.id,
        {
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
        },
      );

      if (!profile) {
        return ctx.notFound("Profile not found");
      }

      // [WORKAROUND] Manually fetch collaborationInvites if missing from population
      if (
        !profile.collaborationInvites ||
        profile.collaborationInvites.length === 0
      ) {
        const manualInvites = await strapi.db
          .query("api::collaboration-invite.collaboration-invite")
          .findMany({
            where: { invitedUser: profile.id },
            populate: { collaborationCall: true },
          });
        if (manualInvites && manualInvites.length > 0) {
          profile.collaborationInvites = manualInvites;
        }
      }

      // Format community memberships: filter out duplicates and apply limit
      const uniqueMemberships = [];
      const seenCommunities = new Set();

      if (profile.memberships) {
        profile.memberships.forEach((m) => {
          if (
            m.community &&
            !seenCommunities.has(m.community.documentId || m.community.id)
          ) {
            uniqueMemberships.push(m);
            seenCommunities.add(m.community.documentId || m.community.id);
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
      if (data.highestEducationInstitution) {
        if (typeof data.highestEducationInstitution === "object") {
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
            // Resolve to numeric ID
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
        } else if (typeof data.highestEducationInstitution === "string") {
          const targetId = data.highestEducationInstitution;
          if (isNaN(parseInt(targetId))) {
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
      if (data.affiliationInstitution) {
        let inst;
        if (typeof data.affiliationInstitution === "object") {
          const { name, id, documentId } = data.affiliationInstitution;
          const targetId = documentId || id;

          if (!targetId && name) {
            inst = await strapi.db
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
          } else if (targetId) {
            const isNumeric = !isNaN(parseInt(targetId));
            inst = await strapi.db
              .query("api::institution.institution")
              .findOne({
                where: isNumeric
                  ? { id: parseInt(targetId) }
                  : { documentId: targetId },
              });
          }
        } else {
          const targetId = data.affiliationInstitution;
          const isNumeric = !isNaN(parseInt(targetId));
          inst = await strapi.db.query("api::institution.institution").findOne({
            where: isNumeric
              ? { id: parseInt(targetId) }
              : { documentId: targetId },
          });
        }

        if (inst) {
          const existing = await strapi.db
            .query("api::institution-membership.institution-membership")
            .findOne({
              where: {
                user: user.id,
                institution: inst.id,
              },
            });

          if (!existing) {
            await strapi.db
              .query("api::institution-membership.institution-membership")
              .create({
                data: {
                  user: user.id,
                  institution: inst.id,
                  isPrimary: false,
                  verified: false,
                  locale: "en",
                },
              });
          }
        }
        delete data.affiliationInstitution;
      }

      // 3. Handle roleType (resolve name/documentId to numeric ID)
      if (data.roleType && typeof data.roleType === "string") {
        let role = await strapi.db
          .query("api::individual-role.individual-role")
          .findOne({
            where: {
              $or: [{ name: data.roleType }, { documentId: data.roleType }],
            },
          });

        if (!role) {
          role = await strapi.db
            .query("api::individual-role.individual-role")
            .findOne({
              where: { name: data.roleType },
            });
        }
        data.roleType = role?.id;
      }

      // 4. Handle interests (convert names to objects for component)
      if (data.interests && Array.isArray(data.interests)) {
        data.interests = data.interests
          .map((interest) => {
            if (typeof interest === "string") {
              return { name: interest };
            }
            return interest;
          })
          .filter((item) => !!item.name);
      }

      // Clean up legacy fields
      delete data.institutionName;
      delete data.educationInstitutionName;

      // Update the user using Entity Service
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data,
        },
      );

      // Fetch the updated user with full population using db.query to ensure consistency with ID
      const updatedUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
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

      if (!updatedUser) {
        return ctx.notFound("Updated user not found");
      }

      // [WORKAROUND] Manually fetch collaborationInvites if missing from population
      if (
        !updatedUser.collaborationInvites ||
        updatedUser.collaborationInvites.length === 0
      ) {
        const manualInvites = await strapi.db
          .query("api::collaboration-invite.collaboration-invite")
          .findMany({
            where: { invitedUser: updatedUser.id },
            populate: { collaborationCall: true },
          });
        if (manualInvites && manualInvites.length > 0) {
          updatedUser.collaborationInvites = manualInvites;
        }
      }

      // Format community memberships for consistency
      const uniqueMemberships = [];
      const seenCommunities = new Set();
      if (updatedUser.memberships) {
        updatedUser.memberships.forEach((m) => {
          if (
            m.community &&
            !seenCommunities.has(m.community.documentId || m.community.id)
          ) {
            uniqueMemberships.push(m);
            seenCommunities.add(m.community.documentId || m.community.id);
          }
        });
      }
      updatedUser.memberships = uniqueMemberships;

      return updatedUser;
    } catch (error) {
      strapi.log.error("UpdateMe Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },
});
