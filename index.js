var express = require('express')
var app = express()
var bodyParser = require ("body-parser")
const uuidV1 = require('uuid/v1')
var MongoClient = require('mongodb').MongoClient
// Connection url
const mongodb_url = 'mongodb://localhost:27017/kiosk';
var winston = require('winston')
winston.add(winston.transports.File, {filename : "/var/log/kiosk/api.log"})
winston.level = "debug"

// other units in package
var auth = require('./controller/auth')
var test_gen = require('./controller/test_gen')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// parse application/x-www-form-urlencoded
var urlParser = (bodyParser.urlencoded({ extended: false }))
// parse application/json
var jsonParser = (bodyParser.json())

app.get('/', function(request, response) {
	winston.info("Connection accepted from " + request.ip)
  response.send('Hello, user! Your IP address is ' + request.ip)
})

app.all('/test', function(request, response) {
	var user_ip = request.ip.split(':').pop();
	winston.info("Test requested from client at " + user_ip)
	response.send('Test server running, ' + request.ip)
})

app.all('/test/apiKey', jsonParser, function (req, res) {
	var apiKey = req.body.apiKey;
	var ipAddr = req.ip;
	auth.checkAPI(apiKey, ipAddr, mongodb_url, function(successful){
		if (result){
			winston.debug("Test auth successful")
			res.send("Test auth successful")
		}
		else{
			winston.debug("Test auth failed")
			res.status(401).send("Test auth failed")
		}
	})
})

app.all('/test/accessToken', jsonParser, function (req, res) {
	var accessToken = req.body.accessToken;
	var apiKey = req.body.apiKey;
	var ipAddr = req.ip;
	if (!accessToken || !apiKey || !ipAddr){
		res.status(400).send("Missing accessToken, apiKey, or ipAddr")
		winston.debug("Test accessToken is missing body pieces")
		return;
	}
	auth.checkAccessToken(accessToken, req.params.uID, mongodb_url, function(successful){
		if (result){
			winston.debug("Test auth successful")
			res.send("Test auth successful")
		}
		else{
			winston.debug("Test auth failed")
			res.status(401).send("Test auth failed")
		}
	})
})

app.get('/test/user/:uID', jsonParser, function(req, res) {
	winston.info("Test data grab for user " + req.params.uID)
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
})

app.post('/test/login/:uID', jsonParser, function(req, res){
	winston.info("Test login for user " + req.params.uID);
	var accessToken = uuidV1();
	res.status(201).json(
		{
		  "uID" : req.params.uID ,
		  "accessToken" : accessToken
		}
	)
})


app.get('/user/:uID', jsonParser, function(req, res) {
	winston.info("Attempting to get data from " + req.params.uID)
	// send a 400 error if there isn't any user data uploaded, like auth key
	if (!req.body.accessToken){
		winston.debug("Request did not have an Access Token included")
		return res.status(400).json({"error" : "No AT"});
	}

	/*
	if (!req.body.apiKey) return res.sendStatus(400);

	*/
	// authenticate the accessToken to see if it matches
	auth.checkAccessToken(req.body.accessToken, req.params.uID, mongodb_url, function(successful){
		if (successful){
			// authenticator checks out just fine
			res.setHeader('Content-Type', 'application/json');
			res.status(201).json({"uID" : req.params.uID, "username" : "Testy"})
			return;
		}
		else{
			// not authenticated
			res.status(401).send("Access Token denied");
		}
	})
})

app.post('/login/:uID', jsonParser, function(req, res) {
	// check supplied credentials
	if (!req.body.PIN) return res.sendStatus(400);
	if (!req.body.apiKey) return res.sendStatus(400);

	// check that the API Key is legit
	// checkAPIKey(req.body.apiKey);

	// check that the PIN is legit and corresponds to the user ID
	// tryPIN(req.params.uID, req.body.PIN);

	// create an accessToken to register to the account
	var accessToken = uuidV1();
	// create access token reference in database


	// Connect using MongoClient
	MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of access tokens
		var col = db.collection('access_token');
		// add the new access token to the database
		col.insertOne({"accessToken" : accessToken, "uID" : req.params.uID, "created" : new Date()})
	});

	// return the newly created access token
	res.setHeader('Content-Type', 'application/json');
	res.status(201).json({"uID" : req.params.uID, "accessToken" : accessToken})

})

app.all('/*', function(request, response) {
	winston.debug("Unknown request: " + request.method + " "+ request.path)
	response.status(404).send('404 Error: path ' + request.path + ' is not a valid path\n')
})

app.listen(app.get('port'), function() {
  winston.info("Node app is running at localhost:" + app.get('port'))
})
