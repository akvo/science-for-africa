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

      // Manually fetch collaboration invites since programmatic relations can be tricky for population
      const invites = await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .findMany({
          filters: {
            invitedUser: user.id,
            inviteStatus: { $in: ["Accepted", "Pending"] },
          },
          populate: ["collaborationCall"],
          status: "published",
        });

      if (profile) {
        profile.collaborationInvites = invites;
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
   * Search for users with populated roles for mentor assignment.
   * Optionally filter to members of a specific community via ?community=<name>.
   */
  async findUsers(ctx) {
    try {
      const { query } = ctx;
      const limit = query.limit ? parseInt(query.limit) : 50;

      // If a community filter is provided, only return members of that community
      if (query.community) {
        const community = await strapi.db
          .query("api::community.community")
          .findOne({ where: { name: query.community } });

        if (!community) {
          ctx.body = [];
          return;
        }

        const memberships = await strapi.db
          .query("api::community-membership.community-membership")
          .findMany({
            where: { community: community.id },
            populate: {
              user: {
                select: [
                  "id",
                  "documentId",
                  "username",
                  "email",
                  "firstName",
                  "lastName",
                  "fullName",
                  "position",
                  "verified",
                ],
                populate: {
                  roleType: true,
                  profilePhoto: true,
                },
              },
            },
          });

        // Extract unique users, apply search filter if provided
        const seen = new Set();
        const users = [];
        for (const m of memberships) {
          if (!m.user || seen.has(m.user.id)) continue;
          seen.add(m.user.id);

          if (query._q) {
            const q = query._q.toLowerCase();
            const match =
              m.user.username?.toLowerCase().includes(q) ||
              m.user.email?.toLowerCase().includes(q) ||
              m.user.fullName?.toLowerCase().includes(q);
            if (!match) continue;
          }

          users.push(m.user);
        }

        users.sort((a, b) =>
          (a.fullName || "").localeCompare(b.fullName || ""),
        );

        ctx.body = users.slice(0, limit);
        return;
      }

      // Default: search all users
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
          select: [
            "id",
            "documentId",
            "username",
            "email",
            "firstName",
            "lastName",
            "fullName",
            "position",
            "verified",
          ],
          populate: {
            roleType: true,
            profilePhoto: true,
          },
          orderBy: { fullName: "asc" },
          limit,
        });

      // Deduplicate (joins on relations can produce duplicate rows)
      const seen = new Set();
      const unique = users.filter((u) => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });

      ctx.body = unique;
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
      "institutionType",
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
                  data: {
                    name,
                    verified: false,
                    locale: ctx.query.locale || "en",
                  },
                });
            }
            data.highestEducationInstitution = inst.documentId;
          } else if (targetId) {
            // In Strapi v5, relations prefer documentId
            const isNumeric = !isNaN(parseInt(targetId));
            if (isNumeric) {
              const inst = await strapi.db
                .query("api::institution.institution")
                .findOne({
                  where: { id: parseInt(targetId) },
                });
              data.highestEducationInstitution = inst?.documentId;
            } else {
              data.highestEducationInstitution = targetId;
            }
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
              const institutionData = {
                name,
                verified: false,
                locale: ctx.query.locale || "en",
              };

              // If institutionType is provided, resolve it to numeric ID
              if (data.institutionType) {
                const it = await strapi.db
                  .query("api::institution-type.institution-type")
                  .findOne({
                    where: {
                      $or: [
                        { name: data.institutionType },
                        { documentId: data.institutionType },
                      ],
                    },
                  });
                if (it) {
                  institutionData.institutionType = it.id;
                }
              }

              inst = await strapi.db
                .query("api::institution.institution")
                .create({
                  data: institutionData,
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
          inst = await strapi.db.query("api::institution.institution").findOne({
            where: !isNaN(parseInt(targetId))
              ? { id: parseInt(targetId) }
              : { documentId: targetId },
          });
        }

        if (inst) {
          // If institution was found (not created) but institutionType is provided, update it
          if (data.institutionType) {
            const it = await strapi.db
              .query("api::institution-type.institution-type")
              .findOne({
                where: {
                  $or: [
                    { name: data.institutionType },
                    { documentId: data.institutionType },
                  ],
                },
              });
            if (it) {
              await strapi.db.query("api::institution.institution").update({
                where: { id: inst.id },
                data: { institutionType: it.id },
              });
            }
          }

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
                  locale: ctx.query.locale || "en",
                },
              });
          }
        }
        delete data.affiliationInstitution;
        delete data.institutionType;
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
        data.roleType = role?.documentId;
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

      // 5. Cleanup for Institution user type (remove individual-only fields)
      if (data.userType === "institution") {
        delete data.roleType;
        delete data.highestEducationInstitution;
        delete data.educationTopic;
        delete data.educationLevel;
      }

      // Final cleanup of non-schema fields before User update
      delete data.institutionName;
      delete data.institutionType;
      delete data.affiliationInstitution;
      delete data.educationInstitutionName;

      // Ensure no empty strings are passed for relations
      if (data.roleType === "") delete data.roleType;
      if (data.highestEducationInstitution === "")
        delete data.highestEducationInstitution;

      strapi.log.debug("FINAL Profile Update Payload: " + JSON.stringify(data));

      try {
        // Update the user using Document Service (Strapi v5 way)
        // Explicitly set locale to null — users are not localized
        await strapi.documents("plugin::users-permissions.user").update({
          documentId: user.documentId,
          locale: null,
          data,
        });
      } catch (error) {
        strapi.log.error("UpdateMe Error: " + error.message);
        if (error.details) {
          strapi.log.error("Error Details: " + JSON.stringify(error.details));
        }
        throw error;
      }

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

  /**
   * Returns mentees for the currently authenticated mentor
   */
  async mentees(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      // 1. Find all collaborations where the user is an accepted Mentor
      const mentorInvites = await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .findMany({
          filters: {
            invitedUser: user.id,
            role: "Mentor",
            inviteStatus: "Accepted",
          },
          populate: ["collaborationCall"],
          status: "published",
        });

      if (!mentorInvites || mentorInvites.length === 0) {
        return [];
      }

      const results = [];

      for (const mentorInvite of mentorInvites) {
        const call = mentorInvite.collaborationCall;
        if (!call) continue;

        // 2. Fetch all accepted collaborators (mentees) for this call
        const collaboratorInvites = await strapi
          .documents("api::collaboration-invite.collaboration-invite")
          .findMany({
            filters: {
              collaborationCall: call.id,
              inviteStatus: "Accepted",
              invitedUser: { $ne: user.id }, // Exclude the mentor themselves
            },
            populate: {
              invitedUser: {
                populate: {
                  profilePhoto: true,
                  highestEducationInstitution: true,
                },
              },
            },
            status: "published",
          });

        // 3. Fetch the creator of the call (also a mentee if not the mentor)
        const fullCall = await strapi
          .documents("api::collaboration-call.collaboration-call")
          .findOne({
            documentId: call.documentId,
            populate: {
              createdByUser: {
                populate: {
                  profilePhoto: true,
                  highestEducationInstitution: true,
                },
              },
            },
          });

        const mentees = [];

        // Add creator if they are not the mentor
        if (fullCall.createdByUser && fullCall.createdByUser.id !== user.id) {
          mentees.push({
            ...fullCall.createdByUser,
            mentorshipRole: "Creator",
          });
        }

        // Add other collaborators
        collaboratorInvites.forEach((invite) => {
          if (invite.invitedUser) {
            mentees.push({
              ...invite.invitedUser,
              mentorshipRole: invite.role || "Collaborator",
            });
          }
        });

        if (mentees.length > 0) {
          results.push({
            collaborationCall: call,
            mentees,
          });
        }
      }

      return results;
    } catch (error) {
      strapi.log.error("Mentees Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },

  /**
   * Returns a public profile by ID, sanitizing sensitive information
   */
  async publicProfile(ctx) {
    const { id } = ctx.params;
    const currentUser = ctx.state.user;

    try {
      // Determine if ID is numeric or a documentId
      const isNumericId = !isNaN(parseInt(id)) && /^\d+$/.test(id);

      const profile = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            $or: [{ id: isNumericId ? parseInt(id) : -1 }, { documentId: id }],
          },
          populate: {
            roleType: true,
            highestEducationInstitution: true,
            institutionMemberships: {
              populate: { institution: true },
            },
            interests: true,
            profilePhoto: true,
            pageCover: true,
            followers: true,
          },
        });

      if (!profile) {
        strapi.log.warn(`Public Profile not found for ID: ${id}`);
        return ctx.notFound("Profile not found");
      }

      // Check if current user is following this profile
      const following = currentUser
        ? profile.followers?.some((f) => f.id == currentUser.id)
        : false;

      // Sanitize profile (exclude private fields like email, password, etc.)
      const publicProfile = {
        id: profile.id,
        documentId: profile.documentId,
        username: profile.username,
        fullName: profile.fullName,
        displayName: profile.displayName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        position: profile.position,
        biography: profile.biography,
        interests: profile.interests,
        educationTopic: profile.educationTopic,
        educationLevel: profile.educationLevel,
        highestEducationInstitution: profile.highestEducationInstitution,
        institutionMemberships: profile.institutionMemberships,
        profilePhoto: profile.profilePhoto,
        pageCover: profile.pageCover,
        subscriberCount: profile.subscriberCount || 0,
        verified: profile.verified,
        roleType: profile.roleType,
        following,
      };

      return publicProfile;
    } catch (error) {
      strapi.log.error("Public Profile Fetch Error: " + error.message);
      return ctx.internalServerError(error.message);
    }
  },
});
