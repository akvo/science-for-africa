"use strict";

const request = require("supertest");
const speakeasy = require("speakeasy");
const {
  setupStrapi,
  teardownStrapi,
  grantPermissions,
} = require("../helpers/strapi");

describe("2FA Security Flow", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // DEBUG: check middleware
    console.log(
      "Registered Middlewares:",
      Object.keys(strapi.middleware || {}),
    );
    console.log("App Dir Root:", strapi.dirs.app.root);

    // Grant permissions to the authenticated role for 2FA actions
    await grantPermissions("authenticated", {
      auth: ["generate2FA", "verify2FA", "login2FA", "getStatus"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should flow through the entire 2FA lifecycle", async () => {
    // 1. Register a new user
    const uniqueId = Date.now();
    const userEmail = `2fa-${uniqueId}@example.com`;

    const registrationRes = await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .send({
        username: `2fauser-${uniqueId}`,
        email: userEmail,
        password: "Password123!",
      });

    expect(registrationRes.status).toBe(200);

    // Manually confirm user to bypass email verification for 2FA test
    await strapi.query("plugin::users-permissions.user").update({
      where: { email: userEmail },
      data: { confirmed: true },
    });

    // 2. Initial login (Password ONLY) - Expect full access since 2FA is NOT enabled yet
    const loginRes1 = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .send({
        identifier: userEmail,
        password: "Password123!",
      });

    expect(loginRes1.status).toBe(200);
    expect(loginRes1.body.requires2FA).toBeUndefined();
    const accessJwt = loginRes1.body.jwt;

    // 3. Generate 2FA Secret
    const generateRes = await request(strapi.server.httpServer)
      .post("/api/auth/2fa/generate")
      .set("Authorization", `Bearer ${accessJwt}`)
      .send();

    expect(generateRes.status).toBe(200);
    expect(generateRes.body.qrCodeUrl).toBeDefined();

    // Get the secret directly from DB for testing
    const dbUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: userEmail },
      });
    const secret = dbUser.twoFactorSecret;

    // 4. Verify/Enable 2FA
    const validToken = speakeasy.totp({
      secret,
      encoding: "base32",
    });

    const verifyRes = await request(strapi.server.httpServer)
      .post("/api/auth/2fa/verify")
      .set("Authorization", `Bearer ${accessJwt}`)
      .send({ code: validToken });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    // 5. Login again after enabling 2FA - Expect Partial JWT
    const loginRes2 = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .send({
        identifier: userEmail,
        password: "Password123!",
      });

    // DEBUG: print login body
    console.log("Login2 Body:", loginRes2.body);

    expect(loginRes2.status).toBe(200);
    expect(loginRes2.body.requires2FA).toBe(true);
    const partialJwt = loginRes2.body.jwt;

    // 6. Try to access a protected route with Partial JWT - Expect 403
    const protectedRes1 = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${partialJwt}`)
      .send();

    expect(protectedRes1.status).toBe(403);

    // 7. Login Step 2 (TOTP)
    const loginStep2Res = await request(strapi.server.httpServer)
      .post("/api/auth/2fa/login")
      .set("Authorization", `Bearer ${partialJwt}`)
      .send({
        code: speakeasy.totp({
          secret,
          encoding: "base32",
        }),
      });

    expect(loginStep2Res.status).toBe(200);
    expect(loginStep2Res.body.jwt).toBeDefined();
    const fullJwt = loginStep2Res.body.jwt;

    // 8. Access protected route with Full JWT - Expect 200
    const protectedRes2 = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${fullJwt}`)
      .send();

    expect(protectedRes2.status).toBe(200);
  });
});
