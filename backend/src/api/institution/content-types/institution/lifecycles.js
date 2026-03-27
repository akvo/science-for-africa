'use strict';

/**
 * Lifecycle callbacks for the `institution` model.
 */

module.exports = {
  /**
   * Enforce case-insensitive uniqueness on name.
   */
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.name) {
      const existing = await strapi.db.query('api::institution.institution').findOne({
        where: {
          name: {
            $looki: data.name,
          },
        },
      });

      if (existing) {
        throw new Error('An institution with this name already exists (case-insensitive).');
      }
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;
    if (data.name) {
      const existing = await strapi.db.query('api::institution.institution').findOne({
        where: {
          name: {
            $looki: data.name,
          },
          id: {
            $ne: where.id,
          },
        },
      });

      if (existing) {
        throw new Error('An institution with this name already exists (case-insensitive).');
      }
    }
  },
};
