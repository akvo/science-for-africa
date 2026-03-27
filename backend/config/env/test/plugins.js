module.exports = () => ({
  'users-permissions': {
    config: {
      jwtSecret: 'test-secret',
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'mailpit',
        port: 1025,
        ignoreTLS: true,
        auth: false,
      },
      settings: {
        defaultFrom: 'test@example.com',
        defaultReplyTo: 'test@example.com',
      },
    },
  },
});
