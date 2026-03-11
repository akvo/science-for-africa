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

  it("should include education and careerHistory fields in the user profile", async () => {
    const strapi = getStrapi();

    // Create a mock user with the new fields
    const userData = {
      username: "extensiontest",
      email: "ext@example.com",
      password: "Password123!",
      education: [
        {
          school: "University of Nairobi",
          degree: "PhD in Computer Science",
          year: 2022,
        },
      ],
      careerHistory: [
        {
          company: "Science for Africa",
          role: "Lead Researcher",
          period: "2023-Present",
        },
      ],
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
    const fetchedUser = await strapi.query("plugin::users-permissions.user").findOne({
      where: { id: user.id }
    });

    expect(fetchedUser).toHaveProperty("education");
    expect(fetchedUser).toHaveProperty("careerHistory");
    expect(fetchedUser).toHaveProperty("onboardingStep");
    expect(fetchedUser.onboardingStep).toBe(1);

    expect(Array.isArray(fetchedUser.education)).toBe(true);
    expect(fetchedUser.education[0].school).toBe("University of Nairobi");
  });

  it("should have the required roles in the system", async () => {
    const strapi = getStrapi();
    const roles = await strapi.query("plugin::users-permissions.role").findMany();
    const roleNames = roles.map(r => r.name);

    const expectedRoles = [
      "Platform Admin",
      "Community Admin",
      "Institution Admin",
      "Expert",
      "Member",
      "Individual"
    ];

    // This will likely FAIL as we haven't created them yet
    expectedRoles.forEach(roleName => {
      expect(roleNames).toContain(roleName);
    });
  });
});
