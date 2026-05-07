"use strict";

const { createStrapi } = require("@strapi/strapi");

async function seed() {
  console.log("Initializing Strapi...");
  const app = await createStrapi().load();

  const { seedProd } = require("../src/utils/prod-seeder");

  try {
    console.log("🚀 Starting manual production seeding...");
    await seedProd(app);
    console.log("✅ Production seeding completed successfully.");
  } catch (error) {
    console.error("❌ Production seeding failed:", error);
    process.exit(1);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

seed();
