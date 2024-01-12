"use strict";
const middlewares = require("./middlewares");
module.exports = async ({ strapi }) => {
  middlewares.passportInitialize(strapi);
};
