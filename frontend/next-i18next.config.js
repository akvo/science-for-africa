const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    fallbackLng: "en",
  },
  localePath: path.resolve(__dirname, "public/locales"),
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
