"use strict";

const INTEREST_CATEGORIES = {
  Popular: [
    "Bioinformatics",
    "Genetics",
    "Virology",
    "Immunology",
    "Ecology",
    "Epidemiology",
    "Public Health",
    "Climate Change",
  ],
  Education: [
    "Curriculum Design",
    "STEM Outreach",
    "University Management",
    "Teacher Training",
  ],
  "Clinical & Medical": [
    "Clinical Trials",
    "Diagnostics",
    "Pharmacology",
    "Neuroscience",
    "Infectious Diseases",
  ],
  "Environmental & Earth": [
    "Sustainability",
    "Geophysics",
    "Hydrology",
    "Renewable Energy",
  ],
  "Socio-Economic": [
    "Health Economics",
    "Policy Analysis",
    "Social Informatics",
    "Gender Studies",
  ],
};

const INSTITUTIONS = [
  {
    name: "University of Nairobi",
    type: "Academic",
    country: "Kenya",
    verified: true,
  },
  {
    name: "Makerere University",
    type: "Academic",
    country: "Uganda",
    verified: true,
  },
  {
    name: "University of Cape Town",
    type: "Academic",
    country: "South Africa",
    verified: true,
  },
  {
    name: "Kwame Nkrumah University of Science and Technology",
    type: "Academic",
    country: "Ghana",
    verified: true,
  },
  {
    name: "Addis Ababa University",
    type: "Academic",
    country: "Ethiopia",
    verified: true,
  },
  {
    name: "Cairo University",
    type: "Academic",
    country: "Egypt",
    verified: true,
  },
  {
    name: "University of Ibadan",
    type: "Academic",
    country: "Nigeria",
    verified: true,
  },
  {
    name: "Stellenbosch University",
    type: "Academic",
    country: "South Africa",
    verified: true,
  },
  { name: "Science Foundation", type: "NGO", country: "Kenya", verified: true },
  {
    name: "African Academy of Sciences",
    type: "NGO",
    country: "Kenya",
    verified: true,
  },
];

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
 * Helper to synchronize French translations for a collection
 */
const synchronizeTranslations = async (strapi, uid) => {
  try {
    // 1. Get all English records
    const entries = await strapi.documents(uid).findMany({
      locale: "en",
      status: "published",
    });

    for (const entry of entries) {
      const docId = entry.documentId;

      // 2. Check if this document already has a French version
      // In v5, we can fetch all locales for a given documentId
      const allLocales = await strapi.documents(uid).findMany({
        filters: { documentId: docId },
        fields: ["locale"],
        status: "published",
      });

      const frExists = allLocales.some((loc) => loc.locale === "fr");

      if (!frExists) {
        // 2b. Secondary check: does an entry with the same unique name/title exist in 'fr'?
        // This prevents collisions if the record was previously created under a different documentId.
        const businessFields = ["name", "title"];
        const collisionFilter = {};
        let hasBusinessField = false;

        for (const field of businessFields) {
          if (entry[field]) {
            collisionFilter[field] = { $eqi: entry[field] };
            hasBusinessField = true;
          }
        }

        if (hasBusinessField) {
          const collision = await strapi.documents(uid).findMany({
            filters: collisionFilter,
            locale: "fr",
            status: "published",
            limit: 1,
          });

          if (collision.length > 0) {
            continue;
          }
        }

        strapi.log.info(
          `Creating French translation for ${uid} (doc: ${docId})...`,
        );

        // Clean entry: Extract business fields only
        const {
          id,
          documentId,
          locale,
          localizations,
          publishedAt,
          createdAt,
          updatedAt,
          ...businessData
        } = entry;

        // Use Document Service to create a translation for an existing documentId
        await strapi.documents(uid).create({
          documentId: docId,
          locale: "fr",
          data: businessData,
          status: "published",
        });
      }
    }
  } catch (error) {
    strapi.log.error(
      `Failed to synchronize translations for ${uid}: ${error.message}`,
    );
  }
};

/**
 * Seeder Utility
 */
const seed = async (strapi) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  strapi.log.info("Checking if database needs seeding...");

  // 1. Seed Interests
  const interestCount = await strapi.db.query("api::interest.interest").count();
  if (interestCount === 0) {
    strapi.log.info("Seeding Interests...");
    for (const [category, items] of Object.entries(INTEREST_CATEGORIES)) {
      for (const name of items) {
        await strapi.db.query("api::interest.interest").create({
          data: { name, category },
        });
      }
    }
    strapi.log.info(
      `Seeded ${Object.values(INTEREST_CATEGORIES).flat().length} Interests.`,
    );
  }

  // 2. Seed Institutions
  const institutionCount = await strapi.db
    .query("api::institution.institution")
    .count();
  if (institutionCount === 0) {
    strapi.log.info("Seeding Institutions...");
    for (const data of INSTITUTIONS) {
      await strapi.db.query("api::institution.institution").create({
        data,
      });
    }
    strapi.log.info(`Seeded ${INSTITUTIONS.length} Institutions.`);
  }

  // 3. Synchronize French Translations for critical collections
  strapi.log.info("Synchronizing French translations...");
  await synchronizeTranslations(strapi, "api::interest.interest");
  await synchronizeTranslations(strapi, "api::institution.institution");

  // 4. Set Permissions (Ensure Public and Authenticated can search)
  const roles = ["public", "authenticated"];
  const actions = [
    "api::interest.interest.find",
    "api::institution.institution.find",
  ];
  for (const role of roles) {
    for (const action of actions) {
      await grantPermission(strapi, role, action);
    }
  }

  // 4. Collaboration Call permissions (Authenticated only)
  const collaborationActions = [
    "api::auth.profile.update",
    "api::auth.profile.findUsers",
    "api::collaboration-call.collaboration-call.createWithInvites",
    "api::collaboration-call.collaboration-call.create-with-invites",
    "api::collaboration-call.collaboration-call.create",
    "api::collaboration-call.collaboration-call.find",
    "api::collaboration-invite.collaboration-invite.create",
    "api::collaboration-invite.collaboration-invite.find",
  ];

  for (const action of collaborationActions) {
    await grantPermission(strapi, "authenticated", action);
  }
};

module.exports = { seed };
