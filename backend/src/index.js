'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Extend the user content type attributes
    const userModel = strapi.contentType('plugin::users-permissions.user');
    if (userModel) {
      userModel.attributes = {
        ...userModel.attributes,
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        fullName: { type: 'string' },
        position: { type: 'string' },
        biography: { type: 'text' },
        interests: {
          type: 'component',
          repeatable: true,
          component: 'user.interest',
          max: 5,
        },
        educationTopic: { type: 'string' },
        educationLevel: {
          type: 'enumeration',
          enum: ['Bachelors', 'Masters', 'PhD', 'Other'],
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
        orcidId: {
          type: 'string',
          regex: '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[\\dX]$',
        },
        onboardingComplete: {
          type: 'boolean',
          default: false,
        },
        twoFactorSecret: {
          type: 'password',
          private: true,
        },
        twoFactorEnabled: {
          type: 'boolean',
          default: false,
        },
        verificationStatus: {
          type: 'enumeration',
          enum: ['unverified', 'verified'],
          default: 'unverified',
        },
        socialLinks: {
          type: 'json',
        },
      };

      // Add user lifecycles using the more reliable subscribe method
      strapi.db.lifecycles.subscribe({
        models: ['plugin::users-permissions.user'],
        async beforeCreate(event) {
          const { data } = event.params;
          if (data.firstName || data.lastName) {
            data.fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          }
        },
        async beforeUpdate(event) {
          const { data } = event.params;
          if (data.firstName || data.lastName) {
            const firstName = data.firstName !== undefined ? data.firstName : '';
            const lastName = data.lastName !== undefined ? data.lastName : '';
            data.fullName = `${firstName} ${lastName}`.trim();
          }
        },
      });
    }
  },

  bootstrap(/* { strapi } */) {},
};
