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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      proxy: true,
    },
  },
  "strapi::favicon",
  "strapi::public",
  "global::documentation-redirect",
];
