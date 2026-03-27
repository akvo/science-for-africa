/**
 * User Extension Tests
 *
 * Verifies the extended fields and lifecycle hooks for the User model.
 */

const {
  setupStrapi,
  teardownStrapi,
  getStrapi,
  createMockUser,
} = require("../helpers/strapi");

describe("User Extension", () => {
  // Setup Strapi before all tests
  beforeAll(async () => {
    await setupStrapi();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await teardownStrapi();
  });

  it("should sync fullName from firstName and lastName on creation", async () => {
    const user = await createMockUser({
      username: "johndoe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
    });

    expect(user.fullName).toBe("John Doe");
  });

  it("should update fullName when firstName changes", async () => {
    const strapi = getStrapi();

    // Create initial user
    const user = await createMockUser({
      username: "janedoe",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(user.fullName).toBe("Jane Doe");

    // Update firstName
    const updatedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .update({
        where: { id: user.id },
        data: {
          firstName: "Janet",
          lastName: "Doe", // explicitly sending both as per current lifecycle implementation
        },
      });

    expect(updatedUser.fullName).toBe("Janet Doe");
  });

  it("should have extended profile fields available", async () => {
    const user = await createMockUser({
      username: "prof",
      email: "prof@example.com",
      position: "Senior Researcher",
      educationTopic: "Computer Science",
      orcidId: "1234-5678-9012-3456",
    });

    expect(user.position).toBe("Senior Researcher");
    expect(user.educationTopic).toBe("Computer Science");
    expect(user.orcidId).toBe("1234-5678-9012-3456");
  });
});
