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
  }

  // Ensure isolation and permissions on every setup call (per test file)
  try {
    // Clear users and permissions before tests to ensure isolation in Postgres
    await instance.query('plugin::users-permissions.user').deleteMany({});
    await instance.query('plugin::users-permissions.permission').deleteMany({
      where: { action: 'plugin::users-permissions.user.me' }
    });

    // Grant permissions to Authenticated role for tests
    const authenticatedRole = await instance.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });

    if (authenticatedRole) {
      await instance.query('plugin::users-permissions.permission').create({
        data: {
          action: 'plugin::users-permissions.user.me',
          role: authenticatedRole.id,
        },
      });
    }
  } catch (err) {
    console.error('Error during setupStrapi isolation/cleanup:', err);
  }

  return instance;
}

/**
 * Stops and cleans up Strapi instance
 */
async function teardownStrapi() {
  if (instance) {
    await instance.destroy();
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
  const strapi = getStrapi();

  // Find the Authenticated role
  const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });

  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123!',
    confirmed: true,
    blocked: false,
    role: authenticatedRole ? authenticatedRole.id : null,
    ...userData,
  };

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
