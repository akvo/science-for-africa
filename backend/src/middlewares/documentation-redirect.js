/**
 * `documentation-redirect` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Redirect /documentation to the versioned API documentation path
    if (ctx.url === '/documentation' || ctx.url === '/documentation/') {
      ctx.redirect('/documentation/v1.0.0');
      return;
    }

    await next();
  };
};
