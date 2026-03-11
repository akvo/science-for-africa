'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Extend User content-type programmatically to match Clean Slate Architecture (v4)
    const userModel = strapi.contentType('plugin::users-permissions.user');
    if (userModel) {
      userModel.attributes = {
        ...userModel.attributes,
        careerStage: {
          type: 'enumeration',
          enum: ['Early-Career', 'Mid-Career', 'Senior', 'Executive'],
        },
        expertise: {
          type: 'string',
        },
        onboardingStep: {
          type: 'integer',
          default: 0,
        },
        orcidId: {
          type: 'string',
        },
        mentorAvailability: {
          type: 'boolean',
          default: false,
        },
        institution: {
          type: 'relation',
          relation: 'manyToOne',
          target: 'api::institution.institution',
          inversedBy: 'users',
        },
        affiliationStatus: {
          type: 'enumeration',
          enum: ['Pending', 'Approved', 'Rejected'],
          default: 'Pending',
        },
        orcidVerified: {
          type: 'boolean',
          default: false,
        },
        threads: {
          type: 'relation',
          relation: 'oneToMany',
          target: 'api::thread.thread',
          mappedBy: 'author',
        },
        posts: {
          type: 'relation',
          relation: 'oneToMany',
          target: 'api::post.post',
          mappedBy: 'author',
        },
        followedThreads: {
          type: 'relation',
          relation: 'manyToMany',
          target: 'api::thread.thread',
          mappedBy: 'followers',
        },
      };
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Register lifecycle hooks for ORCID validation
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      async afterCreate(event) {
        const { result } = event;
        if (result.orcidId && !result.orcidVerified) {
          const isValid = await strapi.service("api::orcid.orcid").validate(result.orcidId);
          if (isValid) {
            // Use db.query directly to avoid triggering lifecycles again if possible, 
            // or use a flag. In Strapi v5, db.query is lower level.
            await strapi.db.query("plugin::users-permissions.user").update({
              where: { id: result.id },
              data: { orcidVerified: true },
            });
          }
        }
      },

      async afterUpdate(event) {
        const { result } = event;
        // Check if orcidId was changed or if it's a new update that needs validation
        if (result.orcidId && !result.orcidVerified) {
          const isValid = await strapi.service("api::orcid.orcid").validate(result.orcidId);
          if (isValid) {
            await strapi.db.query("plugin::users-permissions.user").update({
              where: { id: result.id },
              data: { orcidVerified: true },
            });
          }
        }
      },
    });

    const expectedRoles = [
      "Platform Admin",
      "Community Admin",
      "Institution Admin",
      "Expert",
      "Member",
      "Individual",
    ];

    for (const roleName of expectedRoles) {
      const exists = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { name: roleName },
      });

      if (!exists) {
        await strapi.db.query("plugin::users-permissions.role").create({
          data: {
            name: roleName,
            description: `Core project role: ${roleName}`,
            type: roleName.toLowerCase().replace(/\s+/g, "-"),
          },
        });
      }
    }
  },
};
