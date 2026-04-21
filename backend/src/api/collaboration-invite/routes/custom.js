"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/collaboration-invites/:id/accept",
      handler: "collaboration-invite.accept",
      config: {
        auth: false,
      },
    },
  ],
};
