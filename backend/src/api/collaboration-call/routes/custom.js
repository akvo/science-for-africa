"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/collaboration-calls/create-with-invites",
      handler: "collaboration-call.createWithInvites",
      config: {
        description: "Create a collaboration call with invites and send emails",
      },
    },
  ],
};
