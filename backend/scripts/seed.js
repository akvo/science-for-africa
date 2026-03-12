'use strict';

const strapi = require('@strapi/strapi');
const { seedData } = require('../src/utils/seeder');

/**
 * Standalone seed script
 */
async function runSeed() {
  console.log('🏗️ Booting Strapi for seeding...');
  
  try {
    const instance = await strapi
      .createStrapi({
        appDir: process.cwd(),
      })
      .load();

    // The bootstrap logic in index.js will run automatically here
    // Wait a bit for roles to be created by index.js bootstrap if they don't exist
    await new Promise(resolve => setTimeout(resolve, 2000));

    await seedData(instance);

    console.log('✨ Seeding process finished.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
