/**
 * ORCID Service Tests
 * 
 * Verifies ORCID iD validation against the public API.
 */

const { setupStrapi, teardownStrapi, getStrapi } = require("../helpers/strapi");

describe("ORCID Service (US-005-B)", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should have the orcid service defined", () => {
    const orcidService = strapi.service("api::orcid.orcid");
    expect(orcidService).toBeDefined();
  });

  it("should validate a correctly formatted and existing ORCID iD", async () => {
    const orcidService = strapi.service("api::orcid.orcid");
    
    // Using a known public ORCID iD for testing (real or mocked)
    // For TDD, we'll assume the service has a validate method
    const testId = "0000-0002-1825-0097"; // Josiah Carberry (Example ID)
    
    const result = await orcidService.validate(testId);
    expect(result).toBe(true);
  });

  it("should return false for a non-existent ORCID iD", async () => {
    const orcidService = strapi.service("api::orcid.orcid");
    const testId = "0000-0000-0000-0000";
    
    const result = await orcidService.validate(testId);
    expect(result).toBe(false);
  });

  it("should throw an error for an invalidly formatted ORCID iD", async () => {
    const orcidService = strapi.service("api::orcid.orcid");
    const testId = "invalid-format";
    
    await expect(orcidService.validate(testId)).rejects.toThrow("Invalid ORCID iD format");
  });
});
