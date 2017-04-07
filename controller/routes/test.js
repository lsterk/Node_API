var express = require('express')
var app = express()

var bodyParser = require ("body-parser")
var jsonParser = (bodyParser.json())
const uuidV1 = require('uuid/v1')
var test_gen = require('../test_gen')
var winston = require('../../index').logger;

/*
app is an Express instance that is used to host routes
*/

app.all('/', function(request, response) {
  var user_ip = request.ip.split(':').pop();
  winston.info("Test requested from client at " + user_ip)
  response.send('Test server running')
})


/*
Test method for getting dummy data for a particular user
Populates all specific fields with randomized data
Used for development purposes only
*/
app.get('/user/:uID', jsonParser, function(req, res) {
  console.log("Test data grab for user " + req.params.uID)
  res.status(200).json(
    {
      "uID" : req.params.uID,
      "uName" : "ljs34",
      "name" : "Sterk, Landon",
      "mealPlan" : test_gen.randomMealPlan(),
      "bonusBucks" : test_gen.randomBonusBucks(),
      "isLiveData" : false,
      "updated" : test_gen.randomDate(300)
    });
  });

/*
Test method for logging in
Dummy method returns a new UUIDv1 token
Used for development purposes only
*/
app.post('/login/:uID', jsonParser, function(req, res){
  console.log("Test login for user " + req.params.uID);
  var accessToken = uuidV1();
  res.status(201).json(
    {
      "uID" : req.params.uID ,
      "accessToken" : accessToken
    }
  )
})

// export the app so it can be mounted at /test
module.exports = app;
