"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/communities/:id/join",
      handler: "community.join",
    },
    {
      method: "POST",
      path: "/communities/:id/leave",
      handler: "community.leave",
    },
  ],
};
