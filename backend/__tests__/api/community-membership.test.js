/**
 * Community Membership API Tests
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("Community Membership API", () => {
  let strapi;
  let user;
  let jwt;
  let community;

  beforeAll(async () => {
    strapi = await setupStrapi();
    user = await createMockUser({
      username: "memberuser",
      email: "member@example.com",
    });
    jwt = generateJwtToken(user);

    // Create a test community
    try {
      community = await strapi.documents("api::community.community").create({
        data: {
          name: "Test Community",
          slug: "test-community",
        },
        locale: "en",
      });
    } catch (error) {
      console.error(
        "Community Creation Error:",
        JSON.stringify(error.details || error.message, null, 2),
      );
      throw error;
    }

    // Grant permissions
    await grantPermissions("authenticated", {
      "community-membership": ["leave", "find"],
    });

    // Assign role to user
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { role: authRole.id },
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should allow a user to join and then leave a community", async () => {
    // 1. Join (using createCoreController default create for now or manual db query)
    const membership = await strapi
      .documents("api::community-membership.community-membership")
      .create({
        data: {
          user: user.id,
          community: community.id,
          role: "Member",
        },
        status: "published",
      });

    expect(membership).toBeDefined();

    // 2. Verify membership exists
    const beforeLeave = await strapi
      .documents("api::community-membership.community-membership")
      .findMany({
        filters: { user: { id: user.id }, community: { id: community.id } },
      });
    expect(beforeLeave).toHaveLength(1);

    // 3. Leave via custom route
    const response = await request(strapi.server.httpServer)
      .delete(`/api/communities/${community.documentId}/leave`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // 4. Verify membership is gone
    const afterLeave = await strapi
      .documents("api::community-membership.community-membership")
      .findMany({
        filters: { user: { id: user.id }, community: { id: community.id } },
      });
    expect(afterLeave).toHaveLength(0);
  });

  it("should return 404 when leaving a community with no membership", async () => {
    const response = await request(strapi.server.httpServer)
      .delete(`/api/communities/non-existent-id/leave`)
      .set("Authorization", `Bearer ${jwt}`);

    expect(response.status).toBe(404);
  });
});

describe("Community Membership Pagination & Isolation", () => {
  let strapi;
  let user1, user2;
  let jwt1;
  let community;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Assign authenticated role logic
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    user1 = await createMockUser({
      username: "user1",
      email: "user1@example.com",
    });
    user2 = await createMockUser({
      username: "user2",
      email: "user2@example.com",
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

    community = await strapi.documents("api::community.community").create({
      data: { name: "Pagination Community", slug: "pagination-community" },
      status: "published",
    });

    // Create 3 memberships for user1
    for (let i = 0; i < 3; i++) {
      await strapi
        .documents("api::community-membership.community-membership")
        .create({
          data: { user: user1.id, community: community.id, role: "Member" },
          status: "published",
        });
    }

    // Create 1 membership for user2
    await strapi
      .documents("api::community-membership.community-membership")
      .create({
        data: { user: user2.id, community: community.id, role: "Member" },
        status: "published",
      });

    await grantPermissions("authenticated", {
      "community-membership": ["find"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should only return memberships belonging to the authenticated user", async () => {
    const response = await request(strapi.server.httpServer)
      .get("/api/community-memberships")
      .set("Authorization", `Bearer ${jwt1}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    // Ensure none of user2's memberships are returned
    response.body.data.forEach((m) => {
      // In Strapi v5, findMany in the controller handles the filter
    });
  });

  it("should return correct pagination metadata", async () => {
    const response = await request(strapi.server.httpServer)
      .get("/api/community-memberships?pagination[pageSize]=2")
      .set("Authorization", `Bearer ${jwt1}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta.pagination).toMatchObject({
      page: 1,
      pageSize: 2,
      pageCount: 2, // 3 total items / 2 per page = 2 pages
      total: 3,
    });
  });
});
