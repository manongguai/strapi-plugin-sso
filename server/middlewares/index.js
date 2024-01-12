"use strict";
const passport = require("koa-passport");
const strategys = require('../strategys')

const passportInitialize = async (strapi) => {
  const allowProviders = strapi.config.get("plugin.sso").ALLOW_PROVIDERS

  for (let i = 0; i < allowProviders.length; i++) {
    const strategyTemp = await strategys[allowProviders[i]].createStrategy(strapi);
    passport.use(strategyTemp);
  }

   const passportMiddleware = passport.initialize();
   strapi.server.use(passportMiddleware);
};

module.exports = {
  passportInitialize
}
