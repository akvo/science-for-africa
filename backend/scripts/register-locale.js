async function run() {
  try {
    const localeService = strapi.plugin("i18n").service("locales");
    const existing = await localeService.findByCode("fr");
    if (!existing) {
      await localeService.create({ name: "French (fr)", code: "fr" });
      console.log("French (fr) locale created successfully.");
    } else {
      console.log("French (fr) locale already exists.");
    }
  } catch (err) {
    console.error("Error creating locale:", err);
  }
  process.exit(0);
}

run();
