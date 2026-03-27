/**
 * Strapi test utilities
 * Helper functions for testing Strapi applications
 */

const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

let instance;

/**
 * Starts Strapi instance for testing
 * Uses SQLite in-memory for fast test execution
 */
async function setupStrapi() {
  if (!instance) {
    instance = createStrapi({
      appDir: path.resolve(__dirname, '../..'),
      env: 'test',
    });

    // Set configuration manually before loading to ensure it's available
    const dbPath = path.join(__dirname, '../../.tmp/test.db');
    const tmpDir = path.join(__dirname, '../../.tmp');
    
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Database is still set here to ensure it uses the test DB during load()
    instance.config.set('database', {
      connection: {
        client: 'sqlite',
        connection: {
          filename: dbPath,
        },
        useNullAsDefault: true,
      },
    });

    await instance.load();

    // Set configuration manually after loading to ensure it's not overwritten by files
    instance.config.set('admin.auth.secret', 'test-secret');
    instance.config.set('admin.apiToken.salt', 'test-api-token-salt');
    instance.config.set('admin.transfer.token.salt', 'test-transfer-token-salt');
    instance.config.set('plugin::users-permissions.jwtSecret', 'test-secret');
    instance.config.set('server.app.keys', ['testKey1', 'testKey2']);

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
