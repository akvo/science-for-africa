/**
 * Custom institution routes
 */

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/institutions/approve-member/:id',
      handler: 'institution.approveMember',
      config: {
        policies: [], // We'll handle security in the controller
      },
    },
  ],
};
