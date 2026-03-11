module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/mentorship-requests/:id/respond',
      handler: 'api::mentorship-request.mentorship-request.respond',
      config: {
        auth: {
          // You must be authenticated to hit this, but any role is fine as long as they are the mentor.
        },
        policies: [],
      },
    },
  ],
};
