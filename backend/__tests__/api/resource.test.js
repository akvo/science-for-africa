/**
 * Resource API Tests
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
  createMockFile,
} = require("../helpers/strapi");

describe("Resource API Deletion", () => {
  let strapi;
  let owner;
  let otherUser;
  let ownerJwt;
  let otherJwt;
  let resource;

  beforeAll(async () => {
    strapi = await setupStrapi();

    owner = await createMockUser({
      username: "owneruser",
      email: "owner@example.com",
    });
    ownerJwt = generateJwtToken(owner);

    otherUser = await createMockUser({
      username: "otheruser",
      email: "other@example.com",
    });
    otherJwt = generateJwtToken(otherUser);

    // Create a mock file
    const file = await createMockFile();

    // Assign authenticated role to users
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: owner.id },
      data: { role: authRole.id },
    });

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: otherUser.id },
      data: { role: authRole.id },
    });

    await grantPermissions("authenticated", {
      resource: ["create", "find", "findOne", "delete"],
    });

    // Create a test resource owned by "owner"
    resource = await strapi.documents("api::resource.resource").create({
      data: {
        name: "Test Resource",
        resourceType: "report",
        status: "approved",
        uploadedBy: owner.id,
        file: file.id,
      },
      status: "published",
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should fail to delete resource if not authenticated", async () => {
    const response = await request(strapi.server.httpServer).delete(
      `/api/resources/${resource.documentId}`,
    );

    expect(response.status).toBe(403); // Strapi default for missing token
  });

  it("should fail to delete resource if not the owner", async () => {
    const response = await request(strapi.server.httpServer)
      .delete(`/api/resources/${resource.documentId}`)
      .set("Authorization", `Bearer ${otherJwt}`);

    expect(response.status).toBe(403);
    expect(response.body.error.message).toContain(
      "You can only delete your own resources",
    );
  });

  it("should allow the owner to delete the resource", async () => {
    const response = await request(strapi.server.httpServer)
      .delete(`/api/resources/${resource.documentId}`)
      .set("Authorization", `Bearer ${ownerJwt}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify it's gone
    const deletedResource = await strapi
      .documents("api::resource.resource")
      .findOne({
        documentId: resource.documentId,
      });
    expect(deletedResource).toBeNull();
  });

  it("should create a resource successfully", async () => {
    // Create a mock file and community
    const file = await createMockFile();
    const community = await strapi
      .documents("api::community.community")
      .create({
        data: { name: "Test Community", slug: "test-comm" },
        status: "published",
      });

    const resourceData = {
      data: {
        name: "New Uploaded Resource",
        resourceType: "publication",
        file: file.id,
        community: community.documentId,
        // The frontend used to send this, my controller should strip it and let lifecycle handle it
        uploadedBy: "some-fake-id",
      },
    };

    const response = await request(strapi.server.httpServer)
      .post("/api/resources")
      .set("Authorization", `Bearer ${ownerJwt}`)
      .send(resourceData);

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe("New Uploaded Resource");

    // Fetch it again to verify uploadedBy was set correctly by lifecycle
    const created = await strapi.documents("api::resource.resource").findOne({
      documentId: response.body.data.documentId,
      populate: ["uploadedBy"],
    });
    expect(created.uploadedBy.documentId).toBe(owner.documentId);
  });
});
