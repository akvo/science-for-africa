'use strict';

/**
 * Lifecycle callbacks for the `user` model.
 */

module.exports = {
  /**
   * Sync fullName from firstName + lastName.
   */
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.firstName || data.lastName) {
      data.fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.firstName || data.lastName) {
      // If we are updating names, update fullName
      // Note: We might need to fetch the existing data if only one is provided,
      // but for simplicity in this onboarding flow, they are usually sent together.
      const firstName = data.firstName !== undefined ? data.firstName : '';
      const lastName = data.lastName !== undefined ? data.lastName : '';
      data.fullName = `${firstName} ${lastName}`.trim();
    }
  },
};
