/**
 * Strapi test utilities
 * Helper functions for testing Strapi applications
 */

const strapi = require("@strapi/strapi");
const fs = require("fs");
const path = require("path");

let instance;

/**
 * Starts Strapi instance for testing
 * Uses SQLite in-memory for fast test execution
 */
async function setupStrapi() {
  if (!instance) {
    process.env.NODE_ENV = "test";
    instance = await strapi
      .createStrapi({
        appDir: path.resolve(__dirname, "../.."),
      })
      .load();

    await instance.server.mount();
  }

  // Ensure isolation by clearing key tables on every suite start
  try {
    await instance.db.query("plugin::users-permissions.user").deleteMany({});

    // Grant permissions to Authenticated role
    const authenticatedRole = await instance.db
      .query("plugin::users-permissions.role")
      .findOne({
        where: { type: "authenticated" },
      });

    if (authenticatedRole) {
      const permission = await instance.db
        .query("plugin::users-permissions.permission")
        .findOne({
          where: {
            action: "plugin::users-permissions.user.me",
            role: authenticatedRole.id,
          },
        });

      if (!permission) {
        await instance.db.query("plugin::users-permissions.permission").create({
          data: {
            action: "plugin::users-permissions.user.me",
            role: authenticatedRole.id,
          },
        });
      }
    }
  } catch (err) {
    // console.log can be noisy
  }

  return instance;
}

/**
 * Stops and cleans up Strapi instance
 * For sequential tests, we keep the instance alive to avoid repeated boots.
 * Jest --forceExit will clean up the process.
 */
async function teardownStrapi() {
  // We don't destroy the instance here so other test suites can reuse it.
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
  const strapi = getStrapi();

  // Find the Authenticated role
  const authenticatedRole = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({
      where: { type: "authenticated" },
    });

  const defaultUser = {
    username: "testuser",
    email: "test@example.com",
    password: "Test123!",
    confirmed: true,
    blocked: false,
    role: authenticatedRole ? authenticatedRole.id : null,
    ...userData,
  };

  const user = await strapi.documents("plugin::users-permissions.user").create({
    data: defaultUser,
    status: "published",
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

module.exports = {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
  generateJwtToken,
};
