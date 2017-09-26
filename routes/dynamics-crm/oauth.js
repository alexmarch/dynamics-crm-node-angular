var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var adal = require('adal-node');


var AuthenticationContext = adal.AuthenticationContext;
var tenant       = process.env.tenant;
var authorityUrl = process.env.authorityUrl;
var resource     = process.env.resource;
var clientId     = process.env.clientId;
var username     = process.env.username;
var password     = process.env.password;
var secret       = process.env.secret;
var redirectUri  = process.env.redirectUri;
var authenticationContext = new AuthenticationContext(authorityUrl);

/**
 * Generate authentification link
 * 
 * @param {any} state 
 * @returns 
 */
function createAuthorizationUrl(state) {
  return `https://login.microsoftonline.com/${tenant}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&resource=${resource}`;
}

/**
 * Logging Adal
 * 
 */
function turnOnLogging() {
  var log = adal.Logging;
  log.setLoggingOptions(
  {
    level : log.LOGGING_LEVEL.VERBOSE,
    log : function(level, message, error) {
      console.log(message);
      if (error) {
        console.log(error);
      }
    }
  });
}

/**
 * Render login button
 */
router.get('/login', function(req, res, next){
  res.render('dynamics-crm/login', { title: 'Dynamics CRM login' });
});

/**
 * Auth redirect link
 */
router.get('/auth', function(req, res, next){
  crypto.randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    var authorizationUrl = createAuthorizationUrl(token);
    res.cookie('authstate', token);
    res.redirect(authorizationUrl);
  });
});

/**
 * Get Access token from API
 */
router.get('/getAToken', function(req, res){
  authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, clientId, secret, function(err, authResponse){
    if ( !err ) {
      authenticationContext.acquireTokenWithRefreshToken(authResponse.refreshToken, clientId, secret, resource, function(err, refreshResponse){
        if ( !err ) {
          res.cookie('accessToken', refreshResponse.accessToken);
          res.cookie('expiresOn', refreshResponse.expiresOn);
          res.cookie('expiresIn', refreshResponse.expiresIn);
          res.redirect('dashboard');
        } else {
          res.status(401).send(JSON.stringify(err));
        }
      });
    } else {
      res.status(401).send(JSON.stringify(err));
    }
  });
});
module.exports = router;