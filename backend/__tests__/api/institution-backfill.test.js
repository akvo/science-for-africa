/**
 * Institution Backfill Tests
 *
 * Verifies that the migration script correctly backfills users to the Akvo institution.
 */

const {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
} = require("../helpers/strapi");

describe("Institution Backfill", () => {
  // Setup Strapi before all tests
  beforeAll(async () => {
    await setupStrapi();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await teardownStrapi();
  });

  it("should have created the Akvo institution", async () => {
    const strapi = getStrapi();
    const akvo = await strapi.db.query("api::institution.institution").findOne({
      where: { name: "Akvo" },
    });

    expect(akvo).toBeDefined();
    expect(akvo.name).toBe("Akvo");
    expect(akvo.verified).toBe(true);
  });

  it("should have associated existing users with Akvo membership", async () => {
    const strapi = getStrapi();
    const users = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        populate: ["institutionMemberships", "highestEducationInstitution"],
      });

    for (const user of users) {
      // Check membership
      expect(user.institutionMemberships).toBeDefined();
      expect(user.institutionMemberships.length).toBeGreaterThan(0);

      const akvoMembership = user.institutionMemberships.find(
        (m) => m.type === "member",
      );
      expect(akvoMembership).toBeDefined();

      // Check education
      expect(user.highestEducationInstitution).toBeDefined();
      expect(user.highestEducationInstitution.name).toBe("Akvo");
    }
  });

  it("should have confirmed users who completed onboarding", async () => {
    const strapi = getStrapi();
    const users = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: { onboardingComplete: true },
      });

    for (const user of users) {
      expect(user.confirmed).toBe(true);
    }
  });
});
