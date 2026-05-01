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
    {
      method: "POST",
      path: "/collaboration-invites/:id/decline",
      handler: "collaboration-invite.decline",
      config: {
        auth: false,
      },
    },
  ],
};
