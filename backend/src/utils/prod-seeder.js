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

const INDIVIDUAL_ROLES = [
  "Knowledge Consumer",
  "Knowledge Contributor",
  "Working Group Member",
  "Working Group Lead / Facilitator",
  "Mentor",
  "Mentee",
  "Event Organiser / Host",
  "Reviewer / Expert Advisor",
  "Institutional Representative",
  "Observer",
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

  // 3. Seed Individual Roles if empty
  const individualRoleCount = await strapi.db
    .query("api::individual-role.individual-role")
    .count();

  if (individualRoleCount === 0) {
    strapi.log.info("Seeding Individual Roles (Production)...");
    for (let i = 0; i < INDIVIDUAL_ROLES.length; i++) {
      const name = INDIVIDUAL_ROLES[i];
      await strapi.db.query("api::individual-role.individual-role").create({
        data: { name, isActive: true, sortOrder: i + 1, locale: "en" },
      });
    }
    strapi.log.info(`Seeded ${INDIVIDUAL_ROLES.length} Individual Roles.`);

    // Grant permissions
    const roles = ["public", "authenticated"];
    const actions = ["api::individual-role.individual-role.find"];

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

module.exports = { seedProd, INSTITUTION_TYPES, COUNTRIES };
