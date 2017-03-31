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
// var schema = require('./model/schemas').schema;

// assignes the app to listen on default port of 5000, if not env PORT value
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// parse application/x-www-form-urlencoded
var urlParser = (bodyParser.urlencoded({ extended: false }))
// parse application/json
var jsonParser = (bodyParser.json())


/*
Blank test method for the API
Just returns a simple string when run
PATH: /test
*/
app.all('/test', function(request, response) {
	var user_ip = request.ip.split(':').pop();
	winston.info("Test requested from client at " + user_ip)
	response.send('Test server running')
})


/*
Test method for getting dummy data for a particular user
Populates all specific fields with randomized data
Used for development purposes only
*/
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

/*
Test method for logging in
Dummy method returns a new UUIDv1 token
Used for development purposes only
*/
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


/*
Actual getUser command
Authenticates the accessToken against the apiKey and user ID
Not pulling data yet, but will do actual authenticator checks
For debugging, use GET /test/user/:uID instead
*/
app.get('/user/:uID', jsonParser, function(req, res) {
	winston.info("Attempting to get data from " + req.params.uID)
	// send a 400 error if there isn't any user data uploaded, like auth key
	if (!req.body.accessToken){
		winston.debug("Request did not have an Access Token included")
		return res.status(400).json({"error" : "No AT"});
	}
	if (!req.body.apiKey){
		winston.debug("Request did not have an API Key included")
		return res.status(400).json({"error" : "No API Key"});
	}

	// authenticate the accessToken to see if it matches
	auth.checkAccessToken(req.body.accessToken, req.params.uID, mongodb_url, function(successful){
		if (successful){
			// authenticator checks out just fine
			res.setHeader('Content-Type', 'application/json');
			res.status(201).json({"uID" : req.params.uID, "username" : "Testy"})
			return;
		}
		else{
			// not authenticated -- no userID + accessToken + API Key combination
			res.status(401).send("Access Token denied");
		}
	})
})


/*
POST /login/:uID will generate an access Token
Currently iffy, since PIN's probably won't be Used
*/
app.post('/login/:uID', jsonParser, function(req, res) {
	// check supplied credentials
	if (!req.body.PIN) return res.sendStatus(400);
	if (!req.body.apiKey) return res.sendStatus(400);

	// check that the API Key is legit
	// checkAPIKey(req.body.apiKey);

	// check that the PIN is legit and corresponds to the user ID
	// tryPIN(req.params.uID, req.body.PIN);

	// create an accessToken to register to the account
	// note that this also adds the AT to the database
	auth.AccessToken(req.body.apiKey, req.params.uID, mongodb_url, function(accessToken){
		// return the newly created access token
		res.setHeader('Content-Type', 'application/json');
		res.status(201).json({"uID" : req.params.uID, "accessToken" : accessToken})
	})
})


/*
404 Error listener so that no request will go unanswered without being logged
*/
app.all('/*', function(request, response) {
	winston.debug("Unknown request: " + request.method + " "+ request.path)
	response.status(404).send('404 Error: path ' + request.path + ' is not a valid path\n')
})


// have the app start listening!
app.listen(app.get('port'), function() {
  winston.info("Node app is running at localhost:" + app.get('port'))
})
