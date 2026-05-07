"use strict";

const {
  INSTITUTION_TYPES,
  COUNTRIES,
  INDIVIDUAL_ROLES,
} = require("./constants");

/**
 * Production seeder for critical metadata
 */
const seedProd = async (strapi) => {
  strapi.log.info("Checking production metadata...");

  // Helper for upsert
  const upsertEntry = async (uid, data, lookupField = "name") => {
    const existing = await strapi.db.query(uid).findOne({
      where: { [lookupField]: data[lookupField] },
    });

    if (existing) {
      return await strapi.db.query(uid).update({
        where: { id: existing.id },
        data,
      });
    } else {
      return await strapi.db.query(uid).create({
        data,
      });
    }
  };

  // 1. Seed Institution Types
  strapi.log.info("Synchronizing Institution Types (Production)...");
  for (let i = 0; i < INSTITUTION_TYPES.length; i++) {
    const name = INSTITUTION_TYPES[i];
    await upsertEntry("api::institution-type.institution-type", {
      name,
      isActive: true,
      sortOrder: i + 1,
      locale: "en",
    });
  }

  // Grant permissions for Institution Types
  const roles = ["public", "authenticated"];
  const instTypeActions = ["api::institution-type.institution-type.find"];

  for (const roleName of roles) {
    const role = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: roleName } });

    if (role) {
      for (const action of instTypeActions) {
        const existingPermission = await strapi.db
          .query("plugin::users-permissions.permission")
          .findOne({
            where: { action, role: role.id },
          });

        if (!existingPermission) {
          await strapi.db.query("plugin::users-permissions.permission").create({
            data: { action, role: role.id },
          });
          strapi.log.info(`Granted ${action} to ${roleName}`);
        }
      }
    }
  }

  // 2. Seed Countries
  strapi.log.info("Synchronizing Countries (Production)...");
  for (let i = 0; i < COUNTRIES.length; i++) {
    const name = COUNTRIES[i];
    await upsertEntry("api::country.country", {
      name,
      isActive: true,
      sortOrder: i + 1,
      locale: "en",
    });
  }

  // Grant permissions for Countries
  const countryActions = ["api::country.country.find"];

  for (const roleName of roles) {
    const role = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: roleName } });

    if (role) {
      for (const action of countryActions) {
        const existingPermission = await strapi.db
          .query("plugin::users-permissions.permission")
          .findOne({
            where: { action, role: role.id },
          });

        if (!existingPermission) {
          await strapi.db.query("plugin::users-permissions.permission").create({
            data: { action, role: role.id },
          });
          strapi.log.info(`Granted ${action} to ${roleName}`);
        }
      }
    }
  }

  // 3. Seed Individual Roles
  strapi.log.info("Synchronizing Individual Roles (Production)...");
  for (let i = 0; i < INDIVIDUAL_ROLES.length; i++) {
    const name = INDIVIDUAL_ROLES[i];
    await upsertEntry("api::individual-role.individual-role", {
      name,
      isActive: true,
      sortOrder: i + 1,
      locale: "en",
    });
  }

  // Grant permissions for Individual Roles
  const individualRoleActions = ["api::individual-role.individual-role.find"];

  for (const roleName of roles) {
    const role = await strapi.db
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: roleName } });

    if (role) {
      for (const action of individualRoleActions) {
        const existingPermission = await strapi.db
          .query("plugin::users-permissions.permission")
          .findOne({
            where: { action, role: role.id },
          });

        if (!existingPermission) {
          await strapi.db.query("plugin::users-permissions.permission").create({
            data: { action, role: role.id },
          });
          strapi.log.info(`Granted ${action} to ${roleName}`);
        }
      }
    }
  }

  // 4. Backfill existing users with fallback Individual Role "Knowledge Consumer"
  const knowledgeConsumer = await strapi.db
    .query("api::individual-role.individual-role")
    .findOne({ where: { name: "Knowledge Consumer" } });

  if (knowledgeConsumer) {
    const usersToUpdate = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: { roleType: { id: { $null: true } } },
      });

    if (usersToUpdate.length > 0) {
      strapi.log.info(
        `Backfilling ${usersToUpdate.length} users with fallback role 'Knowledge Consumer'...`,
      );
      for (const user of usersToUpdate) {
        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: user.id },
          data: { roleType: knowledgeConsumer.id },
        });
      }
    }
  }

  strapi.log.info("Production seeding and backfill complete.");
};

module.exports = { seedProd };
