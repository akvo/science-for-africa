"use strict";

/**
 * Helper to grant permissions to a role
 */
const grantPermission = async (strapi, roleType, action) => {
  const role = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: roleType } });

  if (role) {
    const existing = await strapi.db
      .query("plugin::users-permissions.permission")
      .findOne({
        where: {
          role: role.id,
          action: action,
        },
      });

    if (!existing) {
      strapi.log.info(`Granting ${action} to ${roleType}...`);
      await strapi.db.query("plugin::users-permissions.permission").create({
        data: {
          action: action,
          role: role.id,
        },
      });
    }
  }
};

/**
 * Helper to revoke a permission from a role
 */
const revokePermission = async (strapi, roleType, action) => {
  const role = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: roleType } });

  if (!role) return;

  const existing = await strapi.db
    .query("plugin::users-permissions.permission")
    .findOne({ where: { role: role.id, action } });

  if (existing) {
    strapi.log.info(`Revoking ${action} from ${roleType}...`);
    await strapi.db
      .query("plugin::users-permissions.permission")
      .delete({ where: { id: existing.id } });
  }
};

module.exports = { grantPermission, revokePermission };
