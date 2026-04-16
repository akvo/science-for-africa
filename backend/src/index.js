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
        educationLevel: { type: "string" },
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
        roleType: { type: "string" },
        educationInstitutionName: {
          type: "string",
        },
        institutionName: {
          type: "string",
        },
        otpCode: {
          type: "string",
        },
        otpExpiration: {
          type: "datetime",
        },
        lastOtpSentAt: {
          type: "datetime",
        },
        otpResendCount: {
          type: "integer",
          default: 0,
        },
        otpResendWindowStart: {
          type: "datetime",
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
      console.log("[AUTH-DEBUG] emailConfirmation started", ctx.query);
      try {
        if (typeof originalEmailConfirmation !== "function") {
          console.error(
            "[AUTH-DEBUG] originalEmailConfirmation is NOT a function!",
            typeof originalEmailConfirmation,
          );
          ctx.status = 500;
          ctx.body = { error: "Internal Server Error: Missing controller" };
          return;
        }
        await originalEmailConfirmation(ctx);
        console.log(
          `[AUTH-DEBUG] emailConfirmation original called, status: ${ctx.status}`,
        );
        // If the original logic set a redirect, we transform it into a JSON response
        if (ctx.response.status === 302) {
          ctx.body = { success: true };
          ctx.status = 200;
        }
      } catch (error) {
        console.error(
          "[AUTH-DEBUG] Error in emailConfirmation override:",
          error,
        );
        throw error;
      }
    };

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
    if (strapi.config && typeof strapi.config.get === "function") {
      console.log(
        `[AUTH-DEBUG] Database connected to host: ${strapi.config.get("database.connection.connection.host")}, database: ${strapi.config.get("database.connection.connection.database")}`,
      );
    }

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

          // OTP Generation for local providers
          if (!data.provider || data.provider === "local") {
            const otpCode = Math.floor(
              100000 + Math.random() * 900000,
            ).toString();
            const now = new Date();
            const expiration = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

            data.otpCode = otpCode;
            data.otpExpiration = expiration;
            data.lastOtpSentAt = now;
            data.otpResendWindowStart = now;
            data.otpResendCount = 0;
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
        // Synchronize verificationStatus with confirmed status
        if (data.confirmed === true) {
          data.verificationStatus = "verified";
        } else if (data.confirmed === false) {
          data.verificationStatus = "unverified";
        }

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

    // --- GLOBAL LOCALE SAFETY ---
    // Ensure all localized models default to 'en' if no locale is provided.
    // This catches low-level db.query calls (like seeders) that bypass standard Document Service logic.
    if (strapi.contentTypes) {
      const localizedModels = Object.entries(strapi.contentTypes)
        .filter(([uid, model]) => model.pluginOptions?.i18n?.localized === true)
        .map(([uid]) => uid);

      if (localizedModels.length > 0) {
        strapi.db.lifecycles.subscribe({
          models: localizedModels,
          async beforeCreate(event) {
            const { data } = event.params;
            if (!data.locale) {
              data.locale = "en";
            }
          },
        });
      }
    }

    // 1. Ensure email confirmation is enabled in advanced settings
    const advancedStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "advanced",
    });
    const settings = await advancedStore.get();
    // For API-driven verification from the frontend, we don't want the backend to redirect.
    // If redirection is set, Axios calls from the frontend will fail due to CORS on the redirect target.
    // Setting this to an empty string tells Strapi to return a JSON response instead of a 302 redirect.
    const emailRedirectUrl = "";

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.PUBLIC_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      "http://localhost:3000";

    strapi.log.info(`Resolved Frontend URL for bootstrap: ${frontendUrl}`);

    const isEmailEnabled = settings.email_confirmation;
    const isRedirectOk =
      settings.email_confirmation_redirection === emailRedirectUrl;

    const frontendVerifyUrl =
      process.env.EMAIL_CONFIRMATION_URL || `${frontendUrl}/auth/verify-email`;

    if (!isEmailEnabled || !isRedirectOk) {
      await advancedStore.set({
        value: {
          ...settings,
          email_confirmation: true,
          email_confirmation_redirection: emailRedirectUrl,
        },
      });
      strapi.log.info(
        `Email verification settings synchronized (Redirection disabled for API-driven flow)`,
      );
    }

    // 2. Set branded email templates for confirmation and reset password
    const emailStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "email",
    });
    const emailSettings = await emailStore.get();
    let emailUpdated = false;

    if (emailSettings && emailSettings.email_confirmation) {
      const confirmationLink = `${frontendVerifyUrl}?confirmation=<%= CODE %>`;
      const brandedBody = `
        <p>Hello <%= USER.username %>,</p>
        <p>Thank you for joining the Science for Africa platform. To complete your registration and active your account, please use the following verification code:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #008080;"><%= USER.otpCode %></span>
        </div>
        <p>Alternatively, you can click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmationLink}" style="background-color: #12b76a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #008080;">${confirmationLink}</p>
        <p>If you did not create an account, please ignore this email.</p>
      `;

      emailSettings.email_confirmation.options.message = emailTemplate({
        title: "Confirm Your Email",
        body: brandedBody,
      });
      emailSettings.email_confirmation.options.object =
        "Verify your Science for Africa account";
      emailSettings.email_confirmation.options.from.name = "Science for Africa";
      emailSettings.email_confirmation.options.from.email =
        process.env.SMTP_FROM || "no-reply@strapi.io";

      if (emailSettings.reset_password) {
        emailSettings.reset_password.options.from.name = "Science for Africa";
        emailSettings.reset_password.options.from.email =
          process.env.SMTP_FROM || "no-reply@strapi.io";
      }
      emailUpdated = true;
    }

    if (emailSettings && emailSettings.reset_password) {
      const resetLink = `${frontendUrl}/auth/reset-password?code=<%= TOKEN %>`;
      const brandedResetBody = `
        <p>Hello <%= USER.username %>,</p>
        <p>We received a request to reset the password for your Science for Africa account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #008080; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #008080;">${resetLink}</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `;

      emailSettings.reset_password.options.message = emailTemplate({
        title: "Reset Your Password",
        body: brandedResetBody,
      });
      emailSettings.reset_password.options.object =
        "Reset your Science for Africa account password";
      emailSettings.reset_password.options.from.name = "Science for Africa";
      emailUpdated = true;
    }

    if (emailUpdated) {
      await emailStore.set({ value: emailSettings });
      strapi.log.info("Branded email templates initialized.");
    }

    // 3. Google OAuth is now handled declaratively in config/plugins.js
    // No manual synchronization needed here anymore.

    // 4. Seed development data
    const { seed } = require("./utils/seeder");
    await seed(strapi);
  },
};
