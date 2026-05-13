"use strict";

const {
  INSTITUTION_TYPES,
  COUNTRIES,
  INDIVIDUAL_ROLES,
} = require("./constants");
const { INTEREST_TAXONOMY } = require("./taxonomy");
const { grantPermission, revokePermission } = require("./permission-helpers");

/**
 * Helper for upsert
 */
const upsertEntry = async (strapi, uid, data, lookupField = "name") => {
  const locale = data.locale || "en";

  // 1. Use low-level db.query to find ALL records matching the lookup value across all locales/statuses
  // This is the most reliable way to detect duplicates in v5
  const matches = await strapi.db.query(uid).findMany({
    where: { [lookupField]: data[lookupField], locale: locale },
  });

  if (matches.length > 0) {
    // Take the first match as the "source of truth"
    const existing = matches[0];

    // 2. Brute-force cleanup of ANY other duplicates in the same locale
    if (matches.length > 1) {
      strapi.log.warn(
        `Found ${matches.length} duplicates for ${uid} ('${data[lookupField]}'). Purging...`,
      );
      for (let i = 1; i < matches.length; i++) {
        await strapi.db.query(uid).delete({
          where: { id: matches[i].id },
        });
      }
    }

    const { id, documentId, locale: entryLocale, ...newData } = data;

    // 3. Only update fields that have actually changed
    const updateData = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== existing[key]) {
        updateData[key] = newData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    // 4. Use Document Service for the final high-level update (ensures status/published/etc)
    return await strapi.documents(uid).update({
      documentId: existing.documentId,
      data: updateData,
      status: "published",
    });
  } else {
    // 5. Create new if not found
    return await strapi.documents(uid).create({
      data,
      status: "published",
    });
  }
};

/**
 * Synchronize Interest Taxonomy (Categories and Interests)
 * Uses Soft Migration: Marks missing records as isActive: false
 */
const syncInterestTaxonomy = async (strapi) => {
  strapi.log.info(
    "Starting Interest Taxonomy synchronization (Soft Migration)...",
  );

  const newCategoryNames = Object.keys(INTEREST_TAXONOMY);
  const allNewInterestNames = Object.values(INTEREST_TAXONOMY).flat();

  // 1. Deactivate legacy categories
  const existingCategories = await strapi
    .documents("api::interest-category.interest-category")
    .findMany({
      status: "published",
      locale: "en",
    });

  for (const cat of existingCategories) {
    if (!newCategoryNames.includes(cat.name) && cat.isActive !== false) {
      strapi.log.info(`Deactivating legacy category: ${cat.name}`);
      await strapi
        .documents("api::interest-category.interest-category")
        .update({
          documentId: cat.documentId,
          data: { isActive: false },
          status: "published",
        });
    }
  }

  // 2. Deactivate legacy interests
  const existingInterests = await strapi
    .documents("api::interest.interest")
    .findMany({
      status: "published",
      locale: "en",
    });

  for (const interest of existingInterests) {
    if (
      !allNewInterestNames.includes(interest.name) &&
      interest.isActive !== false
    ) {
      strapi.log.info(`Deactivating legacy interest: ${interest.name}`);
      await strapi.documents("api::interest.interest").update({
        documentId: interest.documentId,
        data: { isActive: false },
        status: "published",
      });
    }
  }

  // 3. Upsert New Taxonomy
  let categoriesCreated = 0;
  let interestsCreated = 0;

  for (const [categoryName, items] of Object.entries(INTEREST_TAXONOMY)) {
    // Find or Create/Update Category
    const categoryMatches = await strapi
      .documents("api::interest-category.interest-category")
      .findMany({
        filters: { name: categoryName },
        locale: "en",
      });

    let category = categoryMatches[0];

    if (!category) {
      strapi.log.info(`Creating category: ${categoryName}`);
      category = await strapi
        .documents("api::interest-category.interest-category")
        .create({
          data: { name: categoryName, isActive: true },
          status: "published",
          locale: "en",
        });
      categoriesCreated++;
    } else if (category.isActive === false) {
      strapi.log.info(`Re-activating category: ${categoryName}`);
      category = await strapi
        .documents("api::interest-category.interest-category")
        .update({
          documentId: category.documentId,
          data: { isActive: true },
          status: "published",
        });
    }

    // Process Interests
    for (const name of items) {
      const interestMatches = await strapi
        .documents("api::interest.interest")
        .findMany({
          filters: { name: { $eqi: name } },
          locale: "en",
          populate: ["interestCategory"],
        });

      const existingInterest = interestMatches[0];

      if (!existingInterest) {
        strapi.log.info(`Creating interest: ${name} -> ${categoryName}`);
        await strapi.documents("api::interest.interest").create({
          data: {
            name,
            isActive: true,
            interestCategory: category.documentId,
          },
          status: "published",
          locale: "en",
        });
        interestsCreated++;
      } else {
        const updateData = { isActive: true };
        let needsUpdate = existingInterest.isActive === false;

        // Ensure it's linked to the correct category
        if (
          !existingInterest.interestCategory ||
          existingInterest.interestCategory.documentId !== category.documentId
        ) {
          updateData.interestCategory = category.documentId;
          needsUpdate = true;
          strapi.log.info(
            `Updating/Linking interest: ${name} -> ${categoryName}`,
          );
        }

        if (needsUpdate) {
          await strapi.documents("api::interest.interest").update({
            documentId: existingInterest.documentId,
            data: updateData,
            status: "published",
          });
          interestsCreated++;
        }
      }
    }
  }

  strapi.log.info(
    `Taxonomy Sync complete: ${categoriesCreated} categories created/updated, ${interestsCreated} interests created/updated.`,
  );
};

/**
 * Synchronize Essential Permissions
 */
const syncPermissions = async (strapi) => {
  strapi.log.info("Synchronizing essential permissions...");

  const roles = ["public", "authenticated"];
  const actions = [
    "api::interest.interest.find",
    "api::interest-category.interest-category.find",
    "api::institution-type.institution-type.find",
    "api::institution.institution.find",
    "api::country.country.find",
    "api::individual-role.individual-role.find",
    "api::community.community.find",
    "api::community.community.findOne",
    "api::collaboration-invite.collaboration-invite.accept",
    "api::auth.auth.verifyOtp",
    "api::auth.auth.resendOtp",
    "api::auth.auth.registrationStatus",
  ];

  for (const role of roles) {
    for (const action of actions) {
      await grantPermission(strapi, role, action);
    }
  }

  // Revoke dangerous public permissions
  const publicRevokes = [
    "api::collaboration-call.collaboration-call.find",
    "api::collaboration-call.collaboration-call.findOne",
  ];
  for (const action of publicRevokes) {
    await revokePermission(strapi, "public", action);
  }
};

/**
 * Synchronize Metadata with Soft Migration (Countries, Institution Types, Individual Roles)
 */
const syncMetadata = async (strapi, uid, names, label) => {
  strapi.log.info(`Synchronizing ${label} (Soft Migration)...`);

  // 1. Deactivate records no longer in the constants
  const existingRecords = await strapi.db.query(uid).findMany({
    where: { isActive: true },
  });

  for (const record of existingRecords) {
    if (!names.includes(record.name)) {
      strapi.log.info(`Deactivating legacy ${label}: ${record.name}`);
      await strapi.db.query(uid).update({
        where: { id: record.id },
        data: { isActive: false },
      });
    }
  }

  // 2. Upsert current records
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    await upsertEntry(strapi, uid, {
      name,
      isActive: true,
      sortOrder: i + 1,
      locale: "en",
    });
  }
};

/**
 * Main Production Seeder
 */
const seedProd = async (strapi) => {
  strapi.log.info("Running Production Seeder...");

  // 1. Sync Taxonomy
  await syncInterestTaxonomy(strapi);

  // 2. Sync Permissions
  await syncPermissions(strapi);

  // 3. Sync Metadata (Institution Types, Countries, Individual Roles)
  await syncMetadata(
    strapi,
    "api::institution-type.institution-type",
    INSTITUTION_TYPES,
    "Institution Types",
  );
  await syncMetadata(strapi, "api::country.country", COUNTRIES, "Countries");
  await syncMetadata(
    strapi,
    "api::individual-role.individual-role",
    INDIVIDUAL_ROLES,
    "Individual Roles",
  );

  // 6. Backfill existing users with fallback Individual Role "Knowledge Consumer"
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

  strapi.log.info("Production Seeding complete.");
};

module.exports = {
  seedProd,
  syncInterestTaxonomy,
  syncPermissions,
  syncMetadata,
};
