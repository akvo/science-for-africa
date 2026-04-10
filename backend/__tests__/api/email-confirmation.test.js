/**
 * Email Confirmation TDD Reproduction Test
 *
 * Verifies that email confirmation returns JSON instead of a 302 redirect.
 */

const request = require("supertest");
const { setupStrapi, teardownStrapi, getStrapi } = require("../helpers/strapi");

describe("Email Confirmation (TDD)", () => {
  let strapi;

  beforeAll(async () => {
    // setupStrapi will trigger the bootstrap code in src/index.js
    await setupStrapi();
    strapi = getStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should return JSON `{ success: true }` and status 200 when confirmation is successful", async () => {
    const uniqueId = Date.now();
    const userData = {
      username: `confirm-${uniqueId}`,
      email: `confirm-${uniqueId}@example.com`,
      password: "Password123!",
      fullName: "Confirm User",
    };

    // 1. Ensure email confirmation is enabled and redirection is set (simulating current buggy state)
    // Actually, our bootstrap in index.js already sets this.
    // We want to prove that with the CURRENT code, it returns 302.

    // 2. Register user
    const regResponse = await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .send(userData)
      .expect(200);

    // 3. Get confirmationToken from database
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: userData.email },
      });

    expect(user.confirmationToken).toBeDefined();
    expect(user.confirmed).toBe(false);

    // DEBUG: Log current settings
    const store = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "advanced",
    });
    const currentSettings = await store.get();
    console.log(
      "DEBUG: currentSettings.email_confirmation_redirection =",
      `"${currentSettings.email_confirmation_redirection}"`,
    );

    // 4. Call confirmation endpoint
    const response = await request(strapi.server.httpServer).get(
      `/api/auth/email-confirmation?confirmation=${user.confirmationToken}`,
    );

    console.log("DEBUG: response.status =", response.status);
    console.log("DEBUG: response.header.location =", response.header.location);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);

    // 5. Verify user is now confirmed
    const confirmedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
      });
    expect(confirmedUser.confirmed).toBe(true);
    expect(confirmedUser.confirmationToken).toBeNull();
  });
});
