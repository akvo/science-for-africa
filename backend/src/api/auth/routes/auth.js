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
    {
      method: "GET",
      path: "/auth/users",
      handler: "auth.findUsers",
      config: {
        description: "List users for mentor assignment",
        prefix: "",
      },
    },
  ],
};
