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
          enum: ["Bachelors", "Masters", "PhD", "Other"],
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
          regex: "^\\d{4}-\\d{4}-\\d{4}-\\d{3}[\\dX]$",
        },
        onboardingComplete: {
          type: "boolean",
          default: false,
        },
        twoFactorSecret: {
          type: "string", // Changed from password to string to avoid hashing
          private: true,
        },
        twoFactorEnabled: {
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
      };

      // Add user lifecycles using the more reliable subscribe method
      strapi.db.lifecycles.subscribe({
        models: ["plugin::users-permissions.user"],
        async beforeCreate(event) {
          const { data } = event.params;
          if (data.firstName || data.lastName) {
            data.fullName =
              `${data.firstName || ""} ${data.lastName || ""}`.trim();
          }
        },
        async beforeUpdate(event) {
          const { data } = event.params;
          if (data.firstName || data.lastName) {
            const firstName =
              data.firstName !== undefined ? data.firstName : "";
            const lastName = data.lastName !== undefined ? data.lastName : "";
            data.fullName = `${firstName} ${lastName}`.trim();
          }
        },
      });
    }

    // 2. Override users-permissions register route and controller
    const usersPermissionsPlugin = strapi.plugin("users-permissions");

    // Disable route-level body validation for the register endpoint
    // Strapi v5 uses route.request.body for validation, which occurs before the controller.
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
      // Extract fullName and remove it from the body sent to the original controller
      // this bypasses the internal "Invalid parameters" check in the users-permissions plugin
      const { fullName, ...body } = ctx.request.body;
      ctx.request.body = body;

      // Call the original register logic
      await originalRegister(ctx);

      // If registration was successful (status 200), update the user with fullName
      if (ctx.response.status === 200 && fullName) {
        const user = ctx.body.user;

        // Split fullName into firstName and lastName for backend logic compatibility
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

        // Update the response user object
        // Update the response user object
        ctx.body.user.fullName = fullName;
        ctx.body.user.firstName = firstName;
        ctx.body.user.lastName = lastName;
      }
    };

    // 3. Update Swagger documentation for fullName
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
    // 1. Ensure email confirmation is enabled in advanced settings
    const advancedStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "advanced",
    });
    const settings = await advancedStore.get();

    const emailRedirectUrl = process.env.EMAIL_CONFIRMATION_URL;

    if (
      !settings.email_confirmation ||
      (emailRedirectUrl &&
        settings.email_confirmation_redirection !== emailRedirectUrl)
    ) {
      await advancedStore.set({
        value: {
          ...settings,
          email_confirmation: true,
          email_confirmation_redirection:
            emailRedirectUrl || settings.email_confirmation_redirection,
        },
      });
      strapi.log.info(
        `Email verification enabled and redirection set to ${emailRedirectUrl}`,
      );
    }

    // 2. Set branded email template for confirmation
    const emailStore = strapi.store({
      type: "plugin",
      name: "users-permissions",
      key: "email",
    });
    const emailSettings = await emailStore.get();

    if (emailSettings && emailSettings.email_confirmation) {
      const confirmationLink = `${emailRedirectUrl}?confirmation=<%= CODE %>`;
      const brandedBody = `
        <p>Hello <%= USER.username %>,</p>
        <p>Thank you for joining the Science for Africa platform. To complete your registration and active your account, please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmationLink}" style="background-color: #008080; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
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

      await emailStore.set({ value: emailSettings });
      strapi.log.info("Branded email confirmation template initialized.");
    }
  },
};

