"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/orcid-auth/authorize",
      handler: "orcid-auth.authorize",
      config: {
        description: "Get ORCID OAuth authorization URL",
      },
    },
    {
      method: "POST",
      path: "/orcid-auth/callback",
      handler: "orcid-auth.callback",
      config: {
        description: "Handle ORCID OAuth callback — exchange code for profile",
      },
    },
    {
      method: "POST",
      path: "/orcid-auth/validate",
      handler: "orcid-auth.validate",
      config: {
        description: "Validate an ORCID iD via public API (legacy)",
      },
    },
  ],
};
