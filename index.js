var express = require('express')
var app = express()
var bodyParser = require ("body-parser")
// parse application/x-www-form-urlencoded
var urlParser = (bodyParser.urlencoded({ extended: false }))
// parse application/json
var jsonParser = (bodyParser.json())
const uuidV1 = require('uuid/v1')
var MongoClient = require('mongodb').MongoClient

var winston = require('winston')
winston.add(winston.transports.File, {filename : "/var/log/kiosk/api.log"})
//winston.transports.console.level = 'debug';
winston.level = "debug"
module.exports.logger = winston;

// other units in package
var auth = require('./controller/auth')
var test_gen = require('./controller/test_gen')
// var schema = require('./model/schemas').schema;

// assignes the app to listen on default port of 5000, if not env PORT value
app.set('port', (process.env.PORT || 5000))

// test branch
var test_branch = require('./controller/routes/test')
app.use('/test', test_branch); // mounts test_branch sub app

// build branch
var build_branch = require('./controller/routes/build')
app.use('/build', build_branch); // mounts build_branch sub app

//production branch
var production_branch = require('./controller/routes/production')
app.use('/production', production_branch)


// /*
// Actual getUser command
// Authenticates the accessToken against the apiKey and user ID
// Not pulling data yet, but will do actual authenticator checks
// For debugging, use GET /test/user/:uID instead
// */
// app.get('/user/:uID', jsonParser, function(req, res) {
// 	winston.info("Attempting to get data from " + req.params.uID)
// 	// send a 400 error if there isn't any user data uploaded, like auth key
// 	if (!req.body.accessToken){
// 		winston.debug("Request did not have an Access Token included")
// 		return res.status(400).json({"error" : "No AT"});
// 	}
// 	if (!req.body.apiKey){
// 		winston.debug("Request did not have an API Key included")
// 		return res.status(400).json({"error" : "No API Key"});
// 	}
//
// 	// authenticate the accessToken to see if it matches
// 	auth.checkAccessToken(req.body.accessToken, req.params.uID, req.body.apiKey, function(successful){
// 		if (successful){
// 			// authenticator checks out just fine
// 			res.setHeader('Content-Type', 'application/json');
// 			res.status(201).json({"uID" : req.params.uID, "username" : "Testy"})
// 			return;
// 		}
// 		else{
// 			// not authenticated -- no userID + accessToken + API Key combination
// 			res.status(401).send("Access Token denied");
// 		}
// 	})
// })


// /*
// POST /login/:uID will generate an access Token
// Currently iffy, since PIN's probably won't be Used
// */
// app.post('/login/:uID', jsonParser, function(req, res) {
// 	// check supplied credentials
// 	if (!req.body.PIN) return res.sendStatus(400);
// 	if (!req.body.apiKey) return res.sendStatus(400);
//
// 	// check that the API Key is legit
// 	// checkAPIKey(req.body.apiKey);
//
// 	// check that the PIN is legit and corresponds to the user ID
// 	// tryPIN(req.params.uID, req.body.PIN);
//
// 	// create an accessToken to register to the account
// 	// note that this also adds the AT to the database
// 	auth.AccessToken(req.body.apiKey, req.params.uID, function(accessToken){
// 		// return the newly created access token
// 		res.setHeader('Content-Type', 'application/json');
// 		res.status(201).json({"uID" : req.params.uID, "accessToken" : accessToken})
// 	})
// })


// /*
// Will serve static documents too, e.g. HTML file at root
// */
// app.use(express.static(__dirname + '/public'))


/*
404 Error listener so that no request will go unanswered without being logged
*/
app.all('/*', function(request, response) {
	winston.debug("Unknown request: " + request.method + " "+ request.path)
	response.status(404).send('404 Error: path ' + request.path + ' is not a valid path\n')
})


// have the app start listening!
app.listen(app.get('port'), function() {
  winston.verbose("Node app is running at localhost:" + app.get('port'))
})
