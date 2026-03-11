/**
 * Affiliation Approval Tests
 * 
 * Verifies that Institution Admins can approve/reject affiliation requests
 * for users linked to their institution.
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
  generateJwtToken,
} = require("../helpers/strapi");

describe("Affiliation Approval (US-004-B)", () => {
  let strapi;
  let institutionAdmin;
  let member;
  let institution;
  let adminJwt;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Specific cleanup for this test suite
    await strapi.db.query("plugin::users-permissions.user").deleteMany({});
    await strapi.db.query("api::institution.institution").deleteMany({});
    
    // Create an institution
    institution = await strapi.documents("api::institution.institution").create({
      data: {
        name: "Approval University",
        affiliationType: "University",
      },
      status: 'published',
    });

    // Get the Institution Admin role
    const adminRole = await strapi.db.query("plugin::users-permissions.role").findOne({
      where: { name: "Institution Admin" },
    });

    // Create an Institution Admin linked to this institution
    institutionAdmin = await createMockUser({
      username: "instadmin",
      email: "admin@approval.edu",
      role: adminRole.id,
      institution: institution.documentId,
      affiliationStatus: "Approved",
    });

    adminJwt = generateJwtToken(institutionAdmin);

    // Grant permission to Institution Admin role for the approveMember action
    const permission = await strapi.db.query("plugin::users-permissions.permission").findOne({
      where: { action: "api::institution.institution.approveMember", role: adminRole.id }
    });

    if (!permission) {
      await strapi.db.query("plugin::users-permissions.permission").create({
        data: {
          action: "api::institution.institution.approveMember",
          role: adminRole.id,
        },
      });
    }

    // Create a Member linked to the same institution (Pending)
    member = await createMockUser({
      username: "pendingmember",
      email: "member@approval.edu",
      institution: institution.documentId,
      affiliationStatus: "Pending",
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should allow an Institution Admin to approve a member's affiliation if in the same institution", async () => {
    // Attempt to approve the member using the custom endpoint
    const response = await request(strapi.server.httpServer)
      .put(`/api/institutions/approve-member/${member.documentId}`)
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        affiliationStatus: "Approved",
      });

    expect(response.status).toBe(200);
    expect(response.body.affiliationStatus).toBe("Approved");
    
    const updatedMember = await strapi.documents("plugin::users-permissions.user").findOne({
      documentId: member.documentId
    });
    expect(updatedMember.affiliationStatus).toBe("Approved");
  });

  it("should NOT allow an Institution Admin from a DIFFERENT institution to approve the member", async () => {
    const otherInstitution = await strapi.documents("api::institution.institution").create({
      data: { name: "Other Uni" },
      status: 'published',
    });

    const adminRole = await strapi.db.query("plugin::users-permissions.role").findOne({
      where: { name: "Institution Admin" },
    });

    const otherAdmin = await createMockUser({
      username: "otheradmin",
      email: "other@uni.edu",
      role: adminRole.id,
      institution: otherInstitution.documentId,
      affiliationStatus: "Approved",
    });

    const otherJwt = generateJwtToken(otherAdmin);

    const response = await request(strapi.server.httpServer)
      .put(`/api/institutions/approve-member/${member.documentId}`)
      .set("Authorization", `Bearer ${otherJwt}`)
      .send({
        affiliationStatus: "Approved",
      });

    // This should fail with 403
    expect(response.status).toBe(403);
  });
});
