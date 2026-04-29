"use strict";

module.exports = {
  async beforeCreate(event) {
    const { data, state } = event.params;
    const user = state?.user;

    // Automatically set uploadedBy if a user is authenticated and it's not already set
    if (user && !data.uploadedBy) {
      // In Strapi v5 Document Service, we use the documentId for relations
      data.uploadedBy = user.documentId || user.id;
    }

    // Set default status to pending if not set
    if (!data.status) {
      data.status = "pending";
    }
  },
};
