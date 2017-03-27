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

app.all('/test/accessToken', sonParser, function (req, res) {
	var accessToken = req.body.accessToken;
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

app.get('/user/:uID', jsonParser, function(req, res) {
	winston.info("Attempting to get data from " + req.params.uID)
	// send a 400 error if there isn't any user data uploaded, like auth key
	if (!req.body.accessToken){
		winston.debug("Request did not have an Access Token included")
		return res.status(400).json({"body" : JSON.stringify(req.body), "error" : "No AT"});
	}

	/*
	if (!req.body.apiKey) return res.sendStatus(400);

	*/
	// authenticate the accessToken to see if it matches
	MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of access tokens
		var col = db.collection('access_token');
		// check to see if the access token exists
		col.findOne({"accessToken" : req.body.accessToken, "uID" : req.params.uID}, function (err, doc){
			if (!doc) {
				winston.info("Unauthorized user attempting to access user " + req.params.uID);
				return res.sendStatus(401);
			}
			if (err) winston.error("Error in checking token:" + err);
		})
	});
	res.setHeader('Content-Type', 'application/json');
	res.status(201).json({"uID" : req.params.uID, "username" : "Testy"})
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
