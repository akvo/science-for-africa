/**
 * Backfill Institutions Migration
 *
 * Ensures the "Akvo" institution exists and migrates all users to use it
 * for both affiliation and education.
 */

"use strict";

module.exports = async ({ strapi }) => {
  strapi.log.info("Running backfill-institutions migration...");

  // 1. Ensure "Akvo" institution exists
  let akvo = await strapi.db.query("api::institution.institution").findOne({
    where: { name: "Akvo" },
  });

  if (!akvo) {
    strapi.log.info('Creating "Akvo" institution...');
    akvo = await strapi.db.query("api::institution.institution").create({
      data: {
        name: "Akvo",
        type: "NGO",
        country: "Netherlands",
        verified: true,
        locale: "en",
      },
    });
  }

  // 2. Iterate through all users and migrate
  const users = await strapi.db
    .query("plugin::users-permissions.user")
    .findMany({
      populate: {
        institutionMemberships: {
          populate: {
            institution: true,
          },
        },
        highestEducationInstitution: true,
      },
    });

  strapi.log.info(`Found ${users.length} users to check for migration.`);

  for (const user of users) {
    const updates = {};
    let needsUpdate = false;

    // Check highestEducationInstitution
    if (!user.highestEducationInstitution) {
      updates.highestEducationInstitution = akvo.id;
      needsUpdate = true;
    }

    // Check InstitutionMembership
    const akvoMemberships = user.institutionMemberships?.filter(
      (m) => m.institution?.id === akvo.id,
    );

    if (!akvoMemberships || akvoMemberships.length === 0) {
      await strapi.db
        .query("api::institution-membership.institution-membership")
        .create({
          data: {
            user: user.id,
            institution: akvo.id,
            type: "member",
            verificationStatus: user.onboardingComplete || false,
            locale: "en",
          },
        });
    } else if (akvoMemberships.length > 1) {
      // CLEANUP: If we have duplicates, keep the first one and delete the rest
      strapi.log.info(
        `Cleaning up ${akvoMemberships.length - 1} duplicate Akvo memberships for user ${user.email}`,
      );
      const toDelete = akvoMemberships.slice(1).map((m) => m.id);
      await strapi.db
        .query("api::institution-membership.institution-membership")
        .deleteMany({
          where: { id: { $in: toDelete } },
        });
    }

    // Sync confirmed status if onboarding is complete (as requested)
    if (user.onboardingComplete && !user.confirmed) {
      updates.confirmed = true;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data: updates,
      });
    }
  }

  strapi.log.info("Backfill-institutions migration completed successfully.");
};
