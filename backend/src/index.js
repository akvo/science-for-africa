const { emailTemplate } = require("./helpers/email-template");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // 1. Extend the user content type attributes
    const userModel = strapi.contentType("plugin::users-permissions.user");
    if (userModel) {
      userModel.attributes = {
        ...userModel.attributes,
        firstName: { type: "string" },
        lastName: { type: "string" },
        fullName: { type: "string" },
        position: { type: "string" },
        biography: { type: "text" },
        interests: {
          type: "component",
          repeatable: true,
          component: "user.interest",
          max: 5,
        },
        educationTopic: { type: "string" },
        educationLevel: {
          type: "enumeration",
          enum: [
            "High School",
            "Bachelor's Degree",
            "Master's Degree",
            "Doctorate (PhD)",
            "Post-Doctorate",
            "Professional Certificate",
          ],
        },
        institution: {
          type: "relation",
          relation: "manyToOne",
          target: "api::institution.institution",
          inversedBy: "users",
        },
        affiliationStatus: {
          type: "enumeration",
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
        orcidId: {
          type: "string",
          // Moved regex validation to lifecycle to avoid blocking creation
        },
        onboardingComplete: {
          type: "boolean",
          default: false,
        },
        verificationStatus: {
          type: "enumeration",
          enum: ["unverified", "verified"],
          default: "unverified",
        },
        socialLinks: {
          type: "json",
        },
        userType: {
          type: "enumeration",
          enum: ["individual", "institution"],
        },
        roleType: {
          type: "string",
        },
        educationInstitutionName: {
          type: "string",
        },
        institutionName: {
          type: "string",
        },
      };
    }

    // 2. Override users-permissions register route and controller
    const usersPermissionsPlugin = strapi.plugin("users-permissions");

    // Disable route-level body validation for the register endpoint
    const registerRoute = usersPermissionsPlugin.routes[
      "content-api"
    ].routes.find(
      (route) =>
        route.method === "POST" && route.path === "/auth/local/register",
    );

    if (registerRoute && registerRoute.request) {
      delete registerRoute.request.body;
    }

    // Override the register controller to bypass internal allowedKeys check
    const originalRegister = usersPermissionsPlugin.controller("auth").register;

    usersPermissionsPlugin.controller("auth").register = async (ctx) => {
      const { fullName, ...body } = ctx.request.body;
      ctx.request.body = body;

      await originalRegister(ctx);

      if (ctx.response.status === 200 && fullName) {
        const user = ctx.body.user;
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: user.id },
          data: {
            fullName,
            firstName,
            lastName,
          },
        });

        ctx.body.user.fullName = fullName;
        ctx.body.user.firstName = firstName;
        ctx.body.user.lastName = lastName;
      }
    };

    // Override the callback controller to debug social login failures
    const originalCallback = usersPermissionsPlugin.controller("auth").callback;
    usersPermissionsPlugin.controller("auth").callback = async (ctx) => {
      const { provider } = ctx.params;
      console.log(
        `[AUTH-DEBUG] Social Login Callback for provider: ${provider}`,
      );

      try {
        await originalCallback(ctx);
        console.log(
          `[AUTH-DEBUG] Callback finished with status: ${ctx.status}`,
        );
      } catch (error) {
        console.error(`[AUTH-DEBUG] Silent Error caught in Callback:`, error);
        throw error;
      }
    };

    // Override the emailConfirmation controller to return JSON
    const originalEmailConfirmation =
      usersPermissionsPlugin.controller("auth").emailConfirmation;
    usersPermissionsPlugin.controller("auth").emailConfirmation = async (
      ctx,
    ) => {
      await originalEmailConfirmation(ctx);
      if (ctx.response.status === 302) {
        ctx.body = { success: true };
        ctx.status = 200;
      }
    };

    // 3. Update Swagger documentation
    try {
      if (strapi.plugin("documentation")) {
        strapi
          .plugin("documentation")
          .service("override")
          .registerOverride({
            components: {
              schemas: {
                "Users-PermissionsAuthRegisterRequest": {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    fullName: { type: "string" },
                  },
                  required: ["username", "email", "password", "fullName"],
                },
              },
            },
          });
      }
    } catch (error) {
      strapi.log.warn(
        "Failed to register Swagger documentation override: " + error.message,
      );
    }
  },

  async bootstrap({ strapi }) {
    console.log(
      `[AUTH-DEBUG] Database connected to host: ${strapi.config.get("database.connection.connection.host")}, database: ${strapi.config.get("database.connection.connection.database")}`,
    );

    // Add user lifecycles in bootstrap
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],
      async beforeCreate(event) {
        const { data } = event.params;

        try {
          // Social Login Bypass: Automatically verify users from social providers
          if (data.provider && data.provider !== "local") {
            console.log(
              `[AUTH-DEBUG] Attempting to create social user: ${data.email || data.username}`,
            );
            console.log(
              `[AUTH-DEBUG] Incoming data payload:`,
              JSON.stringify(data),
            );
            data.verificationStatus = "verified";
            data.confirmed = true;
          }

          // Auto-generate fullName
          if (data.firstName || data.lastName) {
            data.fullName =
              `${data.firstName || ""} ${data.lastName || ""}`.trim();
          }

          // --- ONBOARDING DATA MAPPING ---
          if (data.interests && Array.isArray(data.interests)) {
            data.interests = data.interests.map((item) =>
              typeof item === "string" ? { name: item } : item,
            );
          }

          if (data.affiliationInstitution && data.affiliationInstitution.id) {
            data.institution = data.affiliationInstitution.id;
            delete data.affiliationInstitution;
          } else if (
            data.affiliationInstitution &&
            data.affiliationInstitution.name
          ) {
            data.institutionName = data.affiliationInstitution.name;
            delete data.affiliationInstitution;
          }

          if (data.educationInstitution && data.educationInstitution.name) {
            data.educationInstitutionName = data.educationInstitution.name;
            delete data.educationInstitution;
          }
        } catch (error) {
          console.error(
            "[AUTH-DEBUG] Error in beforeCreate user lifecycle:",
            error,
          );
        }
      },
      async beforeUpdate(event) {
        const { data } = event.params;
        if (data.firstName || data.lastName) {
          data.fullName =
            `${data.firstName || ""} ${data.lastName || ""}`.trim();
        }
        if (data.interests && Array.isArray(data.interests)) {
          data.interests = data.interests.map((item) =>
            typeof item === "string" ? { name: item } : item,
          );
        }
      },
    });

    // 1. Ensure email confirmation is enabled in advanced settings
    const advancedStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "advanced",
    });
    const settings = await advancedStore.get();
    const frontendVerifyUrl =
      process.env.EMAIL_CONFIRMATION_URL ||
      "http://localhost:3000/auth/verify-email";
    const emailRedirectUrl = "";

    if (
      !settings.email_confirmation ||
      settings.email_confirmation_redirection !== emailRedirectUrl
    ) {
      await advancedStore.set({
        value: {
          ...settings,
          email_confirmation: true,
          email_confirmation_redirection: emailRedirectUrl,
        },
      });
      strapi.log.info("Email verification settings synchronized.");
    }

    // 2. Branded Email Templates
    const emailStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "email",
    });
    const emailSettings = await emailStore.get();
    let emailUpdated = false;

    if (emailSettings && emailSettings.email_confirmation) {
      const confirmationLink = `${frontendVerifyUrl}?confirmation=<%= CODE %>`;
      emailSettings.email_confirmation.options.message = emailTemplate({
        title: "Confirm Your Email",
        body: `<p>Hello <%= USER.username %>,</p><p>Please verify your email address:</p><div style="text-align: center;"><a href="${confirmationLink}" style="...">Verify Email</a></div>`,
      });
      emailUpdated = true;
    }

    if (emailSettings && emailSettings.reset_password) {
      const resetLink = `${frontendVerifyUrl.replace(/\/auth\/verify-email$/, "")}/auth/reset-password?code=<%= TOKEN %>`;
      emailSettings.reset_password.options.message = emailTemplate({
        title: "Reset Your Password",
        body: `<p>Hello <%= USER.username %>,</p><p>Reset your password here:</p><div style="text-align: center;"><a href="${resetLink}" style="...">Reset Password</a></div>`,
      });
      emailUpdated = true;
    }

    if (emailUpdated) {
      await emailStore.set({ value: emailSettings });
    }

    // 3. Synchronize Google OAuth Provider
    const grantStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "grant",
    });
    const grants = await grantStore.get();

    if (
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      grants
    ) {
      const googleConfig = grants.google || {};
      const frontendCallback =
        (process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000") +
        "/auth/google";

      grants.google = {
        ...googleConfig,
        enabled: true,
        key: process.env.GOOGLE_CLIENT_ID,
        clientId: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callback: frontendCallback,
      };
      delete grants.google.callbackUrl;
      delete grants.google.redirectUri;

      await grantStore.set({ value: grants });
      strapi.log.info("Google OAuth provider synchronized.");
    }

    // 4. Seed development data
    const { seed } = require("./utils/seeder");
    await seed(strapi);
  },
};
