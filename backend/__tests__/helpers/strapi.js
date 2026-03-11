/**
 * Strapi test utilities
 * Helper functions for testing Strapi applications
 */

const strapi = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

let instance;

/**
 * Starts Strapi instance for testing
 * Uses SQLite in-memory for fast test execution
 */
async function setupStrapi() {
  if (!instance) {
    process.env.NODE_ENV = 'test';
    instance = await strapi.createStrapi({
      appDir: path.resolve(__dirname, '../..'),
    }).load();

    await instance.server.mount();

    // Grant permissions to Authenticated role for tests
    const authenticatedRole = await instance.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });

    await instance.query('plugin::users-permissions.permission').create({
      data: {
        action: 'plugin::users-permissions.user.me',
        role: authenticatedRole.id,
      },
    });
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
    const dbPath = path.join(__dirname, '../../.tmp/test.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    instance = null;
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
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123!',
    confirmed: true,
    blocked: false,
    ...userData,
  };

  const strapi = getStrapi();
  const user = await strapi.plugins['users-permissions'].services.user.add(defaultUser);

  return user;
}

/**
 * Generates a JWT token for a user
 */
function generateJwtToken(user) {
  const strapi = getStrapi();
  return strapi.plugins['users-permissions'].services.jwt.issue({
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
