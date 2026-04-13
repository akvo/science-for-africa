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

    // 1. Run bootstrap function from src/index.js
    try {
      const { bootstrap } = require("../../src/index");
      if (bootstrap && typeof bootstrap === "function") {
        await bootstrap({ strapi: instance });
      }
    } catch (e) {
      console.warn("Could not run project bootstrap:", e.message);
    }

    // 2. Mock the email service to ensure no real emails/network calls are made during tests
    if (instance.plugins["email"]) {
      instance.plugins["email"].services.email.send = jest
        .fn()
        .mockImplementation((options) => {
          console.log(
            `[MOCK EMAIL] Sent to: ${options.to}, Subject: ${options.subject}`,
          );
          return Promise.resolve(true);
        });
    }
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
      const actionString = `api::auth.auth.${action}`;

      // Check if permission already exists for this role
      const existingPermission = await strapi
        .query("plugin::users-permissions.permission")
        .findOne({
          where: {
            action: actionString,
            role: role.id,
          },
        });

      if (!existingPermission) {
        await strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: actionString,
            role: role.id,
          },
        });
      }
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
