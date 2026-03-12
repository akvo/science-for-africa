/**
 * Test setup file for Strapi testing
 * This file runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
// process.env.DATABASE_CLIENT = 'sqlite';
// process.env.DATABASE_FILENAME = '.tmp/test.db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.APP_KEYS = 'test-key-1,test-key-2';
process.env.API_TOKEN_SALT = 'test-token-salt';
process.env.ADMIN_JWT_SECRET = 'test-admin-jwt-secret';

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Add cleanup logic if needed
});
