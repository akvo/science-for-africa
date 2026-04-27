/**
 * Profile Institution Integration Tests
 *
 * Verifies that /api/auth/me handles the new membership and education relations.
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("Profile Institution API", () => {
  let strapi;
  let user;
  let jwt;

  beforeAll(async () => {
    strapi = await setupStrapi();
    user = await createMockUser({
      username: "profiletest",
      email: "profile@example.com",
    });

    const roles = await strapi.db
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { role: authRole.id },
    });

    jwt = generateJwtToken(user);

    await grantPermissions("authenticated", {
      profile: ["update", "me"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should update profile with highestEducationInstitution", async () => {
    const institution = await strapi
      .documents("api::institution.institution")
      .create({
        data: {
          name: "Education University",
          country: "KE",
          type: "Academic",
          locale: "en",
        },
      });

    const updateData = {
      highestEducationInstitution: institution.documentId,
    };

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.highestEducationInstitution.documentId).toBe(
      institution.documentId,
    );
    expect(response.body.highestEducationInstitution.name).toBe(
      "Education University",
    );
  });

  it("should return institutionMemberships in profile", async () => {
    const institution = await strapi
      .documents("api::institution.institution")
      .create({
        data: {
          name: "Work Institute",
          country: "KE",
          type: "Research",
          locale: "en",
        },
      });

    // Create a membership manually for now
    await strapi
      .documents("api::institution-membership.institution-membership")
      .create({
        data: {
          user: user.documentId || user.id,
          institution: institution.documentId,
          type: "member",
          verificationStatus: true,
          locale: "en",
        },
      });

    const response = await request(strapi.server.httpServer)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`);

    expect(response.status).toBe(200);
    expect(response.body.institutionMemberships).toBeDefined();
    expect(response.body.institutionMemberships.length).toBeGreaterThan(0);
    expect(response.body.institutionMemberships[0].institution.name).toBe(
      "Work Institute",
    );
  });

  it("should create a new institution on-the-fly when name is provided", async () => {
    const updateData = {
      highestEducationInstitution: { name: "Completely New University" },
      affiliationInstitution: { name: "New Research Lab" },
    };

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send(updateData);

    expect(response.status).toBe(200);

    // Check highestEducationInstitution
    expect(response.body.highestEducationInstitution.name).toBe(
      "Completely New University",
    );
    expect(response.body.highestEducationInstitution.verified).toBe(false);

    // Check membership
    const membership = response.body.institutionMemberships.find(
      (m) => m.institution.name === "New Research Lab",
    );
    expect(membership).toBeDefined();
    expect(membership.institution.verified).toBe(false);
  });
});
