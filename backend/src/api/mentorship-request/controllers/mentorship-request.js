const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::mentorship-request.mentorship-request', ({ strapi }) => ({
  async respond(ctx) {
    const { id } = ctx.params;
    const { status } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to respond to a request.');
    }

    if (!['Accepted', 'Declined'].includes(status)) {
      return ctx.badRequest('Invalid status. Must be Accepted or Declined.');
    }

    try {
      // Find the mentorship request and populate mentor to verify identity
      const request = await strapi.documents('api::mentorship-request.mentorship-request').findOne({
        documentId: id,
        populate: ['mentor']
      });

      if (!request) {
        return ctx.notFound('Mentorship request not found');
      }

      // Check if the current user is the assigned mentor
      if (!request.mentor || request.mentor.documentId !== user.documentId) {
        return ctx.forbidden('You are not authorized to respond to this request.');
      }

      // Update the status
      const updatedRequest = await strapi.documents('api::mentorship-request.mentorship-request').update({
        documentId: id,
        data: {
          status
        }
      });

      return ctx.send(updatedRequest);
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}));
