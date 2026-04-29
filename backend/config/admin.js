module.exports = ({ env }) => ({
  url: '/admin',
  auth: {
    secret: env("ADMIN_JWT_SECRET", "test-secret"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT", "test-api-token-salt"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT", "test-transfer-token-salt"),
    },
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
  watchIgnoreFiles: ["**/config/sync/**"],
});
