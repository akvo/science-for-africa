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
    const expectedRoles = [
      "Platform Admin",
      "Community Admin",
      "Institution Admin",
      "Expert",
      "Member",
      "Individual",
    ];

    for (const roleName of expectedRoles) {
      const exists = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: { name: roleName },
        });

      if (!exists) {
        await strapi.query("plugin::users-permissions.role").create({
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
