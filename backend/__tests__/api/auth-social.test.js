"use strict";

const { setupStrapi, teardownStrapi } = require("../helpers/strapi");

describe("Social Auth Lifecycle", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should mark users from social providers as verified (TDD)", async () => {
    const uniqueId = Date.now();
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          username: `googleuser-${uniqueId}`,
          email: `google-${uniqueId}@example.com`,
          password: "Password123!",
          provider: "google",
          confirmed: false,
          verificationStatus: "unverified",
        },
      });

    const updatedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
      });

    expect(updatedUser.confirmed).toBe(true);
  });

  it("should NOT mark local users as verified automatically", async () => {
    const uniqueId = Date.now() + 1000;
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .create({
        data: {
          username: `localuser-${uniqueId}`,
          email: `local-${uniqueId}@example.com`,
          password: "Password123!",
          provider: "local",
          confirmed: false,
        },
      });

    const updatedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
      });

    expect(updatedUser.confirmed).toBe(false);
  });
});
