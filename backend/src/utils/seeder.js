const { grantPermission } = require("./permission-helpers");
const prodSeeder = require("./prod-seeder");
const {
  INSTITUTION_TYPES,
  COUNTRIES,
  INDIVIDUAL_ROLES,
} = require("./constants");

const INSTITUTIONS = [
  {
    name: "University of Nairobi",
    institutionTypeName: "University / Higher Education Institution",
    country: "Kenya",
    verified: true,
  },
  {
    name: "Makerere University",
    institutionTypeName: "University / Higher Education Institution",
    country: "Uganda",
    verified: true,
  },
  {
    name: "University of Cape Town",
    institutionTypeName: "University / Higher Education Institution",
    country: "South Africa",
    verified: true,
  },
  {
    name: "Kwame Nkrumah University of Science and Technology",
    institutionTypeName: "University / Higher Education Institution",
    country: "Ghana",
    verified: true,
  },
  {
    name: "Addis Ababa University",
    institutionTypeName: "University / Higher Education Institution",
    country: "Ethiopia",
    verified: true,
  },
  {
    name: "Cairo University",
    institutionTypeName: "University / Higher Education Institution",
    country: "Egypt",
    verified: true,
  },
  {
    name: "University of Ibadan",
    institutionTypeName: "University / Higher Education Institution",
    country: "Nigeria",
    verified: true,
  },
  {
    name: "Stellenbosch University",
    institutionTypeName: "University / Higher Education Institution",
    country: "South Africa",
    verified: true,
  },
  {
    name: "Science Foundation",
    institutionTypeName: "Civil Society / NGO",
    country: "Kenya",
    verified: true,
  },
  {
    name: "African Academy of Sciences",
    institutionTypeName: "Civil Society / NGO",
    country: "Kenya",
    verified: true,
  },
];

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
    description: "Study biodiversity patterns across East Africa.",
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-12-31T23:59:59.000Z",
    status: "Active",
    topics: ["Biodiversity", "Ecology"],
    communityName: "Community of Researchers",
    mentorIndex: 0,
    forcedStatus: "Pending", // For seeder logic
  },
  {
    title: "Climate Change Impact Study",
    description: "Socioeconomic impacts on small-scale farmers.",
    startDate: "2024-03-01T00:00:00.000Z",
    endDate: "2025-02-28T23:59:59.000Z",
    status: "Active",
    topics: ["Climate Change"],
    communityName: "Community of Innovators",
    mentorIndex: 1,
    forcedStatus: "Accepted",
  },
  {
    title: "Global Health Initiative",
    description: "Vaccine distribution strategies.",
    startDate: "2023-01-01T00:00:00.000Z",
    endDate: "2023-12-31T23:59:59.000Z",
    status: "Completed",
    topics: ["Public Health"],
    communityName: "Health and Wellness",
    mentorIndex: null, // No Mentor Assigned
    forcedStatus: "Accepted",
  },
  {
    title: "Sustainable Urban Development",
    description: "Green infrastructure models.",
    startDate: "2024-06-01T00:00:00.000Z",
    endDate: "2025-05-31T23:59:59.000Z",
    status: "Active",
    topics: ["Urban Planning"],
    communityName: "Community of Innovators",
    mentorIndex: 2,
    forcedStatus: "Pending",
  },
  {
    title: "Renewable Energy Access",
    description: "Solar micro-grids for rural communities.",
    startDate: "2023-06-01T00:00:00.000Z",
    endDate: "2024-05-31T23:59:59.000Z",
    status: "Completed",
    topics: ["Energy", "Sustainability"],
    communityName: "Community of Researchers",
    mentorIndex: 0,
    forcedStatus: "Pending", // Pending but project completed
  },
  {
    title: "AI in African Agriculture",
    description: "Machine learning models for crop yield prediction.",
    startDate: "2024-08-01T00:00:00.000Z",
    endDate: "2025-07-31T23:59:59.000Z",
    status: "Active",
    topics: ["AI", "AgriTech"],
    communityName: "Community of Innovators",
    mentorIndex: null, // No Mentor Assigned
    forcedStatus: "Accepted",
  },
];

const RESOURCES = [
  {
    name: "Draft Research Plan: Bio-Diversity",
    description: "Initial draft for East Africa biodiversity study.",
    resourceType: "report",
    status: "approved",
    communityName: "Community of Researchers",
    uploadedBy: 0, // Index in users
  },
  {
    name: "Climate Change Policy Brief",
    description: "Impact on small-scale farming in the region.",
    resourceType: "publication",
    status: "pending",
    communityName: "Community of Innovators",
    uploadedBy: 1,
  },
  {
    name: "Global Health Best Practices",
    description: "Dataset for vaccine distribution.",
    resourceType: "case-study",
    status: "approved",
    communityName: "Health and Wellness",
    uploadedBy: 2,
  },
  {
    name: "Urban Planning Framework",
    description: "Legacy urban development models (unsupported).",
    resourceType: "practice-note",
    status: "declined",
    communityName: "Community of Innovators",
    uploadedBy: 1,
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
  strapi.log.info("Checking if database needs seeding...");

  const allCommunities = await strapi.db
    .query("api::community.community")
    .findMany();

  // 0. Update Existing Users with educational data (Development only)
  const users = await strapi.db
    .query("plugin::users-permissions.user")
    .findMany();

  if (users.length > 0) {
    strapi.log.info(
      `Enriching ${users.length} existing users with sample data...`,
    );
    const allInstitutions = await strapi.db
      .query("api::institution.institution")
      .findMany();

    const individualRoles = await strapi.db
      .query("api::individual-role.individual-role")
      .findMany();

    const sampleDegrees = [
      "Doctorate (PhD)",
      "Master's Degree",
      "Bachelor's Degree",
      "PhD Candidate",
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Only update if data is missing
      if (!user.educationLevel || !user.highestEducationInstitution) {
        const institution = allInstitutions[i % allInstitutions.length];
        const degree = sampleDegrees[i % sampleDegrees.length];
        const roleRelation =
          individualRoles[i % individualRoles.length] || individualRoles[0];

        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: user.id },
          data: {
            educationLevel: user.educationLevel || degree,
            highestEducationInstitution:
              user.highestEducationInstitution || institution?.id,
            roleType: user.roleType || roleRelation?.id,
            onboardingComplete: true,
          },
        });
      }
    }
  }

  // Helper for upsert
  const upsertEntry = async (uid, data, lookupField = "name") => {
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

  // 1. Seed Metadata (Institution Types, Countries, Individual Roles)
  await prodSeeder.syncMetadata(
    strapi,
    "api::institution-type.institution-type",
    INSTITUTION_TYPES,
    "Institution Types",
  );
  await prodSeeder.syncMetadata(
    strapi,
    "api::country.country",
    COUNTRIES,
    "Countries",
  );
  await prodSeeder.syncMetadata(
    strapi,
    "api::individual-role.individual-role",
    INDIVIDUAL_ROLES,
    "Individual Roles",
  );

  // 2. Seed Interests (Taxonomy Sync with Soft Migration)
  await prodSeeder.syncInterestTaxonomy(strapi);

  // 2b. Seed Landing Page
  if (typeof prodSeeder.syncLandingPage === "function") {
    await prodSeeder.syncLandingPage(strapi);
  } else {
    strapi.log.warn(
      "syncLandingPage is not a function in prodSeeder. Skipping...",
    );
  }

  // 2. Seed Institutions
  strapi.log.info("Synchronizing Institutions...");
  const types = await strapi.db
    .query("api::institution-type.institution-type")
    .findMany();

  const countries = await strapi.db.query("api::country.country").findMany();

  for (const data of INSTITUTIONS) {
    const typeRelation = types.find(
      (t) => t.name.toLowerCase() === data.institutionTypeName.toLowerCase(),
    );

    const countryRelation = countries.find(
      (c) => c.name.toLowerCase() === data.country.toLowerCase(),
    );

    const { institutionTypeName, country, ...instData } = data;

    await upsertEntry("api::institution.institution", {
      ...instData,
      institutionType: typeRelation ? typeRelation.id : null,
      country: countryRelation ? countryRelation.id : null,
    });
  }

  // 3. Seed Communities (upsert by slug — skip existing ones)
  for (const data of COMMUNITIES) {
    const existing = await strapi.db
      .query("api::community.community")
      .findOne({ where: { slug: data.slug } });

    if (!existing) {
      strapi.log.info(`Seeding community: ${data.name}`);
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
  if (users.length > 0 && allCommunities.length > 0) {
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

  // 5a. Create specific mentorship calls for EACH user to ensure they all have mentees
  for (let i = 0; i < users.length; i++) {
    const mentorUser = users[i];
    const title = `Collaboration with ${mentorUser.fullName || mentorUser.username}`;
    const community = allCommunities[i % allCommunities.length];

    let call = await strapi.db
      .query("api::collaboration-call.collaboration-call")
      .findOne({ where: { title } });

    if (!call) {
      strapi.log.info(
        `Creating mentorship call for user: ${mentorUser.username} in community: ${community?.name}`,
      );
      call = await strapi.db
        .query("api::collaboration-call.collaboration-call")
        .create({
          data: {
            title,
            description: `A shared research initiative led by ${mentorUser.fullName || mentorUser.username}.`,
            startDate: new Date(),
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year from now
            status: "Active",
            createdByUser: mentorUser.id,
            community: community?.id,
          },
        });
    }

    allCalls.push({
      ...call,
      forcedStatus: "Accepted",
      mentorId: mentorUser.id,
    });
  }

  // 5b. Seed original static collaboration calls
  for (const data of COLLABORATION_CALLS) {
    let call = await strapi.db
      .query("api::collaboration-call.collaboration-call")
      .findOne({ where: { title: data.title } });

    if (!call) {
      strapi.log.info(`Creating static collaboration call: ${data.title}`);
      const { mentorIndex, ...callData } = data;
      const mentorUser =
        mentorIndex !== null ? users[mentorIndex] || users[0] : null;
      const creatorId = mentorUser?.id || null;

      const community = await strapi.db
        .query("api::community.community")
        .findOne({ where: { name: data.communityName } });

      call = await strapi.db
        .query("api::collaboration-call.collaboration-call")
        .create({
          data: {
            ...callData,
            community: community?.id,
            createdByUser: creatorId,
          },
        });
    }
    allCalls.push({
      ...call,
      forcedStatus: data.forcedStatus,
      mentorId: call.createdByUser,
    });
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
              inviteStatus: call.forcedStatus || "Accepted",
              role: call.mentorId === user.id ? "Mentor" : "Collaborator",
              invitedAt: new Date(),
            },
          });
        inviteCreatedCount++;
      } else {
        const existing = await strapi.db
          .query("api::collaboration-invite.collaboration-invite")
          .findOne({
            where: {
              invitedUser: user.id,
              collaborationCall: call.id,
            },
          });

        if (existing) {
          await strapi.db
            .query("api::collaboration-invite.collaboration-invite")
            .update({
              where: { id: existing.id },
              data: {
                inviteStatus: call.forcedStatus || "Accepted",
                role: call.mentorId === user.id ? "Mentor" : "Collaborator",
              },
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

  // 6. Seed Resources (Development only)
  strapi.log.info("Ensuring resources exist...");

  // 6a. Seed static resources
  for (const data of RESOURCES) {
    const existing = await strapi.db
      .query("api::resource.resource")
      .findOne({ where: { name: data.name } });

    if (!existing) {
      strapi.log.info(`Creating static resource: ${data.name}`);
      const { communityName, uploadedBy, ...resourceData } = data;

      const community = await strapi.db
        .query("api::community.community")
        .findOne({ where: { name: communityName } });

      const user = users[uploadedBy] || users[0];

      await strapi.db.query("api::resource.resource").create({
        data: {
          ...resourceData,
          community: community?.id,
          uploadedBy: user?.id,
          slug: data.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]/g, ""),
        },
      });
    }
  }

  // 6b. Ensure EVERY user has at least one resource (Development only)
  for (const user of users) {
    const resourceCount = await strapi.db
      .query("api::resource.resource")
      .count({ where: { uploadedBy: user.id } });

    if (resourceCount === 0) {
      strapi.log.info(`Creating default resource for user: ${user.username}`);
      const community = allCommunities[0]; // Link to first community
      const title = `Technical Note - ${user.username}`;

      await strapi.db.query("api::resource.resource").create({
        data: {
          name: title,
          description: `Automatically generated research note for ${user.username}.`,
          resourceType: "practice-note",
          status: "approved",
          community: community?.id,
          uploadedBy: user.id,
          slug: title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]/g, ""),
        },
      });
    }
  }

  // 3b. Synchronize French Translations for critical collections
  strapi.log.info("Synchronizing French translations...");
  await synchronizeTranslations(strapi, "api::interest.interest");
  await synchronizeTranslations(
    strapi,
    "api::institution-type.institution-type",
  );
  await synchronizeTranslations(strapi, "api::institution.institution");

  // Permissions synchronization
  await prodSeeder.syncPermissions(strapi);

  // 5. Collaboration Call and Profile permissions (Authenticated only - Dev specific extensions)
  const devCollaborationActions = [
    "api::auth.profile.getMe",
    "api::auth.profile.update",
    "api::auth.profile.me",
    "api::auth.profile.findUsers",
    "api::auth.profile.mentees",
    "api::community-membership.community-membership.find",
    "api::community-membership.community-membership.leave",
    "api::collaboration-call.collaboration-call.createWithInvites",
    "api::collaboration-call.collaboration-call.create-with-invites",
    "api::collaboration-call.collaboration-call.create",
    "api::collaboration-call.collaboration-call.find",
    "api::collaboration-call.collaboration-call.findOne",
    "api::collaboration-invite.collaboration-invite.create",
    "api::collaboration-invite.collaboration-invite.find",
    "api::collaboration-invite.collaboration-invite.requestJoin",
    "api::collaboration-invite.collaboration-invite.decline",
    "api::chat-message.chat-message.find",
    "api::chat-message.chat-message.create",
    "api::resource.resource.find",
    "api::resource.resource.findOne",
    "api::resource.resource.create",
    "api::resource.resource.delete",
    "plugin::upload.content-api.upload",
    "api::community.community.join",
    "api::community.community.leave",
    "api::resource-comment.resource-comment.find",
    "api::resource-comment.resource-comment.create",
  ];

  for (const action of devCollaborationActions) {
    await grantPermission(strapi, "authenticated", action);
  }
};

module.exports = { seed };
