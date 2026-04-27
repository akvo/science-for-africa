const { emailTemplate } = require("./helpers/email-template");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // 1. User content type attributes are now defined in
    //    src/extensions/users-permissions/content-types/user/schema.json

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

    // 3. Extend users-permissions with PUT /auth/me
    const contentApiRoutes =
      usersPermissionsPlugin.routes["content-api"].routes;

    // 3. The custom /auth routes are now primarily handled by the standalone api::auth
    // which allows for better organization and permission management in v5.
    // We remove the plugin route overrides to avoid path conflicts.
    // --- CONSOLIDATION: Routes moved to api::auth/routes/auth.js ---

    // Add actions to the user controller using the modern Strapi v5 API
    const userController = strapi
      .plugin("users-permissions")
      .controller("user");

    // We no longer override verifyOtp, resendOtp, etc. here because they are handled
    // in the standalone api::auth which follows better organization.
    // However, we preserve the updateMe override IF needed for plugin-level hooks,
    // but the routes are now pointing to api::auth.

    // 4. Override the emailConfirmation controller to return JSON
    const originalEmailConfirmation =
      usersPermissionsPlugin.controller("auth").emailConfirmation;
    usersPermissionsPlugin.controller("auth").emailConfirmation = async (
      ctx,
    ) => {
      try {
        await originalEmailConfirmation(ctx);
        if (ctx.response.status === 302) {
          ctx.body = { success: true };
          ctx.status = 200;
        }
      } catch (error) {
        strapi.log.error("Email Confirmation Error: " + error.message);
        throw error;
      }
    };

    // 5. Add /auth/users GET route for search
    contentApiRoutes.push({
      method: "GET",
      path: "/auth/users",
      handler: "user.find", // Use built-in find or custom
      config: {
        prefix: "",
      },
    });

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

    // Diagnostic: Scan Auth Routes
    console.log("--- SCANNING AUTH ROUTES DETAILS ---");
    try {
      const upRoutes =
        strapi.plugins["users-permissions"].routes["content-api"].routes;
      upRoutes.forEach((route) => {
        if (
          route.path.includes("/me") ||
          route.path.includes("/find-users") ||
          route.handler.includes("otp")
        ) {
          const auth = route.config?.auth === false ? "PUBLIC" : "REQUIRED";
          const policies = route.config?.policies || [];
          console.log(
            `[ROUTE] ${route.method} ${route.path} -> ${route.handler} | Auth: ${auth} | Policies: ${JSON.stringify(policies)}`,
          );
        }
      });
    } catch (err) {
      console.log(`[SCAN-ERROR] Failed to scan UP routes: ${err.message}`);
    }
    console.log("--- SCAN COMPLETE ---");

    // Run migrations
    try {
      const backfillInstitutions = require("./bootstrap/migrations/backfill-institutions");
      await backfillInstitutions({ strapi });
    } catch (err) {
      strapi.log.error(`Migration Error: ${err.message}`);
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

          // Deprecated: Institution mappings moved to backfill and frontend logic
        } catch (error) {
          console.error(
            "[AUTH-DEBUG] Error in beforeCreate user lifecycle:",
            error,
          );
        }
      },
      async beforeUpdate(event) {
        const { data } = event.params;
        // Deprecated: verificationStatus moved to InstitutionMembership

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

    // 3. Force-Synchronize Google OAuth Provider settings
    // Strapi v5 often sticks to database values; this ensures the code fix is applied.
    try {
      const grantStore = strapi.store({
        type: "plugin",
        name: "users-permissions",
        key: "grant",
      });
      const currentGrant = await grantStore.get();

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      const frontendUrlForCallback = (
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        process.env.FRONTEND_URL ||
        process.env.PUBLIC_URL ||
        "http://localhost:3000"
      ).replace(/\/$/, "");

      const backendUrlForLogs = (
        process.env.BACKEND_URL || "http://localhost:1337"
      ).replace(/\/$/, "");

      // Use essentials only to prevent header bloat
      const googleConfig = {
        enabled: true,
        protocol: "oauth2",
        key: clientId,
        secret: clientSecret || currentGrant?.google?.secret,
        callback: `${frontendUrlForCallback}/auth/google`,
        scope: ["email", "profile"],
      };

      if (clientId) {
        // Sync Grant settings
        await grantStore.set({
          value: {
            ...currentGrant,
            google: googleConfig,
          },
        });

        // Sync Advanced settings (google_redirection)
        const advancedStore = strapi.store({
          type: "plugin",
          name: "users-permissions",
          key: "advanced",
        });
        const currentAdvanced = await advancedStore.get();
        const frontendUrl = (
          process.env.NEXT_PUBLIC_FRONTEND_URL ||
          process.env.FRONTEND_URL ||
          process.env.PUBLIC_URL ||
          "http://localhost:3000"
        ).replace(/\/$/, "");

        await advancedStore.set({
          value: {
            ...currentAdvanced,
            email_confirmation_redirection: `${frontendUrl}/login?verified=true`,
            google_redirection: `${frontendUrl}/auth/google`,
          },
        });

        strapi.log.info(
          `[AUTH] Synced Google OAuth & Redirect to: ${googleConfig.callback} -> ${frontendUrl}`,
        );
      }
    } catch (error) {
      strapi.log.error(`[AUTH] Failed to sync Google OAuth: ${error.message}`);
    }

    // 4. Seed development data
    const { seed } = require("./utils/seeder");
    await seed(strapi);
  },
};
