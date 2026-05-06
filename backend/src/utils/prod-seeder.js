"use strict";

const INSTITUTION_TYPES = [
  "University / Higher Education Institution",
  "Research Institute / Centre",
  "Government / Public Sector Agency",
  "Science Granting Council / Research Funder",
  "Innovation Agency / Technology Hub/Incubator",
  "Civil Society / NGO",
  "International Organisation / Multilateral Body",
  "Private Sector / Industry",
  "Research & Innovation Management Associations",
  "Independent / Consultant",
  "Other",
];

/**
 * Production seeder for critical metadata
 */
const seedProd = async (strapi) => {
  strapi.log.info("Checking production metadata...");

  // 1. Seed Institution Types if empty
  const institutionTypeCount = await strapi.db
    .query("api::institution-type.institution-type")
    .count();

  if (institutionTypeCount === 0) {
    strapi.log.info("Seeding Institution Types (Production)...");
    for (let i = 0; i < INSTITUTION_TYPES.length; i++) {
      const name = INSTITUTION_TYPES[i];
      await strapi.db.query("api::institution-type.institution-type").create({
        data: { name, isActive: true, sortOrder: i + 1, locale: "en" },
      });
    }
    strapi.log.info(`Seeded ${INSTITUTION_TYPES.length} Institution Types.`);

    // Grant permissions
    const roles = ["public", "authenticated"];
    const actions = ["api::institution-type.institution-type.find"];

    for (const roleName of roles) {
      const role = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: roleName } });

      if (role) {
        for (const action of actions) {
          const existingPermission = await strapi.db
            .query("plugin::users-permissions.permission")
            .findOne({
              where: { action, role: role.id },
            });

          if (!existingPermission) {
            await strapi.db
              .query("plugin::users-permissions.permission")
              .create({
                data: { action, role: role.id },
              });
            strapi.log.info(`Granted ${action} to ${roleName}`);
          }
        }
      }
    }
  }
};

module.exports = { seedProd, INSTITUTION_TYPES };
