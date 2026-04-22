/**
 * Collaboration Invite API Tests
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("Collaboration Invite API Isolation & Population", () => {
  let strapi;
  let user1, user2;
  let jwt1;
  let call;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Assign authenticated role logic
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    user1 = await createMockUser({
      username: "collab_user1",
      email: "collab1@example.com",
    });
    user2 = await createMockUser({
      username: "collab_user2",
      email: "collab2@example.com",
    });

    // Explicitly assign role
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user1.id },
      data: { role: authRole.id },
    });
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user2.id },
      data: { role: authRole.id },
    });

    jwt1 = generateJwtToken(user1);

    // Create a collaboration call
    call = await strapi
      .documents("api::collaboration-call.collaboration-call")
      .create({
        data: {
          title: "Test Call",
          description: "Test Description",
          startDate: new Date(),
          endDate: new Date(),
          status: "Active",
        },
        status: "published",
      });

    // Create 2 invites for user1
    for (let i = 0; i < 2; i++) {
      await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .create({
          data: {
            invitedUser: user1.id,
            collaborationCall: call.id,
            inviteStatus: "Accepted",
            email: user1.email,
            role: "Collaborator",
          },
          status: "published",
        });
    }

    // Create 1 invite for user2
    await strapi
      .documents("api::collaboration-invite.collaboration-invite")
      .create({
        data: {
          invitedUser: user2.id,
          collaborationCall: call.id,
          inviteStatus: "Accepted",
          email: user2.email,
          role: "Collaborator",
        },
        status: "published",
      });

    await grantPermissions("authenticated", {
      "collaboration-invite": ["find"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should only return invites belonging to the authenticated user", async () => {
    const response = await request(strapi.server.httpServer)
      .get("/api/collaboration-invites")
      .set("Authorization", `Bearer ${jwt1}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);

    // Check deep population
    expect(response.body.data[0].collaborationCall).toBeDefined();
    expect(response.body.data[0].collaborationCall.title).toBe("Test Call");
  });

  it("should return correct pagination metadata for collaborations", async () => {
    const response = await request(strapi.server.httpServer)
      .get("/api/collaboration-invites?pagination[pageSize]=1")
      .set("Authorization", `Bearer ${jwt1}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.pagination).toMatchObject({
      page: 1,
      pageSize: 1,
      pageCount: 2,
      total: 2,
    });
  });

  it("should return 403 for unauthorized requests", async () => {
    const response = await request(strapi.server.httpServer).get(
      "/api/collaboration-invites",
    );
    expect(response.status).toBe(403);
  });

  it("should return an empty array for a user with no collaborations", async () => {
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    const user3 = await createMockUser({
      username: "collab_user3",
      email: "collab3@example.com",
    });

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user3.id },
      data: { role: authRole.id },
    });

    const jwt3 = generateJwtToken(user3);

    const response = await request(strapi.server.httpServer)
      .get("/api/collaboration-invites")
      .set("Authorization", `Bearer ${jwt3}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });
});
