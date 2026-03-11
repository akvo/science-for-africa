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

    // Create an institution
    institution = await strapi.query("api::institution.institution").create({
      data: {
        name: "Approval University",
        affiliationType: "University",
      },
    });

    // Get the Institution Admin role
    const adminRole = await strapi.query("plugin::users-permissions.role").findOne({
      where: { name: "Institution Admin" },
    });

    // Create an Institution Admin linked to this institution
    institutionAdmin = await createMockUser({
      username: "instadmin",
      email: "admin@approval.edu",
      role: adminRole.id,
      institution: institution.id,
      affiliationStatus: "Approved",
    });

    adminJwt = generateJwtToken(institutionAdmin);

    // Grant permission to Institution Admin role for the approveMember action
    await strapi.query("plugin::users-permissions.permission").create({
      data: {
        action: "api::institution.institution.approveMember",
        role: adminRole.id,
      },
    });

    // Create a Member linked to the same institution (Pending)
    member = await createMockUser({
      username: "pendingmember",
      email: "member@approval.edu",
      institution: institution.id,
      affiliationStatus: "Pending",
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should allow an Institution Admin to approve a member's affiliation if in the same institution", async () => {
    // Attempt to approve the member using the custom endpoint
    const response = await request(strapi.server.httpServer)
      .put(`/api/institutions/approve-member/${member.id}`)
      .set("Authorization", `Bearer ${adminJwt}`)
      .send({
        affiliationStatus: "Approved",
      });

    // This is expected to FAIL initially (either 403 Forbidden or no change)
    // Strapi's default Users-Permissions doesn't allow users to edit other users
    // even if they have an "Admin" named role, unless they are Platform Admin
    // OR we implement a custom policy/controller.
    
    expect(response.status).toBe(200);
    expect(response.body.affiliationStatus).toBe("Approved");
    
    const updatedMember = await strapi.query("plugin::users-permissions.user").findOne({
      where: { id: member.id }
    });
    expect(updatedMember.affiliationStatus).toBe("Approved");
  });

  it("should NOT allow an Institution Admin from a DIFFERENT institution to approve the member", async () => {
    const otherInstitution = await strapi.query("api::institution.institution").create({
      data: { name: "Other Uni" }
    });

    const otherAdmin = await createMockUser({
      username: "otheradmin",
      email: "other@uni.edu",
      role: institutionAdmin.role.id,
      institution: otherInstitution.id,
      affiliationStatus: "Approved",
    });

    const otherJwt = generateJwtToken(otherAdmin);

    const response = await request(strapi.server.httpServer)
      .put(`/api/institutions/approve-member/${member.id}`)
      .set("Authorization", `Bearer ${otherJwt}`)
      .send({
        affiliationStatus: "Approved",
      });

    // This should fail with 403
    expect(response.status).toBe(403);
  });
});
