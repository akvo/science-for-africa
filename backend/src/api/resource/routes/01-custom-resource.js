module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/resources/:id/moderate',
      handler: 'api::resource.resource.moderate',
      config: {
        auth: {
           // Handled in controller but requires authentication
        },
        policies: [],
      },
    },
  ],
};
