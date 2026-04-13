"use strict";

/**
 * auth routes
 */

module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/auth/me",
      handler: "auth.updateMe",
      config: {
        description: "Update current user profile",
        prefix: "",
      },
    },
  ],
};
