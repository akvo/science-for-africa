"use strict";

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
      const existing = await global.strapi.db
        .query("api::institution.institution")
        .findOne({
          where: {
            name: {
              $eqi: data.name,
            },
            locale: data.locale || "en",
          },
        });

      if (existing) {
        throw new Error(
          "An institution with this name already exists in this locale (case-insensitive).",
        );
      }
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;
    if (data.name) {
      const existing = await global.strapi.db
        .query("api::institution.institution")
        .findOne({
          where: {
            name: {
              $eqi: data.name,
            },
            locale: data.locale,
            id: {
              $ne: where.id,
            },
          },
        });

      if (existing) {
        throw new Error(
          "An institution with this name already exists in this locale (case-insensitive).",
        );
      }
    }
  },
};
