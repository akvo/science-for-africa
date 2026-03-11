'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi } */) {},

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
