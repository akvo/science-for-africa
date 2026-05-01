/**
 * Collaboration Acceptance & Security Tests
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("Collaboration Acceptance & Chat Security", () => {
  let strapi;
  let user;
  let jwt;
  let call;
  let pendingInvite;

  beforeAll(async () => {
    strapi = await setupStrapi();

    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    user = await createMockUser({
      username: "collab_tester",
      email: "tester@example.com",
    });

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { role: authRole.id },
    });

    jwt = generateJwtToken(user);

    // Create a collaboration call
    call = await strapi
      .documents("api::collaboration-call.collaboration-call")
      .create({
        data: {
          title: "Test Collaboration Space",
          description: "A space for testing security",
          startDate: new Date(),
          endDate: new Date(),
          status: "Active",
        },
        status: "published",
      });

    // Create a pending invite
    pendingInvite = await strapi
      .documents("api::collaboration-invite.collaboration-invite")
      .create({
        data: {
          invitedUser: user.id,
          collaborationCall: call.id,
          inviteStatus: "Pending",
          email: user.email,
          role: "Collaborator",
        },
        status: "published",
      });

    await grantPermissions("authenticated", {
      "collaboration-invite": ["find", "accept", "decline"],
      "chat-message": ["find", "create"],
      "users-permissions": ["me"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  describe("Dashboard Invitations (B1)", () => {
    it("should include Pending invites in /api/auth/me", async () => {
      const response = await request(strapi.server.httpServer)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toBe(200);
      const invites = response.body.collaborationInvites || [];
      const hasPending = invites.some((i) => i.inviteStatus === "Pending");
      expect(hasPending).toBe(true);
    });
  });

  describe("Invitation Actions (B2, B3)", () => {
    it("should decline an invitation via /api/collaboration-invites/:id/decline", async () => {
      const response = await request(strapi.server.httpServer)
        .post(`/api/collaboration-invites/${pendingInvite.id}/decline`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inviteStatus).toBe("Declined");
    });

    it("should accept an invitation via /api/collaboration-invites/:id/accept", async () => {
      // Create another pending invite for testing accept
      const newInvite = await strapi
        .documents("api::collaboration-invite.collaboration-invite")
        .create({
          data: {
            invitedUser: user.id,
            collaborationCall: call.id,
            inviteStatus: "Pending",
            email: user.email,
            role: "Collaborator",
          },
          status: "published",
        });

      const response = await request(strapi.server.httpServer)
        .post(`/api/collaboration-invites/${newInvite.id}/accept`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inviteStatus).toBe("Accepted");
    });
  });

  describe("Chat Security (B4)", () => {
    let nonMemberUser;
    let nonMemberJwt;

    beforeAll(async () => {
      nonMemberUser = await createMockUser({
        username: "non_member",
        email: "nonmember@example.com",
      });

      const roles = await strapi
        .query("plugin::users-permissions.role")
        .findMany();
      const authRole = roles.find((r) => r.type === "authenticated");

      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: nonMemberUser.id },
        data: { role: authRole.id },
      });

      nonMemberJwt = generateJwtToken(nonMemberUser);
    });

    it("should reject chat messages from non-members", async () => {
      const response = await request(strapi.server.httpServer)
        .post("/api/chat-messages")
        .set("Authorization", `Bearer ${nonMemberJwt}`)
        .send({
          data: {
            text: "Hello, I am not a member",
            collaborationCall: call.documentId,
          },
        });

      // Based on UAC, this should be restricted
      expect(response.status).toBe(403);
    });

    it("should allow chat messages from accepted members", async () => {
      const response = await request(strapi.server.httpServer)
        .post("/api/chat-messages")
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          data: {
            text: "Hello, I am an accepted member",
            collaborationCall: call.documentId,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.text).toBe("Hello, I am an accepted member");
    });
  });
});
