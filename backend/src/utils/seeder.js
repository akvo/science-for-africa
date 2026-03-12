'use strict';

const { faker } = require('@faker-js/faker');
const { syncPermissions } = require('./permissions');

/**
 * Seed data for Science for Africa platform
 */
const seedData = async (strapi) => {
  // --- PRODUCTION BARRIER ---
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    console.error('❌ SEEDING BLOCKED: You are attempting to run the seeder in PRODUCTION.');
    console.error('If you REALLY need to do this, set ALLOW_SEED=true in your environment.');
    throw new Error('Seeding prohibited in production.');
  }

  console.log('🚀 Starting data seeding...');

  // Helper for fast truncation
  const truncateTable = async (uid) => {
    try {
      const tableName = strapi.db.metadata.get(uid).tableName;
      await strapi.db.connection.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
      console.log(`  - Truncated ${uid}`);
    } catch (error) {
      console.warn(`  ! Failed to truncate ${uid}, falling back to deleteMany.`, error.message);
      await strapi.db.query(uid).deleteMany({});
    }
  };

  // 0. Cleanup existing data
  console.log('🧹 Cleaning up existing data using TRUNCATE...');
  const tablesToClear = [
    'api::resource.resource',
    'api::community.community',
    'api::forum-category.forum-category',
    'api::thread.thread',
    'api::post.post',
    'api::mentorship-request.mentorship-request',
    'api::institution.institution',
    'plugin::users-permissions.user'
  ];

  for (const uid of tablesToClear) {
    await truncateTable(uid);
  }

  // 1. Synchronize API Permissions (Ensure roles have access before seeding)
  await syncPermissions(strapi);

  // 1. Fetch Roles
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
  const roleMap = {};
  roles.forEach(r => {
    roleMap[r.name] = r.id;
  });

  console.log('✅ Roles identified:', Object.keys(roleMap).join(', '));

  // 2. Seed Institutions
  console.log('🏛️ Seeding institutions...');
  const institutions = [];
  const africanCities = [
    { name: 'Nairobi', country: 'Kenya' },
    { name: 'Cape Town', country: 'South Africa' },
    { name: 'Lagos', country: 'Nigeria' },
    { name: 'Accra', country: 'Ghana' },
    { name: 'Cairo', country: 'Egypt' },
    { name: 'Dakar', country: 'Senegal' },
    { name: 'Addis Ababa', country: 'Ethiopia' },
  ];

  for (let i = 0; i < 5; i++) {
    const cityData = faker.helpers.arrayElement(africanCities);
    const inst = await strapi.documents('api::institution.institution').create({
      data: {
        name: `${faker.company.name()} Research Institute`,
        city: cityData.name,
        country: cityData.country,
        affiliationType: faker.helpers.arrayElement(['University', 'Research Org', 'Funding Agency']),
      },
      status: 'published',
    });
    institutions.push(inst);
  }

  // 3. Seed Users based on Figma Roles
  console.log('👥 Seeding users...');
  const users = [];

  const createFakeUser = async (roleName, overrides = {}) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    
    return await strapi.db.query('plugin::users-permissions.user').create({
      data: {
        username: email,
        email: email,
        password: 'password123',
        confirmed: true,
        blocked: false,
        role: roleMap[roleName],
        careerStage: faker.helpers.arrayElement(['Early-Career', 'Mid-Career', 'Senior']),
        expertise: faker.person.jobTitle(),
        onboardingStep: 5, // Completed
        orcidVerified: faker.datatype.boolean(0.8),
        affiliationStatus: 'Approved',
        ...overrides,
      },
    });
  };

  // Create specific personas
  // Platform Admin
  await createFakeUser('Platform Admin');

  // Org Admin
  for (let i = 0; i < 3; i++) {
    const inst = faker.helpers.arrayElement(institutions);
    await createFakeUser('Institution Admin', {
      institution: inst.id,
    });
  }

  // Institution Members / Experts
  for (let i = 0; i < 10; i++) {
    const inst = faker.helpers.arrayElement(institutions);
    const u = await createFakeUser('Member', {
      institution: inst.id,
      mentorAvailability: faker.datatype.boolean(0.6),
      orcidId: `0000-000${faker.string.numeric(1)}-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
    });
    users.push(u);
  }

  // Community Admins
  const communityAdmins = [];
  for (let i = 0; i < 3; i++) {
    const u = await createFakeUser('Community Admin');
    communityAdmins.push(u);
    users.push(u);
  }

  // Community Members
  for (let i = 0; i < 15; i++) {
    const u = await createFakeUser('Member');
    users.push(u);
  }

  // Individual Users
  for (let i = 0; i < 5; i++) {
    const u = await createFakeUser('Individual');
    users.push(u);
  }

  // Special Case: Users stuck in onboarding
  for (let i = 0; i < 3; i++) {
    await createFakeUser('Individual', {
      onboardingStep: 1,
      careerStage: null,
      expertise: null,
    });
  }

  // Special Case: Pending Affiliations
  for (let i = 0; i < 3; i++) {
    const inst = faker.helpers.arrayElement(institutions);
    await createFakeUser('Member', {
      institution: inst.id,
      affiliationStatus: 'Pending',
    });
  }

  // 4. Seed Communities
  console.log('🌍 Seeding communities...');
  const communities = [];
  const communityThemes = [
    'Genomics & Bioinformatics',
    'Health Policy & Systems',
    'Climate Change Resilience',
    'STEM Education Africa',
    'Sustainable Agriculture',
  ];

  for (const theme of communityThemes) {
    const comm = await strapi.documents('api::community.community').create({
      data: {
        name: theme,
        description: faker.lorem.paragraph(),
        isPrivate: faker.datatype.boolean(0.2),
      },
      status: 'published',
    });
    communities.push(comm);
  }

  // 5. Seed Forum Categories (Recursive)
  console.log('🗨️ Seeding forum categories...');
  for (const comm of communities) {
    const categories = ['General Discussion', 'Research Collaborations', 'Technical Q&A'];
    for (const catName of categories) {
      const parent = await strapi.documents('api::forum-category.forum-category').create({
        data: {
          name: catName,
          description: faker.lorem.sentence(),
          community: comm.documentId,
        },
        status: 'published',
      });

      // Subcategory
      if (faker.datatype.boolean(0.7)) {
        await strapi.documents('api::forum-category.forum-category').create({
          data: {
            name: `${catName} Archives`,
            description: 'Archived discussions',
            community: comm.documentId,
            parentCategory: parent.documentId,
          },
          status: 'published',
        });
      }

      // 6. Seed Threads & Posts
      console.log(`🧵 Seeding threads for ${catName}...`);
      for (let i = 0; i < 3; i++) {
        const author = faker.helpers.arrayElement(users);
        const thread = await strapi.documents('api::thread.thread').create({
          data: {
            title: faker.lorem.sentence(),
            author: author.id,
            forumCategory: parent.documentId,
            followers: faker.helpers.arrayElements(users, 3).map(u => u.id),
          },
          status: 'published',
        });

        // Posts
        for (let j = 0; j < 5; j++) {
          await strapi.documents('api::post.post').create({
            data: {
              content: faker.lorem.paragraphs(2),
              author: faker.helpers.arrayElement(users).id,
              thread: thread.documentId,
            },
            status: 'published',
          });
        }
      }
    }
  }

  // 7. Seed Resources
  console.log('📚 Seeding resources...');
  for (let i = 0; i < 20; i++) {
    const status = faker.helpers.arrayElement(['Draft', 'Pending', 'Published', 'Rejected']);
    const author = faker.helpers.arrayElement(users);
    const community = faker.helpers.arrayElement(communities);
    
    await strapi.documents('api::resource.resource').create({
      data: {
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        category: faker.helpers.arrayElement(['Toolkit', 'Story', 'Training', 'Dataset']),
        tags: { keywords: faker.lorem.words(3).split(' ') },
        reviewStatus: status,
        rejectionNotes: status === 'Rejected' ? faker.lorem.sentence() : null,
        author: author.id,
        community: community.documentId,
      },
      status: status === 'Published' ? 'published' : 'draft',
    });
  }

  // 8. Seed Mentorship Requests
  console.log('🤝 Seeding mentorship requests...');
  const mentors = users.filter(u => u.mentorAvailability);
  const mentees = users.filter(u => !u.mentorAvailability);

  if (mentors.length > 0 && mentees.length > 0) {
    for (let i = 0; i < 10; i++) {
      const mentor = faker.helpers.arrayElement(mentors);
      const mentee = faker.helpers.arrayElement(mentees);
      
      await strapi.db.query('api::mentorship-request.mentorship-request').create({
        data: {
          message: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(['Pending', 'Accepted', 'Declined']),
          mentor: mentor.id,
          mentee: mentee.id,
        },
      });
    }
  }

  console.log('🏁 Seeding completed successfully!');
};

module.exports = { seedData };
