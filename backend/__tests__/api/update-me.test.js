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
      profile: ["update"],
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

  it("should handle institutional accounts with empty fields via the smart client contract", async () => {
    // This represents the RAW store data
    const rawData = {
      firstName: "Org Admin",
      userType: "institution",
      institutionName: "New African Institute",
      educationLevel: "",
      orcidId: "",
      onboardingComplete: true,
    };

    // This represents what the transformProfileUpdatePayload logic DOES
    // (Strips empty strings and type-specific fields)
    const transformedData = {
      firstName: "Org Admin",
      userType: "institution",
      institutionName: "New African Institute",
      onboardingComplete: true,
    };

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send(transformedData);

    expect(response.status).toBe(200);
    expect(response.body.userType).toBe("institution");
    expect(response.body.institutionName).toBe("New African Institute");
    expect(response.body.educationLevel).toBeNull(); // Strapi will have it as null or omit it
  });

  it("should enforce character limit on biography in /auth/me", async () => {
    const longBio = "A".repeat(276);

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ biography: longBio });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain("275 characters or less");
  });

  it("should update new individual profile fields in /auth/me", async () => {
    const updateData = {
      displayName: "New Display Name",
      languagePreferences: "fr",
      biography: "A short bio within the limit.",
    };

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.displayName).toBe("New Display Name");
    expect(response.body.languagePreferences).toBe("fr");
    expect(response.body.biography).toBe("A short bio within the limit.");
  });
});
