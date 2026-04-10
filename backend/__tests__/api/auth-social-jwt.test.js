"use strict";

const { setupStrapi, teardownStrapi } = require("../helpers/strapi");
const request = require("supertest");

describe("Social Auth JWT Verification", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should allow a social user to access /api/users/me with their JWT", async () => {
    const uniqueId = Date.now();
    // 1. Create a social user
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          username: `googleuser-${uniqueId}`,
          email: `google-${uniqueId}@example.com`,
          password: "Password123!",
          provider: "google",
          confirmed: true, // Manually set to true to isolate JWT issue
          role: 1, // Authenticated role usually has ID 1 or can be looked up
        },
      });

    // 2. Issue a JWT
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    // 3. Call /api/users/me
    const response = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.email).toBe(`google-${uniqueId}@example.com`);
  });

  it("should return 401 if user is NOT confirmed", async () => {
    const uniqueId = Date.now() + 10;
    // 1. Create an unconfirmed social user
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          username: `unconfirmed-${uniqueId}`,
          email: `unconfirmed-${uniqueId}@example.com`,
          password: "Password123!",
          provider: "google",
          confirmed: false,
        },
      });

    // 2. Issue a JWT
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    // 3. Call /api/users/me -> Should return 401 in Strapi if email confirmation is enabled
    // Note: Depends on advanced settings "Allow register" and email confirmation
    const response = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${jwt}`);

    // If this returns 401, then unconfirmed users cannot access /me
    // If the social flow fails to confirm the user, this is the cause.
    expect(response.status).toBe(401);
  });
});
