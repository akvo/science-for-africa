/**
 * Auth Registration Integration Tests
 *
 * Verifies the register controller override in index.js for the fullName field.
 */

const request = require("supertest");
const { setupStrapi, teardownStrapi, getStrapi } = require("../helpers/strapi");

describe("Auth Registration (Integration)", () => {
  let strapi;

  beforeAll(async () => {
    await setupStrapi();
    strapi = getStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should allow registration with fullName parameter", async () => {
    const response = await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .send({
        username: "integration_test_user",
        email: "integration_test@example.com",
        password: "Password123!",
        fullName: "Integration Test User",
      })
      .expect(200);

    const { user } = response.body;
    expect(user).toBeDefined();
    expect(user.username).toBe("integration_test_user");
    expect(user.fullName).toBe("Integration Test User");
    expect(user.firstName).toBe("Integration");
    expect(user.lastName).toBe("Test User");

    // Verify in database as well
    const dbUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
      });

    expect(dbUser.fullName).toBe("Integration Test User");
    expect(dbUser.firstName).toBe("Integration");
    expect(dbUser.lastName).toBe("Test User");
  });

  it("should still allow registration without fullName (backward compatibility)", async () => {
    const response = await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .send({
        username: "compat_test_user",
        email: "compat_test@example.com",
        password: "Password123!",
      })
      .expect(200);

    const { user } = response.body;
    expect(user).toBeDefined();
    expect(user.username).toBe("compat_test_user");
  });
});
