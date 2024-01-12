'use strict';

const passport = require('koa-passport');

const utils = require('./utils');

const AUTHOR_CODE = 'strapi-author';

const defaultConnectionError = () => new Error('Invalid connection payload');

const authenticate = async (ctx, next) => {
  const {
    params: { provider },
  } = ctx;
  const redirectUrls = utils.getPrefixedRedirectUrls();

  return passport.authenticate(provider, null, async (error, profile) => {
    if (error || !profile || !profile.email) {
      if (error) {
        strapi.log.error(error);
      }
      strapi.eventHub.emit('admin.auth.error', {
        error: error || defaultConnectionError(),
        provider,
      });

      return ctx.redirect(redirectUrls.error);
    }
    // const user = await strapi.admin.services.user.findOne({ email: profile.email });
    const user = await strapi.service(`admin::user`).findOneByEmail(profile.email);
    const scenario = user ? existingUserScenario : nonExistingUserScenario;

    return scenario(ctx, next)(user || profile, provider);
  })(ctx, next);
};

const existingUserScenario = (ctx, next) => async (user, provider) => {
  const redirectUrls = utils.getPrefixedRedirectUrls();

  if (!user.isActive) {
    strapi.eventHub.emit('admin.auth.error', {
      error: new Error(`Deactivated user tried to login (${user.id})`),
      provider,
    });
    return ctx.redirect(redirectUrls.error);
  }

  ctx.state.user = user;
  return next();
};

const nonExistingUserScenario = (ctx, next) => async (profile, provider) => {
  const { email, firstname, lastname, username } = profile;
  const redirectUrls = utils.getPrefixedRedirectUrls();

  const roleTemp = await strapi.service(`admin::role`).findOne({ code: AUTHOR_CODE });
  const providers = { autoRegister: true, defaultRole: roleTemp.id };

  // We need at least the username or the firstname/lastname combination to register a new user
  const isMissingRegisterFields = !username && (!firstname || !lastname);

  if (!providers.autoRegister || !providers.defaultRole || isMissingRegisterFields) {
    strapi.eventHub.emit('admin.auth.error', { error: defaultConnectionError(), provider });
    return ctx.redirect(redirectUrls.error);
  }

  const defaultRole = await strapi.service(`admin::role`).findOne({ id: providers.defaultRole });

  // If the default role has been misconfigured, redirect with an error
  if (!defaultRole) {
    strapi.eventHub.emit('admin.auth.error', { error: defaultConnectionError(), provider });
    return ctx.redirect(redirectUrls.error);
  }

  // Register a new user with the information given by the provider and login with it
  ctx.state.user = await strapi.service(`admin::user`).create({
    email,
    username,
    firstname,
    lastname,
    roles: [defaultRole.id],
    isActive: true,
    registrationToken: null,
  });

  strapi.eventHub.emit('admin.auth.autoRegistration', {
    user: ctx.state.user,
    provider,
  });

  return next();
};

const redirectWithAuth = (ctx) => {
  const {
    params: { provider },
  } = ctx;
  const redirectUrls = utils.getPrefixedRedirectUrls();
  const domain = strapi.config.get('admin.auth.domain');
  const { user } = ctx.state;

  const jwt = strapi.service(`admin::token`).createJwtToken(user);

  const isProduction = strapi.config.get('environment') === 'production';

  const cookiesOptions = { httpOnly: false, secure: isProduction, overwrite: true, domain };

  const sanitizedUser = strapi.service(`admin::user`).sanitizeUser(user);
  strapi.eventHub.emit('admin.auth.success', { user: user, provider });

  ctx.cookies.set('jwtToken', jwt, cookiesOptions);
  ctx.redirect(redirectUrls.success);
};

module.exports = {
  authenticate,
  redirectWithAuth,
};
