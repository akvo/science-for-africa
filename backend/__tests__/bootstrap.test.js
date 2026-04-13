const { bootstrap } = require("../src/index");
const { emailTemplate } = require("../src/helpers/email-template");

// Mock the emailTemplate helper to simplify assertions
jest.mock("../src/helpers/email-template", () => ({
  emailTemplate: jest.fn(({ title, body }) => `[TEMPLATE: ${title}] ${body}`),
}));

// Mock the seeder to avoid DB calls
jest.mock("../src/utils/seeder", () => ({
  seed: jest.fn().mockResolvedValue(true),
}));

describe("Strapi Bootstrap - Email Templates TDD", () => {
  let strapi;
  let mockAdvancedSettings;
  let mockEmailSettings;
  let capturedEmailSettings;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdvancedSettings = {
      email_confirmation: true,
      email_confirmation_redirection: "http://localhost:3000/auth/verify-email",
    };

    mockEmailSettings = {
      email_confirmation: { options: { message: "", from: {} } },
      reset_password: { options: { message: "", from: {} } },
    };

    const mockAdvancedStore = {
      get: jest.fn().mockResolvedValue(mockAdvancedSettings),
      set: jest.fn().mockResolvedValue(true),
    };

    const mockEmailStore = {
      get: jest.fn().mockResolvedValue(mockEmailSettings),
      set: jest.fn().mockImplementation(async ({ value }) => {
        capturedEmailSettings = value;
        return true;
      }),
    };

    strapi = {
      store: jest.fn(({ name, key }) => {
        if (name === "users-permissions" && key === "advanced")
          return mockAdvancedStore;
        if (name === "users-permissions" && key === "email")
          return mockEmailStore;
        return { get: jest.fn(), set: jest.fn() };
      }),
      config: {
        get: jest.fn().mockImplementation((key) => {
          if (key.includes("database")) return "test-value";
          return null;
        }),
      },
      db: {
        lifecycles: {
          subscribe: jest.fn(),
        },
      },

      log: { info: jest.fn() },
    };
  });

  it("should configure email_confirmation with <%= CODE %>", async () => {
    await bootstrap({ strapi });

    const confirmationMessage =
      capturedEmailSettings.email_confirmation.options.message;
    expect(confirmationMessage).toContain("<%= CODE %>");
  });

  it("should configure reset_password with <%= TOKEN %> (Fix for interpolation bug)", async () => {
    await bootstrap({ strapi });

    const resetMessage = capturedEmailSettings.reset_password.options.message;

    // THE BUG: Currently it contains CODE, should contain TOKEN
    expect(resetMessage).toContain("<%= TOKEN %>");
    expect(resetMessage).not.toContain("<%= CODE %>");
  });
});
