/**
 * User Schema Extension Tests
 *
 * This test verifies that the User content-type has been extended
 * with the fields required for the Phase 1 MVP onboarding flow.
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
  generateJwtToken,
} = require("../helpers/strapi");

describe("User Schema Extension (US-003-B)", () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should include careerStage, expertise, orcidId, and mentorAvailability fields in the user profile", async () => {
    const strapi = getStrapi();

    // Create a mock user with the new fields
    const userData = {
      username: "extensiontest",
      email: "ext@example.com",
      password: "Password123!",
      careerStage: "Senior",
      expertise: "Biotechnology",
      orcidId: "0000-0001-2345-6789",
      mentorAvailability: true,
      onboardingStep: 1,
    };

    let user;
    try {
      user = await createMockUser(userData);
    } catch (e) {
      user = await strapi.query("plugin::users-permissions.user").findOne({
        where: { email: "ext@example.com" },
      });
    }

    // Fetch the user directly via query to verify schema fields
    const fetchedUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
      });

    expect(fetchedUser).toHaveProperty("careerStage");
    expect(fetchedUser).toHaveProperty("expertise");
    expect(fetchedUser).toHaveProperty("orcidId");
    expect(fetchedUser).toHaveProperty("mentorAvailability");
    expect(fetchedUser).toHaveProperty("onboardingStep");

    expect(fetchedUser.careerStage).toBe("Senior");
    expect(fetchedUser.expertise).toBe("Biotechnology");
    expect(fetchedUser.orcidId).toBe("0000-0001-2345-6789");
    expect(fetchedUser.mentorAvailability).toBe(true);
    expect(fetchedUser.onboardingStep).toBe(1);
  });

  it("should support institutional affiliation with a status", async () => {
    const strapi = getStrapi();

    // Create an institution first
    const institution = await strapi
      .query("api::institution.institution")
      .create({
        data: {
          name: "Test University",
          city: "Nairobi",
          country: "Kenya",
          affiliationType: "University",
        },
      });

    // Create a user linked to the institution
    const userData = {
      username: "affiliateduser",
      email: "affil@example.com",
      password: "Password123!",
      institution: institution.id,
      affiliationStatus: "Pending",
    };

    const user = await createMockUser(userData);

    // Fetch user and verify relation
    const fetchedUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: ["institution"],
      });

    expect(fetchedUser).toHaveProperty("institution");
    expect(fetchedUser.institution).toBeDefined();
    expect(fetchedUser.institution.name).toBe("Test University");
    expect(fetchedUser).toHaveProperty("affiliationStatus");
    expect(fetchedUser.affiliationStatus).toBe("Pending");
  });

  it("should automatically validate ORCID iDs on user creation", async () => {
    const strapi = getStrapi();
    
    const userData = {
      username: "orciduser",
      email: "orcid@example.com",
      password: "Password123!",
      orcidId: "0000-0002-1825-0097", // Josiah Carberry (Valid)
    };

    const user = await createMockUser(userData);

    const fetchedUser = await strapi.query("plugin::users-permissions.user").findOne({
      where: { id: user.id },
    });

    expect(fetchedUser.orcidId).toBe("0000-0002-1825-0097");
    expect(fetchedUser.orcidVerified).toBe(true);
  });

  it("should have the required roles in the system", async () => {
    const strapi = getStrapi();
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const roleNames = roles.map((r) => r.name);

    const expectedRoles = [
      "Platform Admin",
      "Community Admin",
      "Institution Admin",
      "Expert",
      "Member",
      "Individual",
    ];

    // This will likely FAIL as we haven't created them yet
    expectedRoles.forEach((roleName) => {
      expect(roleNames).toContain(roleName);
    });
  });
});
