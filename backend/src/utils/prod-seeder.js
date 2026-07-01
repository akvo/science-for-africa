"use strict";

const {
  INSTITUTION_TYPES,
  COUNTRIES,
  INDIVIDUAL_ROLES,
} = require("./constants");
const { DEFAULT_LANDING_PAGE } = require("./landing-page-data");
const { grantPermission, revokePermission } = require("./permission-helpers");

/**
 * Upsert Utility for Strapi v5 Document Service
 */
const upsertEntry = async (strapi, uid, data, lookupField = "name") => {
  const existing = await strapi.db.query(uid).findOne({
    where: { [lookupField]: data[lookupField] },
  });

  if (existing) {
    return await strapi.db.query(uid).update({
      where: { id: existing.id },
      data,
    });
  } else {
    return await strapi.documents(uid).create({
      data,
      status: "published",
      locale: "en",
    });
  }
};

/**
 * Synchronize Interest Taxonomy (Categories + Interests)
 */
const syncInterestTaxonomy = async (strapi) => {
  strapi.log.info("Synchronizing Interest Taxonomy (Soft Migration)...");

  const { INTEREST_TAXONOMY } = require("./taxonomy");

  // 1. Deactivate categories no longer in the constants
  const activeCategories = Object.keys(INTEREST_TAXONOMY);
  const existingCategories = await strapi.db
    .query("api::interest-category.interest-category")
    .findMany({
      where: { isActive: true },
    });

  for (const category of existingCategories) {
    if (!activeCategories.includes(category.name)) {
      strapi.log.info(`Deactivating legacy category: ${category.name}`);
      await strapi.db.query("api::interest-category.interest-category").update({
        where: { id: category.id },
        data: { isActive: false },
      });
    }
  }

  // 2. Deactivate interests no longer in the constants
  const allActiveInterests = Object.values(INTEREST_TAXONOMY).flat();
  const existingInterests = await strapi.db
    .query("api::interest.interest")
    .findMany({
      where: { isActive: true },
    });

  for (const interest of existingInterests) {
    if (!allActiveInterests.includes(interest.name)) {
      strapi.log.info(`Deactivating legacy interest: ${interest.name}`);
      await strapi.db.query("api::interest.interest").update({
        where: { id: interest.id },
        data: { isActive: false },
      });
    }
  }

  // 3. Upsert current categories and interests
  let categoriesCreated = 0;
  let interestsCreated = 0;

  for (const [categoryName, interests] of Object.entries(INTEREST_TAXONOMY)) {
    // Find or create category
    let category = await strapi.db
      .query("api::interest-category.interest-category")
      .findOne({
        where: { name: { $eqi: categoryName } },
      });

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
      await strapi
        .documents("api::interest-category.interest-category")
        .update({
          documentId: category.documentId,
          data: { isActive: true },
          status: "published",
        });
      categoriesCreated++;
    }

    // Upsert interests for this category
    for (const name of interests) {
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
    "api::auth.auth.logout",
    "api::auth.profile.publicProfile",
    "plugin::users-permissions.user.follow",
    "plugin::users-permissions.user.unfollow",
    "api::landing-page.landing-page.find",
    "api::resources-page.resources-page.find",
    "api::resource.resource.find",
  ];

  for (const role of roles) {
    for (const action of actions) {
      await grantPermission(strapi, role, action);
    }
  }

  // Grant public read access to collaboration calls and chat messages
  // (the controller filters out private calls for unauthenticated users)
  const publicGrants = [
    "api::collaboration-call.collaboration-call.find",
    "api::collaboration-call.collaboration-call.findOne",
    "api::chat-message.chat-message.find",
  ];
  for (const action of publicGrants) {
    await grantPermission(strapi, "public", action);
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
 * Synchronize Landing Page Content (EN/FR/AR/SW/PT)
 */
async function syncLandingPage(strapi) {
  strapi.log.info("Synchronizing Landing Page content...");

  const uid = "api::landing-page.landing-page";

  // 1. Get the existing English record (or any first record) to get the shared documentId
  const existingEn = await strapi.documents(uid).findMany({
    locale: "en",
    status: "published",
    limit: 1,
  });

  let sharedDocumentId;

  if (existingEn.length > 0) {
    sharedDocumentId = existingEn[0].documentId;
    strapi.log.info(
      `Landing Page exists (doc: ${sharedDocumentId}). Updating English content...`,
    );

    // Update existing English record to ensure it has latest fields/blocks
    await strapi.documents(uid).update({
      documentId: sharedDocumentId,
      data: DEFAULT_LANDING_PAGE,
      locale: "en",
      status: "published",
    });
  } else {
    strapi.log.info("Creating English Landing Page...");
    const enLanding = await strapi.documents(uid).create({
      data: DEFAULT_LANDING_PAGE,
      locale: "en",
      status: "published",
    });
    sharedDocumentId = enLanding.documentId;
  }

  // 2. Check for missing translations
  const otherLocales = ["fr", "ar", "sw", "pt"];
  const allLocales = await strapi.documents(uid).findMany({
    fields: ["locale"],
    status: "published",
  });
  const existingLocales = allLocales.map((d) => d.locale);

  for (const locale of otherLocales) {
    if (!existingLocales.includes(locale)) {
      strapi.log.info(
        `Adding missing translation: ${locale.toUpperCase()} (doc: ${sharedDocumentId})...`,
      );
      try {
        await strapi.documents(uid).create({
          documentId: sharedDocumentId,
          data: DEFAULT_LANDING_PAGE,
          locale,
          status: "published",
        });
      } catch (error) {
        strapi.log.error(
          `Failed to add translation ${locale}: ${error.message}`,
        );
        if (error.details) {
          strapi.log.error(JSON.stringify(error.details, null, 2));
        }
      }
    } else {
      // Optionally update existing translations too
      strapi.log.info(
        `Updating existing translation: ${locale.toUpperCase()}...`,
      );
      await strapi.documents(uid).update({
        documentId: sharedDocumentId,
        data: DEFAULT_LANDING_PAGE,
        locale,
        status: "published",
      });
    }
  }
}

/**
 * Main Production Seeder
 */
const seedProd = async (strapi) => {
  strapi.log.info("Running Production Seeder...");

  // 1. Sync Taxonomy
  await syncInterestTaxonomy(strapi);

  // 1b. Sync Landing Page
  await syncLandingPage(strapi);

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

  // 7. Backfill membership labels for admin display
  await backfillMembershipLabels(strapi);

  strapi.log.info("Production Seeding complete.");
};

/**
 * Backfill label field on community-membership and institution-membership
 * records that are missing it (for admin panel readability).
 */
const backfillMembershipLabels = async (strapi) => {
  // Community memberships
  const communityMemberships = await strapi.db
    .query("api::community-membership.community-membership")
    .findMany({
      where: { $or: [{ label: { $null: true } }, { label: "" }] },
      populate: ["user", "community"],
    });

  if (communityMemberships.length > 0) {
    strapi.log.info(
      `Backfilling labels for ${communityMemberships.length} community memberships...`,
    );
    for (const m of communityMemberships) {
      const userName = m.user?.username || m.user?.email || "?";
      const communityName = m.community?.name || "?";
      await strapi.db
        .query("api::community-membership.community-membership")
        .update({
          where: { id: m.id },
          data: { label: `${userName} — ${communityName}` },
        });
    }
  }

  // Institution memberships
  const institutionMemberships = await strapi.db
    .query("api::institution-membership.institution-membership")
    .findMany({
      where: { $or: [{ label: { $null: true } }, { label: "" }] },
      populate: ["user", "institution"],
    });

  if (institutionMemberships.length > 0) {
    strapi.log.info(
      `Backfilling labels for ${institutionMemberships.length} institution memberships...`,
    );
    for (const m of institutionMemberships) {
      const userName = m.user?.username || m.user?.email || "?";
      const institutionName = m.institution?.name || "?";
      await strapi.db
        .query("api::institution-membership.institution-membership")
        .update({
          where: { id: m.id },
          data: { label: `${userName} — ${institutionName}` },
        });
    }
  }
};

module.exports = {
  seedProd,
  syncInterestTaxonomy,
  syncPermissions,
  syncMetadata,
  syncLandingPage,
};
