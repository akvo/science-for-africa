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
      secure: false,
      sameSite: "lax",
    },
  },
  "strapi::favicon",
  "strapi::public",
  "global::documentation-redirect",
];
