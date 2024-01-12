'use strict';

module.exports = {
  default: {
    AZUREAD_OAUTH_REDIRECT_URI:  '',
    AZUREAD_TENANT_ID: '',
    AZUREAD_OAUTH_CLIENT_ID: '', // [Application (client) ID]
    AZUREAD_OAUTH_CLIENT_SECRET: '',
    AZUREAD_SCOPE: ["user:email"],
    ALLOW_PROVIDERS:[]
  },
  validator() {},
};
