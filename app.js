// var crypto = require('crypto');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('dotenv').config();

// Routers
var index = require('./routes/index');
var users = require('./routes/users');
var dynamicsOAuth = require('./routes/dynamics-crm/oauth');
var dynamicsDashboard = require('./routes/dynamics-crm/dashboard');

// var DynamicsWebApi = require('dynamics-web-api');

// var adal = require('adal-node');
// var AuthenticationContext = adal.AuthenticationContext;

var WebApiClient = require('xrm-webapi-client');
var Dynamics = require("dynamicscrm-api");
var request = require('request');
var authenticationContext;


var authorityUrl = process.env.authorityUrl;
var resource = process.env.resource;
var clientId = process.env.clientId;
var username = process.env.username;
var password = process.env.password;
var secret = process.env.secret;
var accessToken = '';
// var adalContext = new AuthenticationContext(authorityUrl);

var options = {};

options.id = clientId;	
options.EntityName = 'lead';
options.ColumnSet = ['firstname'];

// authenticationContext = new AuthenticationContext(authorityUrl);

var authObj = require('./common/dynamics-crm-auth').Create({
  tenant: "formtitan.onmicrosoft.com", 
  clientId: process.env.clientId, 
  secret: process.env.secret, 
  redirectUri:"http://localhost:3002/getAToken" 
});

var tenant = 'dcdb863a-bab3-41ff-90d9-881e52eeb81a';
var authorityHostUrl = process.env.authorityUrl;
// var clientId = process.env.clientId;
var clientSecret = process.env.secret

function acquireToken(dynamicsWebApiCallback){
  function adalCallback(error, token) {
      if (!error) {
          console.log(token);
          dynamicsWebApiCallback(token);
      } else {
        console.log(error);
      }
  }
  authenticationContext.acquireTokenWithRefreshToken(refreshToken, clientId, secret, resource, adalCallback); 
  // adalContext.acquireTokenWithClientCredentials(resource, clientId, secret, adalCallback);
}

function sendRequest(token){

  var headers = {
    'OData-Version': '4.0',
    'Cache-Control': 'no-cache',
    'Accept': 'application/json',
    'Host': 'formtitan.api.crm4.dynamics.com',
    'Authorization': `Bearer ${token}`
  };
  
  var options = {
    method: 'GET',
    url: 'https://formtitan.api.crm4.dynamics.com/api/data/v8.0/contacts', 
    headers: headers 
  } 

  
  request(options, function(error, response, body) {
        if(error) {
           console.log("Error", error, "Response", response);
        }
        else {
            console.log(body);
        }
    });
}


var app = express();
var router = express.Router();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/dynamics-crm', dynamicsOAuth.use(dynamicsDashboard));

app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
