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

  it("should return 200 by default (granted by seeder)", async () => {
    const response = await request(strapi.server.httpServer).get(
      "/api/landing-page",
    );
    expect(response.status).toBe(200);
  });

  it("should return seeded content from the production seeder", async () => {
    const response = await request(strapi.server.httpServer).get(
      "/api/landing-page?populate=blocks",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.blocks).toBeDefined();
    expect(response.body.data.blocks.length).toBeGreaterThan(0);

    // Verify specific seeded content from DEFAULT_LANDING_PAGE
    const hero = response.body.data.blocks.find(
      (b) => b.__component === "page.hero",
    );
    expect(hero.title).toMatch(/Pan-African Community/i);
  });
});
