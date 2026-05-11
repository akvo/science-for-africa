"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/orcid-auth/validate",
      handler: "orcid-auth.validate",
      config: {
        description:
          "Validate an ORCID iD and fetch public profile data",
      },
    },
  ],
};
