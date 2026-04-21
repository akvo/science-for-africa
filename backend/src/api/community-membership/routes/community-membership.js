"use strict";

/**
 * community-membership router
 */

module.exports = {
  routes: [
    {
      method: "DELETE",
      path: "/communities/:id/leave",
      handler: "community-membership.leave",
      config: {
        description: "Leave a community",
      },
    },
    // Include core routes
    {
      method: "GET",
      path: "/community-memberships",
      handler: "community-membership.find",
    },
    {
      method: "GET",
      path: "/community-memberships/:id",
      handler: "community-membership.findOne",
    },
    {
      method: "POST",
      path: "/community-memberships",
      handler: "community-membership.create",
    },
    {
      method: "PUT",
      path: "/community-memberships/:id",
      handler: "community-membership.update",
    },
    {
      method: "DELETE",
      path: "/community-memberships/:id",
      handler: "community-membership.delete",
    },
  ],
};
