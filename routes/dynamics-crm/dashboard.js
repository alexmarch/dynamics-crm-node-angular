var express = require('express');
var router = express.Router();
var DynamicsWebApi = require('dynamics-web-api');

var dynamicsWebApi = new DynamicsWebApi({ 
  webApiVersion: "8.2",
  webApiUrl: process.env.apiUrl
});

router.get('/dashboard', function(req, res, next){
  res.render('dynamics-crm/dashboard', { title: 'Dynamics CRM Dashboard' });
});
router.get('/dashboard/entity/:entity', function(req, res){
  var request = {
    collection: req.params.entity,
    maxPageSize: 5,
    token: req.cookies.accessToken,
    select: req.body.keys
  }
  dynamicsWebApi.retrieveRequest(request)
  .then(function(result){
    res.json({ data: result.value });
  })
  .catch(function(err){
    res.status(401).json({error: err});
  })
});
router.get('/dashboard/view/:entity', function(req, res, next){
    var request = {
      collection: req.params.entity,
      maxPageSize: req.query.maxPage || 1,
      token: req.cookies.accessToken
    }
    
    dynamicsWebApi.retrieveRequest(request)
      .then(function(result){
            return res.render('dynamics-crm/entity', {
              title: req.params.entity, 
              props: Object.keys(result.value[0]) 
            });
            // switch(req.params.entity) {
            //   case 'accounts':
            //     res.render('dynamics-crm/entities/accounts', { value: result.value });
            //     break;
            //   case 'appointments':
            //     res.render('dynamics-crm/entities/appointments', { value: result.value });
            //     break;
            //   case 'campaigns':
            //     res.render('dynamics-crm/entities/campaigns', { value: result.value });
            //     break;
            //   case 'cases':
            //     res.render('dynamics-crm/entities/cases', { value: result.value });
            //     break;
            //   case 'contacts':
            //     res.render('dynamics-crm/entities/contacts', { value: result.value });
            //     break;
            //   case 'email_messages':
            //     res.render('dynamics-crm/entities/email_messages', { value: result.value });
            //     break;
            //   case 'leads':
            //     res.render('dynamics-crm/entities/leads', { value: result.value });
            //     break;
            //   case 'letters':
            //     res.render('dynamics-crm/entities/letters', { value: result.value });
            //     break;
            //   case 'opportunities':
            //     res.render('dynamics-crm/entities/opportunities', { value: result.value });
            //     break;
            //   case 'social_profiles':
            //     res.render('dynamics-crm/entities/social_profiles', { value: result.value });
            //     break;
            //   case 'tasks':
            //     res.render('dynamics-crm/entities/tasks', { value: result.value });
            //     break;
            //   case 'users':
            //     res.render('dynamics-crm/entities/users', { value: result.value });
            //     break;
            // }
            // res.send(JSON.stringify(result.value.length));
            
      })
      .catch(function(error){
            res.status(401).json({ error: error});
      });
});

module.exports = router;