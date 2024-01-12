"use strict";

const compose = require("koa-compose");
const { pick } = require("lodash/fp");
const { middlewares } = require("./authentication/index");
const { ValidationError } = require('@strapi/utils').errors;

const providerAuthenticationFlow = compose([
  middlewares.authenticate,
  middlewares.redirectWithAuth,
]);

const toProviderDTO = pick(["uid", "displayName", "icon"]);

module.exports = {
  providerLogin(ctx, next) {
    const {
      params: { provider: providerName },
    } = ctx;
    const allowProviders = strapi.config.get("plugin.sso").ALLOW_PROVIDERS
    if (!allowProviders.includes(providerName)) {
      throw new ValidationError(`Invalid provider supplied: ${providerName}`);
    }
    return providerAuthenticationFlow(ctx, next);
  },
  getProviders(ctx, next){
    const allowProviders = strapi.config.get("plugin.sso").ALLOW_PROVIDERS || []
    ctx.body = allowProviders
  }
};
