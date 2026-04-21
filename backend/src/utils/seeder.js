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

const COMMUNITIES = [
  {
    name: "Community of Researchers",
    slug: "community-of-researchers",
    handle: "891 775 7240",
    initials: "CR",
    description:
      "Explore the latest trends in health, fitness, and mental well-being.",
    tags: ["Research", "Science", "Health", "Technology"],
  },
  {
    name: "Community of Innovators",
    slug: "community-of-innovators",
    handle: "442 889 1023",
    initials: "CI",
    description:
      "Lorem ipsum dolor sit amet consectetur. Eu dis pellentesque in elit auctor.",
    tags: ["Innovation", "Technology", "Startups", "AI"],
  },
  {
    name: "Community of Educators",
    slug: "community-of-educators",
    handle: "317 556 8891",
    initials: "CE",
    description:
      "Lorem ipsum dolor sit amet consectetur. Nunc et posuere cras bibendum cras. Diam felis sagittis suspendisse scelerisque quam.",
    tags: ["Education", "Teaching", "Curriculum", "STEM"],
  },
];

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

  // 3. Seed Communities
  const communityCount = await strapi.db
    .query("api::community.community")
    .count();
  if (communityCount === 0) {
    strapi.log.info("Seeding Communities...");
    for (const data of COMMUNITIES) {
      await strapi.db.query("api::community.community").create({ data });
    }
    strapi.log.info(`Seeded ${COMMUNITIES.length} communities.`);
  }

  // 3b. Synchronize French Translations for critical collections
  strapi.log.info("Synchronizing French translations...");
  await synchronizeTranslations(strapi, "api::interest.interest");
  await synchronizeTranslations(strapi, "api::institution.institution");

  // 4. Set Permissions (Ensure Public and Authenticated can search)
  const roles = ["public", "authenticated"];
  const actions = [
    "api::interest.interest.find",
    "api::institution.institution.find",
    "api::community.community.find",
    "api::community.community.findOne",
  ];
  for (const role of roles) {
    for (const action of actions) {
      await grantPermission(strapi, role, action);
    }
  }

  // Grant Public access to OTP verification (New custom API routes)
  const publicAuthActions = [
    "api::auth.auth.verifyOtp",
    "api::auth.auth.resendOtp",
    "api::auth.auth.registrationStatus",
  ];
  for (const action of publicAuthActions) {
    await grantPermission(strapi, "public", action);
  }

  // 5. Collaboration Call and Profile permissions (Authenticated only)
  const collaborationActions = [
    "api::auth.profile.update",
    "api::auth.profile.findUsers",
    "api::collaboration-call.collaboration-call.createWithInvites",
    "api::collaboration-call.collaboration-call.create-with-invites",
    "api::collaboration-call.collaboration-call.create",
    "api::collaboration-call.collaboration-call.find",
    "api::collaboration-invite.collaboration-invite.create",
    "api::collaboration-invite.collaboration-invite.find",
    "api::chat-message.chat-message.find",
    "api::chat-message.chat-message.create",
  ];

  for (const action of collaborationActions) {
    await grantPermission(strapi, "authenticated", action);
  }
};

module.exports = { seed };
