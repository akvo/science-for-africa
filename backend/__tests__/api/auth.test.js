/**
 * Authentication API Tests
 *
 * Example tests for Strapi users-permissions plugin.
 * Tests user registration, login, and protected routes.
 */

const request = require("supertest");
const { setupStrapi, teardownStrapi } = require("../helpers/strapi");

describe("Authentication API", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Disable email confirmation for these specific tests
    const store = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "advanced",
    });
    const settings = await store.get();
    await store.set({ value: { ...settings, email_confirmation: false } });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  describe("POST /api/auth/local/register", () => {
    it("should register a new user with valid data", async () => {
      const uniqueId = Date.now();
      const userData = {
        username: `reguser-${uniqueId}`,
        email: `reg-${uniqueId}@example.com`,
        password: "Password123!",
      };

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("jwt");
    });

    it("should reject registration with invalid email", async () => {
      const userData = {
        username: "invaliduser",
        email: "not-an-email",
        password: "Password123!",
      };

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/local", () => {
    it("should login with valid credentials", async () => {
      const uniqueId = Date.now() + 1000;
      const testEmail = `login-${uniqueId}@example.com`;
      const testUser = `loginuser-${uniqueId}`;
      const testPassword = "Password123!";

      // Register first via public API to ensure consistent hashing
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: testUser,
          email: testEmail,
          password: testPassword,
        });

      // Login immediately (email confirmation is disabled in beforeAll)
      const response = await request(strapi.server.httpServer)
        .post("/api/auth/local")
        .send({
          identifier: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("jwt");
    });

    it("should reject login with invalid credentials", async () => {
      const response = await request(strapi.server.httpServer)
        .post("/api/auth/local")
        .send({
          identifier: "nonexistent@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("Protected Routes", () => {
    it("should reject access without authentication token", async () => {
      const response = await request(strapi.server.httpServer).get(
        "/api/users/me",
      );

      expect([401, 403]).toContain(response.status);
    });

    it("should allow access with valid authentication token", async () => {
      const uniqueId = Date.now() + 2000;
      const testEmail = `protected-${uniqueId}@example.com`;
      const testUser = `user-${uniqueId}`;
      const testPassword = "Password123!";

      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: testUser,
          email: testEmail,
          password: testPassword,
        });

      const loginRes = await request(strapi.server.httpServer)
        .post("/api/auth/local")
        .send({
          identifier: testEmail,
          password: testPassword,
        });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.jwt;

      const response = await request(strapi.server.httpServer)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect("Content-Type", /json/);

      expect(response.status).toBe(200);
    });
  });
});
