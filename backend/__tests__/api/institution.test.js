/**
 * Institution Content-Type Tests
 *
 * Verifies that the Institution collection exists and has the required schema.
 */

const { setupStrapi, teardownStrapi, getStrapi } = require("../helpers/strapi");

describe("Institution Content-Type (US-004-B)", () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should have the Institution collection type defined", async () => {
    const strapi = getStrapi();
    const institutionModel = strapi.contentType("api::institution.institution");

    expect(institutionModel).toBeDefined();
    expect(institutionModel.attributes).toHaveProperty("name");
    expect(institutionModel.attributes).toHaveProperty("city");
    expect(institutionModel.attributes).toHaveProperty("country");
    expect(institutionModel.attributes).toHaveProperty("affiliationType");

    expect(institutionModel.attributes.name.required).toBe(true);
    expect(institutionModel.attributes.affiliationType.type).toBe(
      "enumeration",
    );
    expect(institutionModel.attributes.affiliationType.enum).toEqual([
      "University",
      "Research Org",
      "Funding Agency",
      "Other",
    ]);
  });
});
