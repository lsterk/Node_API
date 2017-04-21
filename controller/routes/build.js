var express = require('express')
var app = express()

var bodyParser = require ("body-parser")
var jsonParser = bodyParser.json()
var test_gen = require('../test_gen')
var winston = require('../../index').logger;

// other units in package
var auth = require('../auth')
var records = require('../records')


/*
Actual getUser command
Authenticates the accessToken against the apiKey and user ID
Not pulling data yet, but will do actual authenticator checks
For debugging, use GET /test/user/:uID instead
*/
app.get('/user/:uID', jsonParser, function(req, res) {
	winston.verbose("Attempting to get data from " + req.params.uID)
	// send a 400 error if there isn't any user data uploaded, like auth key
	// if (!req.body.accessToken){
	// 	winston.debug("Request did not have an Access Token included")
	// 	return res.status(400).jsonp({"error" : "No Access Token"});
	// }
	if (!req.body.apiKey){
		winston.debug("Request did not have an API Key included")
		return res.status(400).jsonp({"error" : "No API Key"});
	}

	// authenticate the accessToken to see if it matches
	//auth.checkAccessToken(req.body.accessToken, req.params.uID, req.body.apiKey, function(successful){
	auth.checkAPIKey(req.body.apiKey, req.ip, function(successful){
		if (successful){
			// authenticator checks out just fine
			records.getUserByID(req.params.uID, function(err, doc){
				if (err){
					winston.error(err)
					res.status(500).send("Internal server error while fetching document");
				}
				else if (! doc){
					winston.warn("No user record found for " + req.params.uID);
					res.status(404).send("User " + req.params.uID + " was not found");
				}
				else {
					winston.info("User record for " + req.params.uID + " accessed");
					//res.setHeader('Content-Type', 'application/json');
					res.status(201).jsonp(doc);
				}
			})
			return;
		}
		if (! successful){
			// not authenticated -- no userID + accessToken + API Key combination
			res.status(401).send("Access Token denied");
		}
	});
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
	auth.AccessToken(req.body.apiKey, req.params.uID, function(accessToken){
		// return the newly created access token
		res.setHeader('Content-Type', 'application/json');
		res.status(201).json({"uID" : req.params.uID, "accessToken" : accessToken})
	})
})

// export the app so it can be mounted at /build
module.exports = app;
