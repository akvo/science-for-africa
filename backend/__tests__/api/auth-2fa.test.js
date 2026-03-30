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

  let accessJwt;
  let partialJwt;
  let userEmail;
  let secret;

  it("Step 1: User registration and initial access (2FA Disabled)", async () => {
    const uniqueId = Date.now();
    userEmail = `2fa-${uniqueId}@example.com`;

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

    const loginRes = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .send({
        identifier: userEmail,
        password: "Password123!",
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.requires2FA).toBeUndefined();
    accessJwt = loginRes.body.jwt;
  });

  it("Step 2: Generate 2FA Secret", async () => {
    const generateRes = await request(strapi.server.httpServer)
      .post("/api/auth/2fa/generate")
      .set("Authorization", `Bearer ${accessJwt}`)
      .send();

    expect(generateRes.status).toBe(200);
    expect(generateRes.body.qrCodeUrl).toBeDefined();

    const dbUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: userEmail },
      });
    secret = dbUser.twoFactorSecret;
    expect(secret).toBeDefined();
  });

  it("Step 3: Verify and Enable 2FA", async () => {
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
  });

  it("Step 4: Multi-Step 2FA Login Flow", async () => {
    // 1. Password Login -> Receive Partial JWT
    const loginRes2 = await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .send({
        identifier: userEmail,
        password: "Password123!",
      });

    expect(loginRes2.status).toBe(200);
    expect(loginRes2.body.requires2FA).toBe(true);
    partialJwt = loginRes2.body.jwt;

    // 2. Validate Partial JWT doesn't have full access
    const protectedRes1 = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${partialJwt}`)
      .send();

    expect(protectedRes1.status).toBe(403);

    // 3. TOTP Login -> Receive Full JWT
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

    // 4. Access protected route with Full JWT
    const protectedRes2 = await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${fullJwt}`)
      .send();

    expect(protectedRes2.status).toBe(200);
  });
});
