/**
 * Strapi test utilities
 * Helper functions for testing Strapi applications
 */

const { createStrapi } = require("@strapi/strapi");
const fs = require("fs");
const path = require("path");

let instance;
let dbPath;

/**
 * Starts Strapi instance for testing
 * Uses SQLite in-memory for fast test execution
 */
async function setupStrapi() {
  if (!instance) {
    instance = createStrapi({
      appDir: path.resolve(__dirname, "../.."),
      env: "test",
    });

    // Set configuration manually before loading to ensure it's available
    const dbName = `test-${Date.now()}.db`;
    dbPath = path.join(__dirname, `../../.tmp/${dbName}`);
    const tmpDir = path.join(__dirname, "../../.tmp");

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Database is still set here to ensure it uses the test DB during load()
    instance.config.set("database", {
      connection: {
        client: "sqlite",
        connection: {
          filename: dbPath,
        },
        useNullAsDefault: true,
      },
    });

    await instance.load();

    // Set configuration manually after loading to ensure it's not overwritten by files
    instance.config.set("admin.auth.secret", "test-secret");
    instance.config.set("admin.apiToken.salt", "test-api-token-salt");
    instance.config.set(
      "admin.transfer.token.salt",
      "test-transfer-token-salt",
    );
    instance.config.set("plugin::users-permissions.jwtSecret", "test-secret");
    instance.config.set("server.app.keys", ["testKey1", "testKey2"]);

    await instance.server.mount();
  }
  return instance;
}

/**
 * Stops and cleans up Strapi instance
 */
async function teardownStrapi() {
  if (instance) {
    await instance.destroy();

    // Clean up test database
    if (dbPath && fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    instance = null;
    dbPath = null;
  }
}

/**
 * Gets the current Strapi instance
 */
function getStrapi() {
  return instance;
}

/**
 * Creates a mock user for testing authenticated routes
 */
async function createMockUser(userData = {}) {
  const defaultUser = {
    username: "testuser",
    email: "test@example.com",
    password: "Test123!",
    confirmed: true,
    blocked: false,
    ...userData,
  };

  const strapi = getStrapi();

  // Create user via service
  const user =
    await strapi.plugins["users-permissions"].services.user.add(defaultUser);

  // FORCE confirmation at the DB level to bypass email_confirmation settings
  await strapi.db.query("plugin::users-permissions.user").update({
    where: { id: user.id },
    data: { confirmed: true },
  });

  return user;
}

/**
 * Generates a JWT token for a user
 */
function generateJwtToken(user) {
  const strapi = getStrapi();
  return strapi.plugins["users-permissions"].services.jwt.issue({
    id: user.id,
  });
}

/**
 * Grants permissions to a role
 */
async function grantPermissions(roleType, permissions) {
  const strapi = getStrapi();
  const role = await strapi.query("plugin::users-permissions.role").findOne({
    where: { type: roleType },
  });

  if (!role) {
    throw new Error(`Role ${roleType} not found`);
  }

  for (const [controller, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      await strapi.query("plugin::users-permissions.permission").create({
        data: {
          action: `api::auth.auth.${action}`,
          role: role.id,
        },
      });
    }
  }
}

module.exports = {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
};
