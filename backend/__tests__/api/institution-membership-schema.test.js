/**
 * Institution Membership Schema Tests
 *
 * Verifies the new InstitutionMembership collection and relationship.
 */

const {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
} = require("../helpers/strapi");

describe("Institution Membership Schema", () => {
  // Setup Strapi before all tests
  beforeAll(async () => {
    await setupStrapi();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await teardownStrapi();
  });

  it("should have api::institution-membership.institution-membership collection available", async () => {
    const strapi = getStrapi();
    expect(
      strapi.contentTypes["api::institution-membership.institution-membership"],
    ).toBeDefined();
  });

  it("should have correct attributes in institution-membership", async () => {
    const strapi = getStrapi();
    const attributes =
      strapi.contentTypes["api::institution-membership.institution-membership"]
        .attributes;

    expect(attributes.user).toBeDefined();
    expect(attributes.user.type).toBe("relation");
    expect(attributes.user.target).toBe("plugin::users-permissions.user");

    expect(attributes.institution).toBeDefined();
    expect(attributes.institution.type).toBe("relation");
    expect(attributes.institution.target).toBe("api::institution.institution");

    expect(attributes.type).toBeDefined();
    expect(attributes.type.type).toBe("enumeration");
    expect(attributes.type.enum).toContain("member");
    expect(attributes.type.enum).toContain("owner");

    expect(attributes.verificationStatus).toBeDefined();
    expect(attributes.verificationStatus.type).toBe("boolean");
  });

  it("should have highestEducationInstitution in User model", async () => {
    const strapi = getStrapi();
    const attributes =
      strapi.contentTypes["plugin::users-permissions.user"].attributes;

    expect(attributes.highestEducationInstitution).toBeDefined();
    expect(attributes.highestEducationInstitution.type).toBe("relation");
    expect(attributes.highestEducationInstitution.target).toBe(
      "api::institution.institution",
    );
  });

  it("should NOT have deprecated fields in User model", async () => {
    const strapi = getStrapi();
    const attributes =
      strapi.contentTypes["plugin::users-permissions.user"].attributes;

    expect(attributes.institution).toBeUndefined();
    expect(attributes.institutionName).toBeUndefined();
    expect(attributes.affiliationStatus).toBeUndefined();
    expect(attributes.verificationStatus).toBeUndefined();
    expect(attributes.educationInstitutionName).toBeUndefined();
  });
});
