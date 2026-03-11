const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::institution.institution', ({ strapi }) => ({
  async approveMember(ctx) {
    const { id: documentId } = ctx.params; // Member documentId
    const { user: requester } = ctx.state;
    const { affiliationStatus } = ctx.request.body;

    if (!requester) {
      return ctx.unauthorized();
    }

    if (!affiliationStatus) {
      return ctx.badRequest('affiliationStatus is required');
    }

    // 1. Fetch requester with role and institution
    const requesterFull = await strapi.documents('plugin::users-permissions.user').findOne({
      documentId: requester.documentId,
      populate: ['role', 'institution'],
    });

    if (!requesterFull) {
       return ctx.unauthorized();
    }

    const isInstAdmin = requesterFull.role && requesterFull.role.name === 'Institution Admin';

    if (!isInstAdmin) {
      return ctx.forbidden('Only Institution Admins can approve members');
    }

    // 2. Fetch target user
    const targetUser = await strapi.documents('plugin::users-permissions.user').findOne({
      documentId,
      populate: ['institution'],
    });

    if (!targetUser) {
      return ctx.notFound('User not found');
    }

    // 3. Check if they belong to the same institution
    const sameInst = requesterFull.institution && targetUser.institution && requesterFull.institution.documentId === targetUser.institution.documentId;

    if (!sameInst) {
      return ctx.forbidden('User does not belong to your institution');
    }

    // 4. Update status
    const updatedUser = await strapi.documents('plugin::users-permissions.user').update({
      documentId,
      data: { affiliationStatus },
      status: 'published',
    });

    return ctx.send(updatedUser);
  },
}));
