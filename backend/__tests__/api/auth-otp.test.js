/**
 * OTP Verification API Tests
 *
 * Tests the endpoints for verify-otp and resend-otp.
 */

const request = require("supertest");
const { setupStrapi, teardownStrapi } = require("../helpers/strapi");

describe("OTP Verification API", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  const getTestUser = async (email) => {
    return await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { email },
    });
  };

  describe("POST /api/auth/verify-otp", () => {
    it("should verify user with correct OTP", async () => {
      const email = `otp-success-${Date.now()}@example.com`;
      // Register user (this triggers beforeCreate which generates OTP)
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: `user-${Date.now()}`,
          email,
          password: "Password123!",
          fullName: "OTP Success User",
        });

      const user = await getTestUser(email);
      expect(user.otpCode).toBeDefined();

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/verify-otp")
        .send({
          email,
          otpCode: user.otpCode,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);

      const updatedUser = await getTestUser(email);
      expect(updatedUser.confirmed).toBe(true);
      expect(updatedUser.otpCode).toBeNull();
    });

    it("should fail with incorrect OTP", async () => {
      const email = `otp-fail-${Date.now()}@example.com`;
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: `user-fail-${Date.now()}`,
          email,
          password: "Password123!",
          fullName: "OTP Fail User",
        });

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/verify-otp")
        .send({
          email,
          otpCode: "000000", // Incorrect code
        });

      expect(response.status).toBe(400);
      const message =
        response.body.message ||
        response.body.error?.message ||
        response.body.error;
      expect(message).toMatch(/Invalid or expired/i);
    });

    it("should fail with expired OTP", async () => {
      const email = `otp-expired-${Date.now()}@example.com`;
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: `user-exp-${Date.now()}`,
          email,
          password: "Password123!",
          fullName: "OTP Expired User",
        });

      // Manually expire the OTP in DB
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { email },
        data: {
          otpExpiration: new Date(Date.now() - 1000), // 1s ago
        },
      });

      const user = await getTestUser(email);

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/verify-otp")
        .send({
          email,
          otpCode: user.otpCode,
        });

      expect(response.status).toBe(400);
      const message =
        response.body.message ||
        response.body.error?.message ||
        response.body.error;
      expect(message).toMatch(/Invalid or expired/i);
    });
  });

  describe("POST /api/auth/resend-otp", () => {
    it("should resend OTP successfully after 60s cooldown", async () => {
      const email = `resend-success-${Date.now()}@example.com`;
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: `ruser-${Date.now()}`,
          email,
          password: "Password123!",
          fullName: "Resend Success User",
        });

      // Manually bypass 60s cooldown for testing success path
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { email },
        data: {
          lastOtpSentAt: new Date(Date.now() - 61000), // 61s ago
        },
      });

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/resend-otp")
        .send({ email });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    it("should fail if called within 60s cooldown", async () => {
      const email = `resend-cooldown-${Date.now()}@example.com`;
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: `rcuser-${Date.now()}`,
          email,
          password: "Password123!",
          fullName: "Resend Cooldown User",
        });

      // Attempt immediate resend (cooldown is 60s)
      const response = await request(strapi.server.httpServer)
        .post("/api/auth/resend-otp")
        .send({ email });

      expect(response.status).toBe(429);
      const message =
        response.body.message ||
        response.body.error?.message ||
        response.body.error;
      expect(message).toMatch(/wait/i);
    });

    it("should fail if hourly limit (3) exceeded", async () => {
      const email = `resend-limit-${Date.now()}@example.com`;
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: `rluser-${Date.now()}`,
          email,
          password: "Password123!",
          fullName: "Resend Limit User",
        });

      // Simulate 3 resends already done
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { email },
        data: {
          otpResendCount: 3,
          otpResendWindowStart: new Date(),
          lastOtpSentAt: new Date(Date.now() - 65000), // Bypass 60s cooldown
        },
      });

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/resend-otp")
        .send({ email });

      expect(response.status).toBe(429);
      const message =
        response.body.message ||
        response.body.error?.message ||
        response.body.error;
      expect(message).toMatch(/Maximum resend attempts/i);
    });

    it("should fail for already confirmed users", async () => {
      const email = `resend-confirmed-${Date.now()}@example.com`;
      await request(strapi.server.httpServer)
        .post("/api/auth/local/register")
        .send({
          username: `rcuser-conf-${Date.now()}`,
          email,
          password: "Password123!",
          fullName: "Already Confirmed User",
        });

      // Confirm user manually
      await strapi.db.query("plugin::users-permissions.user").update({
        where: { email },
        data: { confirmed: true },
      });

      const response = await request(strapi.server.httpServer)
        .post("/api/auth/resend-otp")
        .send({ email });

      expect(response.status).toBe(400);
      const message =
        response.body.message ||
        response.body.error?.message ||
        response.body.error;
      expect(message).toMatch(/already verified/i);
    });
  });
});
