const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::institution.institution', ({ strapi }) => ({
  async approveMember(ctx) {
    const { id } = ctx.params; // Member user ID
    const { user: requester } = ctx.state;
    const { affiliationStatus } = ctx.request.body;

    if (!requester) {
      return ctx.unauthorized();
    }

    if (!affiliationStatus) {
      return ctx.badRequest('affiliationStatus is required');
    }

    // 1. Fetch requester with role and institution
    const requesterFull = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: requester.id },
      populate: ['role', 'institution'],
    });

    const isInstAdmin = requesterFull.role && requesterFull.role.name === 'Institution Admin';

    if (!isInstAdmin) {
      return ctx.forbidden('Only Institution Admins can approve members');
    }

    // 2. Fetch target user
    const targetUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id },
      populate: ['institution'],
    });

    if (!targetUser) {
      return ctx.notFound('User not found');
    }

    // 3. Check if they belong to the same institution
    const sameInst = requesterFull.institution && targetUser.institution && requesterFull.institution.id === targetUser.institution.id;

    if (!sameInst) {
      return ctx.forbidden('User does not belong to your institution');
    }

    // 4. Update status
    const updatedUser = await strapi.query('plugin::users-permissions.user').update({
      where: { id },
      data: { affiliationStatus },
    });

    return ctx.send(updatedUser);
  },
}));
