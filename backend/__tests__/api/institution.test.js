/**
 * Institution API Tests
 *
 * Verifies the Institution collection type and case-insensitive uniqueness.
 */

const { setupStrapi, teardownStrapi, getStrapi } = require("../helpers/strapi");

describe("Institution API", () => {
  // Setup Strapi before all tests
  beforeAll(async () => {
    await setupStrapi();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await teardownStrapi();
  });

  it("should create an institution successfully", async () => {
    const strapi = getStrapi();
    const institution = await strapi.db
      .query("api::institution.institution")
      .create({
        data: {
          name: "Oxford University",
          type: "Academic",
          country: "United Kingdom",
          verified: true,
        },
      });

    expect(institution).toBeDefined();
    expect(institution.name).toBe("Oxford University");
  });

  it("should fail to create a duplicate institution (case-insensitive)", async () => {
    const strapi = getStrapi();

    await expect(
      strapi.db.query("api::institution.institution").create({
        data: {
          name: "oxford university",
          type: "Academic",
          country: "UK",
        },
      }),
    ).rejects.toThrow(
      "An institution with this name already exists (case-insensitive).",
    );
  });

  it("should allow creating a different institution", async () => {
    const strapi = getStrapi();
    const institution = await strapi.db
      .query("api::institution.institution")
      .create({
        data: {
          name: "Cambridge University",
          type: "Academic",
          country: "United Kingdom",
        },
      });

    expect(institution).toBeDefined();
    expect(institution.name).toBe("Cambridge University");
  });
});
