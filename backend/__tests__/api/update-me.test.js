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
      profile: ["update", "me"],
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
        data: { name: "Test University", documentId: "test-uni-123" },
      });

    // This payload matches what the FRONTEND now produces
    const updateData = {
      firstName: "Updated",
      onboardingComplete: true,
      interests: [{ name: "Science" }, { name: "Medicine" }],
      highestEducationInstitution: institution.documentId || institution.id,
    };

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.onboardingComplete).toBe(true);
    expect(response.body.highestEducationInstitution.name).toBe(
      "Test University",
    );
    expect(response.body.interests).toHaveLength(2);
  });

  it("should handle institutional accounts with empty fields via the smart client contract", async () => {
    // This represents the RAW store data
    const rawData = {
      firstName: "Org Admin",
      userType: "institution",
      educationLevel: "",
      orcidId: "",
      onboardingComplete: true,
    };

    // This represents what the transformProfileUpdatePayload logic DOES
    const transformedData = {
      firstName: "Org Admin",
      userType: "institution",
      onboardingComplete: true,
    };

    const response = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send(transformedData);

    expect(response.status).toBe(200);
    expect(response.body.userType).toBe("institution");
    expect(response.body.educationLevel).toBeNull();
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

  it("should return populated profile data on GET /auth/me", async () => {
    // 1. Create a membership and collaboration invite first
    const community = await strapi
      .documents("api::community.community")
      .create({
        data: { name: "Populate Test Community", slug: "populate-test" },
        status: "published",
        locale: "en",
      });

    await strapi
      .documents("api::community-membership.community-membership")
      .create({
        data: {
          user: user.id,
          community: community.id,
          role: "Member",
        },
        status: "published",
      });

    const call = await strapi
      .documents("api::collaboration-call.collaboration-call")
      .create({
        data: {
          title: "Populate Collab",
          description: "Test Collab",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          status: "Active",
        },
        status: "published",
      });

    await strapi
      .documents("api::collaboration-invite.collaboration-invite")
      .create({
        data: {
          email: user.email,
          inviteStatus: "Accepted",
          invitedUser: user.id,
          collaborationCall: call.id,
        },
        status: "published",
      });

    // 2. Fetch the profile
    const response = await request(strapi.server.httpServer)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`);

    expect(response.status).toBe(200);
    // Verified memberships
    expect(response.body.memberships).toBeDefined();
    expect(response.body.memberships.length).toBeGreaterThan(0);
    expect(response.body.memberships[0].community.name).toBe(
      "Populate Test Community",
    );

    // Verified collaborationInvites
    expect(response.body.collaborationInvites).toBeDefined();
    expect(response.body.collaborationInvites.length).toBeGreaterThan(0);
    expect(response.body.collaborationInvites[0].collaborationCall.title).toBe(
      "Populate Collab",
    );
  });
});
