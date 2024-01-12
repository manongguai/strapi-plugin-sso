module.exports = [
  {
    method: 'GET',
    path: '/providers',
    handler: 'sso.getProviders',
    config: {
      policies: [],
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/connect/:provider',
    handler: 'sso.providerLogin',
    config: {
      policies: [],
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/connect/:provider',
    handler: 'sso.providerLogin',
    config: {
      policies: [],
      auth: false
    }
  }
];
