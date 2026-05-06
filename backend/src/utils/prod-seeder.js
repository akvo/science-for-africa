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

const COUNTRIES = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Democratic Republic of the Congo",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Ivory Coast",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
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

  // 2. Seed Countries if empty
  const countryCount = await strapi.db.query("api::country.country").count();

  if (countryCount === 0) {
    strapi.log.info("Seeding Countries (Production)...");
    for (let i = 0; i < COUNTRIES.length; i++) {
      const name = COUNTRIES[i];
      await strapi.db.query("api::country.country").create({
        data: { name, isActive: true, sortOrder: i + 1, locale: "en" },
      });
    }
    strapi.log.info(`Seeded ${COUNTRIES.length} Countries.`);

    // Grant permissions
    const roles = ["public", "authenticated"];
    const actions = ["api::country.country.find"];

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

module.exports = { seedProd, INSTITUTION_TYPES, COUNTRIES };
