module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'test-secret-stabilizer-12345678'),
    },
  },
});
