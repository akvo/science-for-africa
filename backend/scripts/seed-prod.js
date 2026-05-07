const { createStrapi } = require("@strapi/strapi");
const { seedProd } = require("../src/utils/prod-seeder");
const path = require("path");

async function run() {
  console.log("🚀 Initializing Strapi for Production Seeding...");

  try {
    // Load Strapi without starting the server
    const app = createStrapi({
      appDir: path.resolve(__dirname, ".."),
    });

    await app.load();

    console.log("🔄 Running Production Seeders...");

    // 1. Sync Interests & Categories (Taxonomy)
    console.log("   - Syncing Taxonomy...");
    await seedProd(app);

    // Future seeders can be added here
    // e.g., await seedRoles(app);

    console.log("✅ Production seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Production seeding failed:", err);
    process.exit(1);
  }
}

run();
