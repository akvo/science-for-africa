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
 * Helper to revoke a permission from a role (inverse of grantPermission).
 * Used to clean up permissions that were granted in earlier seeder runs but
 * shouldn't be present anymore.
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

const COMMUNITIES = [
  {
    name: "Community of Researchers",
    slug: "community-of-researchers",
    handle: "891 775 7240",
    initials: "CR",
    description:
      "Explore the latest trends in health, fitness, and mental well-being.",
    tags: ["Research", "Science", "Health", "Technology"],
    subscribers: 63716,
    posts: 323,
    subCommunities: [
      {
        name: "Health and Wellness",
        slug: "health-and-wellness",
        initials: "HW",
        description:
          "Explore the latest trends in health, fitness, and mental well-being.",
        subscribers: 150000,
        posts: 89,
        tags: ["Health", "Wellness", "Fitness"],
      },
      {
        name: "Travel and Adventure",
        slug: "travel-and-adventure",
        initials: "TA",
        description:
          "Discover breathtaking destinations and tips for your next journey.",
        subscribers: 95000,
        posts: 56,
        tags: ["Travel", "Adventure", "Photography"],
      },
      {
        name: "Arts and Culture",
        slug: "arts-and-culture",
        initials: "AC",
        description:
          "Dive into the world of creativity, from art history to modern expression.",
        subscribers: 75000,
        posts: 41,
        tags: ["Art", "Culture", "Creativity"],
      },
    ],
  },
  {
    name: "Community of Innovators",
    slug: "community-of-innovators",
    handle: "442 889 1023",
    initials: "CI",
    description:
      "Lorem ipsum dolor sit amet consectetur. Eu dis pellentesque in elit auctor.",
    tags: ["Innovation", "Technology", "Startups", "AI"],
    subscribers: 218000,
    posts: 198,
    subCommunities: [
      {
        name: "Science and Technology",
        slug: "science-and-technology",
        initials: "ST",
        description:
          "Lorem ipsum dolor sit amet consectetur. Eu dis pellentesque in elit auctor.",
        subscribers: 218000,
        posts: 112,
        tags: ["Science", "Technology"],
      },
    ],
  },
  {
    name: "Community of Educators",
    slug: "community-of-educators",
    handle: "317 556 8891",
    initials: "CE",
    description:
      "Lorem ipsum dolor sit amet consectetur. Nunc et posuere cras bibendum cras. Diam felis sagittis suspendisse scelerisque quam.",
    tags: ["Education", "Teaching", "Curriculum", "STEM"],
    subscribers: 41500,
    posts: 87,
    subCommunities: [
      {
        name: "Science and Technology",
        slug: "educators-science-and-technology",
        initials: "ST",
        description:
          "Lorem ipsum dolor sit amet consectetur. Eu dis pellentesque in elit auctor.",
        subscribers: 218000,
        posts: 75,
        tags: ["Science", "Technology", "Education"],
      },
    ],
  },
];

const COLLABORATION_CALLS = [
  {
    title: "Bio-Diversity Research Project",
    description:
      "Join our cross-border research team to study biodiversity patterns across East Africa.",
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-12-31T23:59:59.000Z",
    status: "Active",
    topics: ["Biodiversity", "Ecology", "East Africa"],
    communityName: "Community of Researchers",
  },
  {
    title: "Climate Change Impact Study",
    description:
      "A collaborative study on the socioeconomic impacts of climate change on small-scale farmers.",
    startDate: "2024-03-01T00:00:00.000Z",
    endDate: "2025-02-28T23:59:59.000Z",
    status: "Active",
    topics: ["Climate Change", "Agriculture", "Socioeconomic"],
    communityName: "Community of Innovators",
  },
  {
    title: "Global Health Initiative",
    description:
      "Past collaboration focusing on vaccine distribution strategies in sub-Saharan Africa.",
    startDate: "2023-01-01T00:00:00.000Z",
    endDate: "2023-12-31T23:59:59.000Z",
    status: "Completed",
    topics: ["Public Health", "Vaccines", "Africa"],
    communityName: "Health and Wellness",
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
      const { subCommunities, ...parentData } = data;
      const parent = await strapi.db
        .query("api::community.community")
        .create({ data: parentData });

      if (subCommunities && subCommunities.length) {
        for (const sub of subCommunities) {
          await strapi.db.query("api::community.community").create({
            data: { ...sub, parent: parent.id },
          });
        }
      }
    }
    strapi.log.info(
      `Seeded ${COMMUNITIES.length} parent communities with sub-communities.`,
    );
  }

  // 4. Seed memberships for existing users (Development only)
  const users = await strapi.db
    .query("plugin::users-permissions.user")
    .findMany();

  if (users.length > 0) {
    const allCommunities = await strapi.db
      .query("api::community.community")
      .findMany();

    if (allCommunities.length > 0) {
      strapi.log.info(
        `Checking community memberships for ${users.length} users...`,
      );
      for (const user of users) {
        const membershipCount = await strapi.db
          .query("api::community-membership.community-membership")
          .count({ where: { user: user.id } });

        if (membershipCount === 0) {
          // Shuffle and pick 1-3 random communities
          const shuffled = [...allCommunities].sort(() => 0.5 - Math.random());
          const count = Math.min(
            Math.floor(Math.random() * 3) + 1,
            shuffled.length,
          );
          const selected = shuffled.slice(0, count);

          strapi.log.info(
            `Joining ${user.username} to ${selected.length} random communities...`,
          );

          for (const community of selected) {
            await strapi.db
              .query("api::community-membership.community-membership")
              .create({
                data: {
                  user: user.id,
                  community: community.id,
                  role: "Member",
                  joinedAt: new Date(),
                },
              });
          }
        }
      }
    }
  }

  // 5. Seed Collaboration Calls and Invites (Development only)
  strapi.log.info("Ensuring collaboration calls and invites exist...");

  const allCalls = [];
  for (const data of COLLABORATION_CALLS) {
    let call = await strapi.db
      .query("api::collaboration-call.collaboration-call")
      .findOne({ where: { title: data.title } });

    if (!call) {
      strapi.log.info(`Creating collaboration call: ${data.title}`);
      call = await strapi.db
        .query("api::collaboration-call.collaboration-call")
        .create({
          data: {
            ...data,
            createdByUser: users[0]?.id, // Default to first user as creator
          },
        });
    }
    allCalls.push(call);
  }

  // Ensure every user has an invite for every call
  let inviteCreatedCount = 0;
  for (const user of users) {
    for (const call of allCalls) {
      const inviteCount = await strapi.db
        .query("api::collaboration-invite.collaboration-invite")
        .count({
          where: {
            invitedUser: user.id,
            collaborationCall: call.id,
          },
        });

      if (inviteCount === 0) {
        await strapi.db
          .query("api::collaboration-invite.collaboration-invite")
          .create({
            data: {
              invitedUser: user.id,
              collaborationCall: call.id,
              email: user.email,
              inviteStatus: "Accepted",
              role: "Collaborator",
              invitedAt: new Date(),
            },
          });
        inviteCreatedCount++;
      } else {
        // Check if status is missing and update if necessary
        const existing = await strapi.db
          .query("api::collaboration-invite.collaboration-invite")
          .findOne({
            where: {
              invitedUser: user.id,
              collaborationCall: call.id,
              inviteStatus: { $null: true },
            },
          });

        if (existing) {
          await strapi.db
            .query("api::collaboration-invite.collaboration-invite")
            .update({
              where: { id: existing.id },
              data: { inviteStatus: "Accepted" },
            });
        }
      }
    }
  }

  if (inviteCreatedCount > 0) {
    strapi.log.info(
      `Created ${inviteCreatedCount} new collaboration invites for ${users.length} users.`,
    );
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
    "api::collaboration-invite.collaboration-invite.accept",
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
    "api::auth.profile.getMe",
    "api::auth.profile.update",
    "api::auth.profile.me",
    "api::auth.profile.findUsers",
    "api::community-membership.community-membership.find",
    "api::community-membership.community-membership.leave",
    "api::collaboration-call.collaboration-call.createWithInvites",
    "api::collaboration-call.collaboration-call.create-with-invites",
    "api::collaboration-call.collaboration-call.create",
    "api::collaboration-call.collaboration-call.find",
    "api::collaboration-call.collaboration-call.findOne",
    "api::collaboration-invite.collaboration-invite.create",
    "api::collaboration-invite.collaboration-invite.find",
    "api::chat-message.chat-message.find",
    "api::chat-message.chat-message.create",
    "api::resource.resource.find",
    "api::resource.resource.findOne",
    "api::resource.resource.create",
    "plugin::upload.content-api.upload",
    "api::community.community.join",
    "api::community.community.leave",
  ];

  for (const action of collaborationActions) {
    await grantPermission(strapi, "authenticated", action);
  }

  // 6. Revoke permissions that were previously granted in error.
  const publicRevokes = [
    "api::collaboration-call.collaboration-call.find",
    "api::collaboration-call.collaboration-call.findOne",
  ];
  for (const action of publicRevokes) {
    await revokePermission(strapi, "public", action);
  }
};

module.exports = { seed };
