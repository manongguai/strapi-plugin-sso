
const util = require('util');
const OAuth2Strategy = require('passport-azure-ad-oauth2');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

function Strategy (options, verify) {
  options = options || {};
  OAuth2Strategy.call(this, options, verify);
  this.clientAssertionType = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
  this.pem = options.pem;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.tokenParams = function (options) {

  var params = params || {};
  params['client_assertion_type'] = this.clientAssertionType;

  const baseString = this.pem.match(/-----BEGIN CERTIFICATE-----\s*([\s\S]+?)\s*-----END CERTIFICATE-----/i);
  const rawCert = Buffer.from(baseString[1], "base64");
  const fingerprint = crypto.createHash("sha1").update(rawCert).digest("base64");
  // const fingerprintHex = crypto.createHash("sha1").update(rawCert).digest("hex");
  // console.log(`${(new Date()).toISOString()}: passport-azure-ad-ouath2-clientcert::Using certificate thumbprint ${fingerprintHex}`);

  var additionalHeaders = {
      'alg': 'RS256',
      'typ': 'JWT',
      'x5t': fingerprint
  };

  const certJwt = {
      'aud': this._oauth2._accessTokenUrl,
      'iss': this._oauth2._clientId,
      'sub': this._oauth2._clientId,
      'jti': '' + Math.random(),
      'nbf': Math.floor(Date.now() / 1000) - 10*60,
      'exp': Math.floor(Date.now() / 1000) + 10*60
  };

  // Sign the JWT with the PEM key
  const jwtToken = jwt.sign(certJwt, this.pem, { algorithm: 'RS256', header: additionalHeaders });
  params['client_assertion'] = jwtToken;
  return params;
}

/**
 * Return extra Azure AD-specific parameters to be included in the authorization
 * request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
 Strategy.prototype.authorizationParams = function (options) {
  options.prompt = 'select_account';
  return options;
};

module.exports = Strategy;
