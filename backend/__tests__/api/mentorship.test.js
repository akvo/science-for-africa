/**
 * TDD: Mentorship API Tests
 *
 * Verifies that mentors can fetch their mentees via /api/auth/mentees
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("Mentorship API", () => {
  let strapi;
  let mentor;
  let mentee;
  let mentorJwt;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Create Mentor and Mentee users
    mentor = await createMockUser({
      username: "mentor",
      email: "mentor@example.com",
    });

    mentee = await createMockUser({
      username: "mentee",
      email: "mentee@example.com",
      educationLevel: "PhD in Science",
    });

    mentorJwt = generateJwtToken(mentor);

    // Explicitly assign 'authenticated' role to the mentor
    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: mentor.id },
      data: { role: authRole.id },
    });

    // Grant permissions
    await grantPermissions("authenticated", {
      profile: ["mentees"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should return mentees list when user is a mentor", async () => {
    // 1. Create a collaboration call
    const call = await strapi
      .documents("api::collaboration-call.collaboration-call")
      .create({
        data: {
          title: "Mentorship Program 2024",
          description: "A program for young scientists",
          status: "Active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        },
        status: "published",
      });

    // 2. Create an institution for the mentee
    const institution = await strapi
      .documents("api::institution.institution")
      .create({
        data: {
          name: "University of Science",
          type: "Academic",
          country: "Kenya",
        },
        status: "published",
      });

    // Update mentee with institution
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: mentee.id },
      data: { highestEducationInstitution: institution.id },
    });

    // 3. Assign mentor role to the mentor user in this call
    await strapi
      .documents("api::collaboration-invite.collaboration-invite")
      .create({
        data: {
          invitedUser: mentor.id,
          collaborationCall: call.id,
          role: "Mentor",
          inviteStatus: "Accepted",
          email: mentor.email,
        },
        status: "published",
      });

    // 4. Assign mentee (Collaborator) role to the mentee user in this call
    await strapi
      .documents("api::collaboration-invite.collaboration-invite")
      .create({
        data: {
          invitedUser: mentee.id,
          collaborationCall: call.id,
          role: "Collaborator",
          inviteStatus: "Accepted",
          email: mentee.email,
        },
        status: "published",
      });

    // 5. Test the endpoint
    const response = await request(strapi.server.httpServer)
      .get("/api/auth/mentees")
      .set("Authorization", `Bearer ${mentorJwt}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const mentorship = response.body[0];
    expect(mentorship.collaborationCall.title).toBe("Mentorship Program 2024");
    expect(mentorship.mentees.length).toBeGreaterThan(0);

    const foundMentee = mentorship.mentees.find((m) => m.id === mentee.id);
    expect(foundMentee).toBeDefined();
    expect(foundMentee.educationLevel).toBe("PhD in Science");
    expect(foundMentee.highestEducationInstitution.name).toBe(
      "University of Science",
    );
  });

  it("should return empty list when user is not a mentor", async () => {
    const userWithoutMentorship = await createMockUser({
      username: "nomentorship",
      email: "no@example.com",
    });

    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userWithoutMentorship.id },
      data: { role: authRole.id },
    });

    const jwt = generateJwtToken(userWithoutMentorship);

    const response = await request(strapi.server.httpServer)
      .get("/api/auth/mentees")
      .set("Authorization", `Bearer ${jwt}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
