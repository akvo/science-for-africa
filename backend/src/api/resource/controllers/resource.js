const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::resource.resource', ({ strapi }) => ({
  async moderate(ctx) {
    const { id } = ctx.params;
    const { reviewStatus, rejectionNotes } = ctx.request.body;
    const userRole = ctx.state.user?.role?.name;

    // Check Authorization: Only specific roles can moderate
    const allowedRoles = ['Platform Admin', 'Community Admin', 'Moderator'];
    
    // In a real production system we'd verify the Community Admin actually admins the specific community
    // the resource belongs to. For MVP we check if they have the Admin/Moderator role globally.
    if (!allowedRoles.includes(userRole)) {
      return ctx.forbidden('You are not authorized to moderate resources.');
    }

    if (!['Published', 'Rejected'].includes(reviewStatus)) {
      return ctx.badRequest('Invalid status. Must be Published or Rejected.');
    }

    if (reviewStatus === 'Rejected' && !rejectionNotes) {
      return ctx.badRequest('Rejection notes are required when rejecting a resource.');
    }

    try {
      const resource = await strapi.documents('api::resource.resource').findOne({
        documentId: id
      });

      if (!resource) {
        return ctx.notFound('Resource not found');
      }

      // If they are publishing it, we also change the core Strapi `status` to published
      // so it becomes visible to the public API
      const nativeStatus = reviewStatus === 'Published' ? 'published' : undefined;

      const updateData = {
        reviewStatus,
      };

      if (reviewStatus === 'Rejected') {
        updateData.rejectionNotes = rejectionNotes;
      }

      const updatedResource = await strapi.documents('api::resource.resource').update({
        documentId: id,
        data: updateData,
        ...(nativeStatus && { status: nativeStatus })
      });

      return ctx.send(updatedResource);
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}));
