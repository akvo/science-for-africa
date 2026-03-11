module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/institutions/approve-member/:id',
      handler: 'api::institution.institution.approveMember',
      config: {
        auth: {
          scope: ['api::institution.institution.approveMember']
        },
        policies: [],
      },
    },
  ],
};
