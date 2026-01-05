module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Trust proxy headers from nginx
  proxy: {
    koa: true,
  },
  // Public URL for Strapi (webhooks, emails, OAuth)
  url: env('BACKEND_URL', 'http://localhost/cms'),
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
