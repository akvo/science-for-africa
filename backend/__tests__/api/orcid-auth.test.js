/**
 * ORCID Authentication API Tests
 *
 * Verifies ORCID iD validation and profile data fetching.
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  createMockUser,
  generateJwtToken,
  grantPermissions,
} = require("../helpers/strapi");

describe("ORCID Auth API", () => {
  let strapi;
  let user;
  let jwt;

  beforeAll(async () => {
    strapi = await setupStrapi();
    user = await createMockUser({
      username: "orciduser",
      email: "orcid@example.com",
    });
    jwt = generateJwtToken(user);

    const roles = await strapi
      .query("plugin::users-permissions.role")
      .findMany();
    const authRole = roles.find((r) => r.type === "authenticated");

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { role: authRole.id },
    });

    await grantPermissions("authenticated", {
      "orcid-auth": ["validate"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  describe("POST /api/orcid-auth/validate", () => {
    it("should return 401/403/404 if not authenticated", async () => {
      const response = await request(strapi.server.httpServer)
        .post("/api/orcid-auth/validate")
        .send({ orcidId: "0000-0002-1825-0097" });

      expect([401, 403, 404]).toContain(response.status);
    });

    it("should return 400 if orcidId is missing", async () => {
      await request(strapi.server.httpServer)
        .post("/api/orcid-auth/validate")
        .set("Authorization", `Bearer ${jwt}`)
        .send({})
        .expect(400);
    });

    it("should return 400 for invalid ORCID format", async () => {
      const response = await request(strapi.server.httpServer)
        .post("/api/orcid-auth/validate")
        .set("Authorization", `Bearer ${jwt}`)
        .send({ orcidId: "invalid-format" });

      expect(response.status).toBe(400);
      // Strapi v5 error format
      expect(response.body.error.message || response.body.error).toContain(
        "Invalid ORCID format",
      );
    });

    it("should validate and fetch profile for a valid ORCID iD", async () => {
      // Mock global fetch
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes("/person")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                name: {
                  "given-names": { value: "Jane" },
                  "family-name": { value: "Doe" },
                },
                biography: { content: "Test bio" },
                keywords: {
                  keyword: [{ content: "Science" }, { content: "AI" }],
                },
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ group: [] }),
        });
      });

      const response = await request(strapi.server.httpServer)
        .post("/api/orcid-auth/validate")
        .set("Authorization", `Bearer ${jwt}`)
        .send({ orcidId: "0000-0002-1825-0097" });

      if (response.status !== 200) {
        console.error("ORCID Test Error Response:", response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe("Jane");
      expect(response.body.data.lastName).toBe("Doe");
      expect(response.body.data.verified).toBe(true);
      expect(response.body.data.interests).toContain("Science");

      // Verify user record was updated
      const updatedUser = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: user.documentId,
          populate: ["interests"],
        });
      expect(updatedUser.verified).toBe(true);
      expect(updatedUser.orcidId).toBe("0000-0002-1825-0097");
      expect(updatedUser.interests).toHaveLength(2);
      expect(updatedUser.interests[0].name).toBe("Science");

      global.fetch = originalFetch;
    });

    it("should return 404 if ORCID iD is not found", async () => {
      const originalFetch = global.fetch;
      global.fetch = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ ok: false, status: 404 }));

      const response = await request(strapi.server.httpServer)
        .post("/api/orcid-auth/validate")
        .set("Authorization", `Bearer ${jwt}`)
        .send({ orcidId: "0000-0000-0000-0000" });

      expect(response.status).toBe(404);

      global.fetch = originalFetch;
    });
  });
});
