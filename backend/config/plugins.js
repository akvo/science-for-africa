const { getFrontendUrl } = require("../src/utils/url-helpers");

const isEmpty = (value) => {
  return (
    value == null || // use `==` to check for null || undefined
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

module.exports = ({ env }) => {
  const emailConfig =
    !isEmpty(env("SMTP_HOST")) &&
    !isEmpty(env("SMTP_USERNAME")) &&
    !isEmpty(env("SMTP_PASSWORD"))
      ? {
          provider: "nodemailer",
          providerOptions: {
            host: env("SMTP_HOST"),
            port: env("SMTP_PORT"),
            auth: {
              user: env("SMTP_USERNAME"),
              pass: env("SMTP_PASSWORD"),
            },
          },
        }
      : {
          provider: "nodemailer",
          providerOptions: {
            host: "mailpit",
            port: 1025,
            ignoreTLS: true,
            auth: false,
          },
        };

  const uploadConfig = !isEmpty(env.json("GCS_SERVICE_ACCOUNT"))
    ? {
        provider:
          "@strapi-community/strapi-provider-upload-google-cloud-storage",
        providerOptions: {
          serviceAccount: env.json("GCS_SERVICE_ACCOUNT"),
          bucketName: env("GCS_BUCKET_NAME"),
          basePath: env("GCS_BASE_PATH"),
          baseUrl: env("GCS_BASE_URL"),
          publicFiles: env("GCS_PUBLIC_FILES"),
          uniform: env("GCS_UNIFORM"),
          skipCheckBucket: true,
        },
      }
    : {};

  const frontendUrl = getFrontendUrl();

  return {
    email: {
      config: {
        ...emailConfig,
        settings: {
          defaultFrom: env("SMTP_FROM"),
          defaultReplyTo: env("SMTP_FROM"),
        },
      },
    },
    upload: {
      config: {
        ...uploadConfig,
        sizeLimit: 250 * 1024 * 1024,
      },
    },
    documentation: {
      enabled: true,
      config: {
        openapi: "3.0.0",
        info: {
          version: "1.0.0",
          title: "Science for Africa API",
          description:
            "Official API documentation for the Science for Africa platform.",
        },
      },
    },
    "config-sync": {
      enabled: true,
      config: {
        syncDir: "config/sync/",
        importOnBootstrap: false,
        customTypes: [],
        excludedTypes: [],
        excludedConfig: [
          "core-store.plugin_users-permissions_grant",
          "core-store.plugin_users-permissions_advanced",
          "core-store.plugin_users-permissions_email",
        ],
      },
    },
    "users-permissions": {
      config: {
        register: {
          allowedFields: ["fullName"],
        },
        jwt: {
          expiresIn: "30d",
        },
        advanced: {
          email_confirmation_redirection: frontendUrl + "/login?verified=true",
          google_redirection: frontendUrl + "/auth/google",
        },
        ratelimit: {
          enabled: false,
        },
        grant: {
          google: {
            enabled: true,
            protocol: "oauth2",
            key: env("GOOGLE_CLIENT_ID"),
            secret: env("GOOGLE_CLIENT_SECRET"),
            callback: frontendUrl + "/auth/google",
            scope: ["email", "profile"],
            custom_params: {
              prompt: "consent",
            },
          },
        },
      },
    },
  };
};
