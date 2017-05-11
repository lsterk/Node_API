var express = require('express')
var app = express()

var bodyParser = require ("body-parser")
var jsonParser = bodyParser.json()
var winston = require('../../index').logger;

// other units in package
var auth = require('../auth')
var records = require('../records')

var logRequestPath = function(req, res){
	// log the result of the API call, as well as the call itself and source IP addr
	// note that req.path does NOT log any queries, i.e. API keys
	winston.info(res.statusCode + '\t' + req.method + "\t"+ app.mountpath + req.path + " from " + req.ip)
}

//app.use(logRequestPath);
/*
getUser command from a kiosk
Authenticates the apiKey against database
returns a 400 for missing apiKey
return a 401 for bad apiKey
Will return a 404 error for bad user ID
For debugging, use GET /test/user/:uID instead
*/
app.get('/id/:uID', jsonParser, function(req, res, next) {
	if (!req.query.apiKey){
		//winston.debug("Request did not have an API Key included")
		res.status(400).json({"error" : "No API Key"});
		next()
	}

	// authenticate the api key to see if it matches the supplied value
	auth.checkAPIKey(req.query.apiKey, req.ip, function(successful){
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
					//winston.info("User record for " + req.params.uID + " accessed");
					res.status(200).json(doc);
				}
				// regardless of the result, log teh status code
				next();
			})
			return;
		}
		if (! successful){
			// not authenticated -- no userID + accessToken + API Key combination
			// console.log("AT denied")
			res.status(401).send("Access Token denied");
			// next();
		}
	});
}, logRequestPath);


/*
getUser command from a web server
Authenticates the apiKey and access token against database
return a 400 for missing apiKey or accessToken
return a 401 for bad apiKey + access token combo
Will return a 404 error for bad user ID
For debugging, use GET /test/user/:uID instead
*/
// not used in production
/*
app.get('/user/:username', jsonParser, function(req, res) {
	winston.verbose("Web server requested user " + req.params.username)
	// send a 400 error if there isn't any user data uploaded, like auth key
	if (!req.body.accessToken){
		winston.debug("Request did not have an Access Token included")
		return res.status(400).json({"error" : "No Access Token"});
	}
	if (!req.body.apiKey){
		winston.debug("Request did not have an API Key included")
		return res.status(400).json({"error" : "No API Key"});
	}

	// authenticate the accessToken to see if it matches
	auth.checkAccessToken(req.body.accessToken, req.params.username, req.body.apiKey, function(successful){
		//auth.checkAPIKey(req.body.apiKey, req.ip, function(successful){
		if (successful){
			// authenticator checks out just fine
			records.getUserByUsername(req.params.username, function(err, doc){
				if (err){
					winston.error(err)
					res.status(500).send("Internal server error while fetching document");
					return;
				}
				else if (! doc){
					winston.warn("No user record found for " + req.params.username);
					res.status(404).send("User " + req.params.username + " was not found");
					return;
				}
				else {
					winston.info("User record for " + req.params.username + " accessed");
					//res.setHeader('Content-Type', 'application/json');
					res.status(200).json(doc);
					return;
				}
			})
			return;
		}
		if (! successful){
			// not authenticated -- no userID + accessToken + API Key combination
			res.status(401).send("Access Token denied");
			return;
		}
	});
})
*/

/*
POST /login/:username will generate an access Token
Currently iffy, pending results from the adfs service
*/
// not used in production
/*
app.post('/login/:username', jsonParser, function(req, res) {
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
*/

// export the app so it can be mounted at /production
module.exports = app;
