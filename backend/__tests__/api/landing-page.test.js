/**
 * Landing Page API Tests
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  grantPermissions,
} = require("../helpers/strapi");

describe("Landing Page API", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should return 403 when public access is not granted", async () => {
    const response = await request(strapi.server.httpServer).get(
      "/api/landing-page",
    );
    expect(response.status).toBe(403);
  });

  it("should return 200 when public access is granted", async () => {
    await grantPermissions("public", {
      "landing-page": ["api::landing-page.landing-page.find"],
    });

    const response = await request(strapi.server.httpServer).get(
      "/api/landing-page",
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });

  it("should return seeded content from the production seeder", async () => {
    // The seeder runs in bootstrap, so data should already be there.
    const response = await request(strapi.server.httpServer).get(
      "/api/landing-page?populate=blocks",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.blocks).toBeDefined();
    expect(response.body.data.blocks.length).toBeGreaterThan(0);

    // Verify specific seeded content from DEFAULT_LANDING_PAGE
    const textSection = response.body.data.blocks.find(
      (b) => b.__component === "page.text-section",
    );
    expect(textSection.title).toMatch(/professional home/i);
  });
});
