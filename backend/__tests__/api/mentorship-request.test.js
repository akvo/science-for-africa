/**
 * Mentorship Request Tests
 * 
 * Verifies that mentees can request mentorship from experts,
 * and experts can respond (Accept/Decline) to those requests.
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
  generateJwtToken,
} = require("../helpers/strapi");

describe("Mentorship Requests (US-007-B)", () => {
  let strapi;
  let expertUser;
  let menteeUser;
  let menteeJwt;
  let expertJwt;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Specific cleanup
    await strapi.db.query("plugin::users-permissions.user").deleteMany({});
    await strapi.db.query("api::mentorship-request.mentorship-request").deleteMany({});

    // Create Expert (available for mentorship)
    const expertRole = await strapi.db.query("plugin::users-permissions.role").findOne({
      where: { name: "Expert" },
    });

    expertUser = await createMockUser({
      username: "mentorexpert",
      email: "expert@science.org",
      role: expertRole.id,
      mentorAvailability: true,
      careerStage: "Senior",
    });
    expertJwt = generateJwtToken(expertUser);

    // Create Mentee (seeking mentorship)
    const memberRole = await strapi.db.query("plugin::users-permissions.role").findOne({
      where: { name: "Member" },
    });

    menteeUser = await createMockUser({
      username: "juniormentee",
      email: "junior@science.org",
      role: memberRole.id,
      careerStage: "Early-Career",
    });
    menteeJwt = generateJwtToken(menteeUser);
    
    // Set up basic permissions for the test
    // Both roles need find/create for mentorship requests generally
    const roles = [expertRole.id, memberRole.id];
    for (const roleId of roles) {
      // Find or create permission to Create
      let permCreate = await strapi.db.query("plugin::users-permissions.permission").findOne({
        where: { action: "api::mentorship-request.mentorship-request.create", role: roleId }
      });
      if (!permCreate) {
        await strapi.db.query("plugin::users-permissions.permission").create({
          data: { action: "api::mentorship-request.mentorship-request.create", role: roleId }
        });
      }
      
      // Find or create permission to respond (custom endpoint)
      let permRespond = await strapi.db.query("plugin::users-permissions.permission").findOne({
        where: { action: "api::mentorship-request.mentorship-request.respond", role: roleId }
      });
      if (!permRespond) {
        await strapi.db.query("plugin::users-permissions.permission").create({
          data: { action: "api::mentorship-request.mentorship-request.respond", role: roleId }
        });
      }
      
      // Grant permission to find users so relations can be validated
      let permFindUser = await strapi.db.query("plugin::users-permissions.permission").findOne({
        where: { action: "plugin::users-permissions.user.find", role: roleId }
      });
      if (!permFindUser) {
        await strapi.db.query("plugin::users-permissions.permission").create({
          data: { action: "plugin::users-permissions.user.find", role: roleId }
        });
      }
    }
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should allow a mentee to create a mentorship request", async () => {
    const response = await request(strapi.server.httpServer)
      .post("/api/mentorship-requests")
      .set("Authorization", `Bearer ${menteeJwt}`)
      .send({
        data: {
          message: "I would love to learn from your experience in quantum computing.",
          mentor: expertUser.documentId, // v5 API accepts string documentIds for relation
          mentee: menteeUser.documentId,
          status: "Pending"
        }
      });

    if (response.status !== 201) {
      console.log("EXPERT ID: ", expertUser.documentId, " MENTEE ID: ", menteeUser.documentId);
      console.log(JSON.stringify(response.body, null, 2));
    }
    expect(response.status).toBe(201);
    expect(response.body.data.message).toBe("I would love to learn from your experience in quantum computing.");
    expect(response.body.data.status).toBe("Pending");
  });

  it("should allow the assigned expert to accept the request", async () => {
    // 1. Create a pending request
    const requestDoc = await strapi.documents("api::mentorship-request.mentorship-request").create({
      data: {
        message: "Please mentor me.",
        mentor: expertUser.documentId,
        mentee: menteeUser.documentId,
        status: "Pending",
      },
      status: 'published'
    });

    // 2. Expert responds to it via custom endpoint
    const response = await request(strapi.server.httpServer)
      .put(`/api/mentorship-requests/${requestDoc.documentId}/respond`)
      .set("Authorization", `Bearer ${expertJwt}`)
      .send({
        status: "Accepted",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("Accepted"); // Response is raw object from core controller wrapper in custom route usually, depends on the `findOne` format returned. Actually `update` returns raw. Wait, our controller `const updatedRequest = await strapi.documents...` returns raw.

    // Let's verify in DB
    const dbRequest = await strapi.documents("api::mentorship-request.mentorship-request").findOne({
      documentId: requestDoc.documentId
    });
    expect(dbRequest.status).toBe("Accepted");
  });

  it("should NOT allow a mentee to accept their own request", async () => {
    // 1. Create a pending request
    const requestDoc = await strapi.documents("api::mentorship-request.mentorship-request").create({
      data: {
        message: "Please mentor me.",
        mentor: expertUser.documentId,
        mentee: menteeUser.documentId,
        status: "Pending",
      },
      status: 'published'
    });

    // 2. Mentee attempts to respond to it via custom endpoint
    const response = await request(strapi.server.httpServer)
      .put(`/api/mentorship-requests/${requestDoc.documentId}/respond`)
      .set("Authorization", `Bearer ${menteeJwt}`)
      .send({
        status: "Accepted",
      });

    // The controller should block this because menteeUser.documentId !== request.mentor.documentId
    expect(response.status).toBe(403);
  });
});
