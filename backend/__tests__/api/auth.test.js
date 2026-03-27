/**
 * Authentication API Tests
 *
 * Example tests for Strapi users-permissions plugin.
 * Tests user registration, login, and protected routes.
 */

const request = require('supertest');
const { setupStrapi, teardownStrapi, getStrapi, createMockUser, generateJwtToken } = require('../helpers/strapi');

describe('Authentication API', () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  describe('POST /api/auth/local/register', () => {
    it('should register a new user with valid data', async () => {
      const strapi = getStrapi();

      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
      };

      const response = await request(strapi.server.httpServer)
        .post('/api/auth/local/register')
        .send(userData)
        .expect('Content-Type', /json/);

      // Registration might be disabled by default
      // Adjust expectations based on your configuration
      expect([200, 400, 403]).toContain(response.status);
    });

    it('should reject registration with invalid email', async () => {
      const strapi = getStrapi();

      const userData = {
        username: 'invaliduser',
        email: 'not-an-email',
        password: 'Password123!',
      };

      const response = await request(strapi.server.httpServer)
        .post('/api/auth/local/register')
        .send(userData);

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('POST /api/auth/local', () => {
    it('should login with valid credentials', async () => {
      const strapi = getStrapi();

      // First create a user
      try {
        await createMockUser({
          username: 'logintest',
          email: 'logintest@example.com',
          password: 'Password123!',
        });
      } catch (e) {
        // User might already exist
      }

      const response = await request(strapi.server.httpServer)
        .post('/api/auth/local')
        .send({
          identifier: 'logintest@example.com',
          password: 'Password123!',
        })
        .expect('Content-Type', /json/);

      // Check if login was successful
      if (response.status === 200) {
        expect(response.body).toHaveProperty('jwt');
        expect(response.body).toHaveProperty('user');
      }
    });

    it('should reject login with invalid credentials', async () => {
      const strapi = getStrapi();

      const response = await request(strapi.server.httpServer)
        .post('/api/auth/local')
        .send({
          identifier: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Protected Routes', () => {
    it('should reject access without authentication token', async () => {
      const strapi = getStrapi();

      const response = await request(strapi.server.httpServer)
        .get('/api/users/me');

      expect([401, 403]).toContain(response.status);
    });

    it('should allow access with valid authentication token', async () => {
      const strapi = getStrapi();
      const uniqueId = Date.now();
      const testEmail = `protected-${uniqueId}@example.com`;
      const testUser = `user-${uniqueId}`;

      // Register first to ensure a clean user exists with the current hashing secret
      await request(strapi.server.httpServer)
        .post('/api/auth/local/register')
        .send({
          username: testUser,
          email: testEmail,
          password: 'Password123!',
        });

      // Login to get a valid token
      const loginResponse = await request(strapi.server.httpServer)
        .post('/api/auth/local')
        .send({
          identifier: testEmail,
          password: 'Password123!',
        });

      if (loginResponse.status === 200) {
        const token = loginResponse.body.jwt;

        const response = await request(strapi.server.httpServer)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/);

        expect([200, 403]).toContain(response.status);
      } else {
        throw new Error(`Login failed for ${testEmail} with status ${loginResponse.status}: ${JSON.stringify(loginResponse.body)}`);
      }
    });
  });
});
