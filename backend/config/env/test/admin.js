module.exports = () => ({
  auth: {
    secret: 'test-secret',
  },
  apiToken: {
    salt: 'test-api-token-salt',
  },
  transfer: {
    token: {
      salt: 'test-transfer-token-salt',
    },
  },
});
