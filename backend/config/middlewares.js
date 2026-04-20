module.exports = [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  {
    name: "strapi::session",
    config: {
      key: "koa.sess",
      maxAge: 86400000,
      autoCommit: true,
      overwrite: true,
      httpOnly: true,
      clearInvalid: true,
      sameSite: "lax",
      secure: false, // Set to false to avoid 'Cannot send secure cookie' crash behind Google LB/Nginx proxies that strip X-Forwarded-Proto
    },
  },
  "strapi::favicon",
  "strapi::public",
  "global::documentation-redirect",
];
