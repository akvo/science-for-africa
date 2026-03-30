/**
 * TDD: Secure Profile Update Tests
 *
 * Verifies that users can update their own profile via /api/auth/me
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("Auth Me Update API", () => {
  let strapi;
  let user;
  let jwt;

  beforeAll(async () => {
    strapi = await setupStrapi();
    user = await createMockUser({
      username: "updateuser",
      email: "update@example.com",
    });
    jwt = generateJwtToken(user);

    // Grant permission in the test database
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    // Assign role to user if not present
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { role: authRole.id },
    });

    await grantPermissions("authenticated", {
      auth: ["updateMe"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should update profile with a clean contract payload", async () => {
    // Create an institution first to have a valid ID
    const institution = await strapi.db
      .query("api::institution.institution")
      .create({
        data: { name: "Test University" },
      });

    // This payload matches what the FRONTEND now produces
    const updateData = {
      firstName: "Updated",
      onboardingComplete: true,
      interests: [{ name: "Science" }, { name: "Medicine" }],
      institution: institution.id,
    };

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.onboardingComplete).toBe(true);
    expect(response.body.institution.id).toBe(institution.id);
    expect(response.body.interests).toHaveLength(2);
  });
});
