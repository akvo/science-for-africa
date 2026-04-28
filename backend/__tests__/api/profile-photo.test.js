/**
 * TDD: Profile Photo Upload & Link Tests
 *
 * Verifies the two-step process:
 * 1. Upload file to /api/upload
 * 2. Link file ID to user profile via PUT /api/auth/me
 */

const request = require("supertest");
const path = require("path");
const fs = require("fs");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("Profile Photo Update Flow", () => {
  let strapi;
  let user;
  let jwt;

  beforeAll(async () => {
    strapi = await setupStrapi();
    user = await createMockUser({
      username: "photouser",
      email: "photo@example.com",
    });
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { role: authRole.id },
    });
    jwt = generateJwtToken(user);

    await grantPermissions("authenticated", {
      profile: ["update", "me"],
      upload: ["plugin::upload.content-api.upload"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should upload a photo and link it to the user profile", async () => {
    // 1. Upload Step
    const testFilePath = path.join(__dirname, "../helpers/test-image.png");
    // Ensure test image exists or create a dummy one
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, "dummy image content");
    }

    const uploadResponse = await request(strapi.server.httpServer)
      .post("/api/upload")
      .set("Authorization", `Bearer ${jwt}`)
      .attach("files", testFilePath);

    expect(uploadResponse.status).toBe(201);
    const fileId = uploadResponse.body[0].id;
    expect(fileId).toBeDefined();

    // 2. Link Step
    const linkResponse = await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send({
        profilePhoto: fileId,
      });

    expect(linkResponse.status).toBe(200);
    expect(linkResponse.body.profilePhoto).toBeDefined();
    // Strapi v5 Document Service might return ID or full object depending on population
    // Our controller populates profilePhoto by default.
    expect(linkResponse.body.profilePhoto.id).toBe(fileId);
  });

  it("should automatically delete the old photo when a new one is linked (Target Behavior)", async () => {
    // 1. Upload and link first photo
    const testFilePath = path.join(__dirname, "../helpers/test-image.png");
    const upload1 = await request(strapi.server.httpServer)
      .post("/api/upload")
      .set("Authorization", `Bearer ${jwt}`)
      .attach("files", testFilePath);

    const fileId1 = upload1.body[0].id;

    await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ profilePhoto: fileId1 });

    // 2. Upload and link second photo
    const upload2 = await request(strapi.server.httpServer)
      .post("/api/upload")
      .set("Authorization", `Bearer ${jwt}`)
      .attach("files", testFilePath);

    const fileId2 = upload2.body[0].id;

    await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ profilePhoto: fileId2 });

    // 3. Verify old file is gone and new file exists
    const allFiles = await strapi.db.query("plugin::upload.file").findMany();
    const fileIds = allFiles.map((f) => f.id);

    expect(fileIds).not.toContain(fileId1);
    expect(fileIds).toContain(fileId2);
  });

  it("should delete the photo when profilePhoto is set to null", async () => {
    // 1. Upload and link photo
    const testFilePath = path.join(__dirname, "../helpers/test-image.png");
    const upload = await request(strapi.server.httpServer)
      .post("/api/upload")
      .set("Authorization", `Bearer ${jwt}`)
      .attach("files", testFilePath);

    const fileId = upload.body[0].id;

    await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ profilePhoto: fileId });

    // 2. Set profilePhoto to null
    await request(strapi.server.httpServer)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ profilePhoto: null });

    // 3. Verify file is gone
    const allFiles = await strapi.db.query("plugin::upload.file").findMany();
    const fileIds = allFiles.map((f) => f.id);

    expect(fileIds).not.toContain(fileId);
  });
});
