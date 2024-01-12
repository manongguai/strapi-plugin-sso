
const AzureAdOAuth2Strategy = require('../utils/azureStrategy');

const jwt = require('jsonwebtoken');


const createStrategy = async (strapi) => {
  const AZUREAD_OAUTH_REDIRECT_URI = strapi.config.get("plugin.sso").AZUREAD_OAUTH_REDIRECT_URI
  const AZUREAD_TENANT_ID = strapi.config.get("plugin.sso").AZUREAD_TENANT_ID
  const AZUREAD_OAUTH_CLIENT_ID = strapi.config.get("plugin.sso").AZUREAD_OAUTH_CLIENT_ID
  const AZUREAD_SCOPE = strapi.config.get("plugin.sso").AZUREAD_SCOPE
  const AZUREAD_OAUTH_CLIENT_SECRET = strapi.config.get("plugin.sso").AZUREAD_OAUTH_CLIENT_SECRET

  let pemTemp
  if(typeof AZUREAD_OAUTH_CLIENT_SECRET === 'function'){
    pemTemp = await AZUREAD_OAUTH_CLIENT_SECRET()
  }else{
    pemTemp = AZUREAD_OAUTH_CLIENT_SECRET
  }
  return new AzureAdOAuth2Strategy(
    {
      clientID: AZUREAD_OAUTH_CLIENT_ID,
      pem: pemTemp,
      scope: AZUREAD_SCOPE,
      tenant: AZUREAD_TENANT_ID,
      callbackURL: AZUREAD_OAUTH_REDIRECT_URI,
    },
    (accessToken, refreshToken, params, profile, done) => {
      var waadProfile = jwt.decode(params.id_token, "", true);
      done(null, {
        email: waadProfile.upn.toLocaleLowerCase(),
        username: waadProfile.name || waadProfile.upn,
        firstname: waadProfile.given_name,
        lastname: waadProfile.family_name,
      });
    }
  );
}

module.exports = {
  createStrategy
}
