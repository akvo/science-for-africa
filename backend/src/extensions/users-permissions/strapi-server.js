/* global strapi */
"use strict";

module.exports = (plugin) => {
  // Extend User Controller
  const originalUserController = plugin.controllers.user;

  plugin.controllers.user = {
    ...originalUserController,

    /**
     * Follow a user
     * POST /api/users/:id/follow
     */
    async follow(ctx) {
      const { id: targetUserId } = ctx.params;
      const { id: currentUserId } = ctx.state.user;

      if (targetUserId == currentUserId) {
        return ctx.badRequest("You cannot follow yourself");
      }

      try {
        // Fetch target user with followers to check if already following
        const targetUser = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: targetUserId },
            populate: ["followers"],
          });

        if (!targetUser) {
          return ctx.notFound("User not found");
        }

        const isFollowing = targetUser.followers?.some(
          (f) => f.id === currentUserId,
        );

        if (isFollowing) {
          return ctx.badRequest("Already following this user");
        }

        // Update followers relation and subscriberCount
        const updatedCount = (targetUser.subscriberCount || 0) + 1;

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          targetUserId,
          {
            data: {
              followers: {
                connect: [currentUserId],
              },
              subscriberCount: updatedCount,
            },
          },
        );

        return ctx.send({
          success: true,
          subscriberCount: updatedCount,
          following: true,
        });
      } catch (error) {
        strapi.log.error("Follow User Error: " + error.message);
        return ctx.internalServerError(error.message);
      }
    },

    /**
     * Unfollow a user
     * POST /api/users/:id/unfollow
     */
    async unfollow(ctx) {
      const { id: targetUserId } = ctx.params;
      const { id: currentUserId } = ctx.state.user;

      try {
        // Fetch target user with followers to check if following
        const targetUser = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: targetUserId },
            populate: ["followers"],
          });

        if (!targetUser) {
          return ctx.notFound("User not found");
        }

        const isFollowing = targetUser.followers?.some(
          (f) => f.id === currentUserId,
        );

        if (!isFollowing) {
          return ctx.badRequest("You are not following this user");
        }

        // Update followers relation and subscriberCount
        const updatedCount = Math.max(0, (targetUser.subscriberCount || 0) - 1);

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          targetUserId,
          {
            data: {
              followers: {
                disconnect: [currentUserId],
              },
              subscriberCount: updatedCount,
            },
          },
        );

        return ctx.send({
          success: true,
          subscriberCount: updatedCount,
          following: false,
        });
      } catch (error) {
        strapi.log.error("Unfollow User Error: " + error.message);
        return ctx.internalServerError(error.message);
      }
    },
  };

  // Add Custom Routes
  plugin.routes["content-api"].routes.push(
    {
      method: "POST",
      path: "/users/:id/follow",
      handler: "user.follow",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/users/:id/unfollow",
      handler: "user.unfollow",
      config: {
        prefix: "",
      },
    },
  );

  return plugin;
};
