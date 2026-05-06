/**
 * InstitutionType API Tests
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

describe("InstitutionType API", () => {
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

    // Check if model is loaded
    if (!strapi.contentTypes["api::institution-type.institution-type"]) {
      console.log(
        "MODEL NOT LOADED! Available models:",
        Object.keys(strapi.contentTypes).filter((k) => k.startsWith("api::")),
      );
    }

    // Grant permissions for authenticated user
    await grantPermissions("authenticated", {
      "institution-type": ["find", "findOne", "create", "update", "delete"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should default isActive to true when creating a type", async () => {
    const response = await request(strapi.server.httpServer)
      .post("/api/institution-types")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ data: { name: "New Academic" } });

    // Expect 201 Created
    if (response.status !== 201) {
      console.log("DEBUG RESPONSE:", response.status, response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe("New Academic");
    expect(response.body.data.isActive).toBe(true);
  });

  it("should block deletion of an institution type with 403 Forbidden", async () => {
    // 1. Create a type to attempt deleting
    const type = await strapi.db
      .query("api::institution-type.institution-type")
      .create({
        data: { name: "Protected Type", isActive: true },
      });

    // 2. Attempt to delete via API
    const response = await request(strapi.server.httpServer)
      .delete(`/api/institution-types/${type.documentId || type.id}`)
      .set("Authorization", `Bearer ${jwt}`);

    // Expect 403 Forbidden even though 'delete' permission was granted
    expect(response.status).toBe(403);
    expect(response.body.error.message).toMatch(/cannot be deleted/i);
  });
});
