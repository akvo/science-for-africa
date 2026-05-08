/**
 * Country API Tests
 *
 * Verifies relational model and delete protection.
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  grantPermissions,
  createMockUser,
  generateJwtToken,
} = require("../helpers/strapi");

describe("Country API", () => {
  let strapi;
  let user;
  let jwt;

  beforeAll(async () => {
    strapi = await setupStrapi();
    user = await createMockUser();

    // Explicitly set role to authenticated
    const roles = await strapi.db
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { role: authRole.id },
    });

    jwt = generateJwtToken(user);

    // Grant permissions for authenticated user
    await grantPermissions("authenticated", {
      country: ["find", "findOne", "create", "update", "delete"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should default isActive to true and sortOrder to 0 when creating a country", async () => {
    const response = await request(strapi.server.httpServer)
      .post("/api/countries")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ data: { name: "Wakanda" } });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe("Wakanda");
    expect(response.body.data.isActive).toBe(true);
    expect(response.body.data.sortOrder).toBe(0);
  });

  it("should block deletion of a country with 403 Forbidden", async () => {
    // 1. Create a country to attempt deleting
    const country = await strapi.db.query("api::country.country").create({
      data: { name: "Protected Country", isActive: true },
    });

    // 2. Attempt to delete via API
    const response = await request(strapi.server.httpServer)
      .delete(`/api/countries/${country.documentId || country.id}`)
      .set("Authorization", `Bearer ${jwt}`);

    // Expect 403 Forbidden even though 'delete' permission was granted
    expect(response.status).toBe(403);
    expect(response.body.error.message).toMatch(/cannot be deleted/i);
  });
});
