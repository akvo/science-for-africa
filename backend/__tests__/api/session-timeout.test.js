const request = require("supertest");
const crypto = require("crypto");
const { setupStrapi, teardownStrapi } = require("../helpers/strapi");

describe("Session Timeout and Absolute Lifetime API", () => {
  let strapi;
  let userToken;
  let userObj;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Disable email confirmation for these tests
    const store = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "advanced",
    });
    const settings = store ? await store.get() : {};
    if (store) {
      await store.set({ value: { ...settings, email_confirmation: false } });
    }

    const { grantPermissions } = require("../helpers/strapi");
    await grantPermissions("authenticated", {
      auth: ["logout"],
    });
    await grantPermissions("public", {
      auth: ["logout"],
    });

    // Set configuration values in environment (can also verify default fallback behavior)
    process.env.SESSION_IDLE_TIMEOUT_MINUTES = "10";
    process.env.SESSION_ABSOLUTE_TIMEOUT_MINUTES = "60";

    // Register a test user
    const uniqueId = Date.now();
    const testEmail = `session-test-${uniqueId}@example.com`;
    const testUsername = `user-${uniqueId}`;
    const testPassword = "Password123!";

    await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .send({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      });

    // Login to get JWT
    const loginRes = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .send({
        identifier: testEmail,
        password: testPassword,
      });

    userToken = loginRes.body.jwt;
    userObj = loginRes.body.user;
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should create a session record on first authenticated request and succeed", async () => {
    // Before requesting, verify no session exists for this token hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(userToken)
      .digest("hex");
    let session = await strapi.db
      .query("api::user-session.user-session")
      .findOne({
        where: { tokenHash },
      });
    expect(session).toBeNull();

    // Perform an authenticated request
    const response = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);

    // Verify session was created
    session = await strapi.db.query("api::user-session.user-session").findOne({
      where: { tokenHash },
    });
    expect(session).not.toBeNull();
    expect(session.ipAddress).toBeDefined();
  });

  it("should expire the session if the idle timeout is exceeded", async () => {
    const tokenHash = crypto
      .createHash("sha256")
      .update(userToken)
      .digest("hex");

    // Manually update lastActivity to be 15 minutes ago (idle timeout is 10 minutes)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    await strapi.db.query("api::user-session.user-session").update({
      where: { tokenHash },
      data: { lastActivity: fifteenMinsAgo },
    });

    // Request should now return 401
    const response = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain("inactivity");

    // Verify session record was deleted
    const session = await strapi.db
      .query("api::user-session.user-session")
      .findOne({
        where: { tokenHash },
      });
    expect(session).toBeNull();
  });

  it("should expire the session if the absolute maximum lifetime is exceeded", async () => {
    // Login again to obtain a new valid token
    const uniqueId = Date.now() + 100;
    const testEmail = `session-test-2-${uniqueId}@example.com`;
    const testUsername = `user-2-${uniqueId}`;
    const testPassword = "Password123!";

    await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .send({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      });

    const loginRes = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .send({
        identifier: testEmail,
        password: testPassword,
      });

    const newToken = loginRes.body.jwt;
    const tokenHash = crypto
      .createHash("sha256")
      .update(newToken)
      .digest("hex");

    // Make an authenticated request to initialize the session
    const responseInit = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${newToken}`);
    expect(responseInit.status).toBe(200);

    // Manually update createdAt to be 70 minutes ago (absolute timeout is 60 minutes)
    const seventyMinsAgo = new Date(Date.now() - 70 * 60 * 1000);
    await strapi.db.query("api::user-session.user-session").update({
      where: { tokenHash },
      data: { createdAt: seventyMinsAgo },
    });

    // Request should return 401
    const response = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${newToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain("lifetime");

    // Verify session record was deleted
    const session = await strapi.db
      .query("api::user-session.user-session")
      .findOne({
        where: { tokenHash },
      });
    expect(session).toBeNull();
  });

  it("should destroy the session on /api/auth/logout", async () => {
    // Login to get a fresh token
    const uniqueId = Date.now() + 200;
    const testEmail = `session-test-3-${uniqueId}@example.com`;
    const testUsername = `user-3-${uniqueId}`;
    const testPassword = "Password123!";

    await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .send({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      });

    const loginRes = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .send({
        identifier: testEmail,
        password: testPassword,
      });

    const logoutToken = loginRes.body.jwt;
    const tokenHash = crypto
      .createHash("sha256")
      .update(logoutToken)
      .digest("hex");

    // Create session in DB by making one request
    await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${logoutToken}`);

    // Verify session exists
    let session = await strapi.db
      .query("api::user-session.user-session")
      .findOne({
        where: { tokenHash },
      });
    expect(session).not.toBeNull();

    // Perform logout request
    const logoutRes = await request(strapi.server.httpServer)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${logoutToken}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Verify session is deleted
    session = await strapi.db.query("api::user-session.user-session").findOne({
      where: { tokenHash },
    });
    expect(session).toBeNull();
  });
});
