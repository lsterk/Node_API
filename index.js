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

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// parse application/json
app.use(bodyParser.json())

app.get('/', function(request, response) {
	winston.info("Connection accepted from " + request.ip)
  response.send('Hello, user! Your IP address is ' + request.ip)
})

app.get('/test', function(request, response) {
	winston.info("Test requested from client at " + request.ip)
	response.send('Test server running')
})

app.get('/user/:uID', function(req, res) {
	// send a 400 error if there isn't any user data uploaded, like auth key
	if (!req.body) return res.sendStatus(400)
	winston.info("Attempting to get data from " + req.params.uID)
	res.setHeader('Content-Type', 'application/json');
	res.status(201).json({"uID" : req.params.uID, "username" : "Testy"})
})

app.post('/login/:uID', function(req, res) {
	// check to make sure LOGIN action succeeds

	// create an accessToken to register to the account
	var accessToken = uuidV1();
	// create access token reference in database


	// Connect using MongoClient
	MongoClient.connect(mongodb_url, function(err, db) {
		// Create a collection we want to drop later
		var col = db.collection('access_token');
		// add the access token to the database
		col.insertOne({"accessToken" : accessToken, "uID" : req.params.uID, "created" : new Date()})
		// // Show that duplicate records got dropped
		// col.find({}).toArray(function(err, items) {
		//   test.equal(null, err);
		//   test.equal(4, items.length);
		//   db.close();
		// });
	});

	res.setHeader('Content-Type', 'application/json');
	res.json({"uID" : req.params.uID, "accessToken" : accessToken})

})

app.get('/*', function(request, response) {
	winston.warn("Unknown request: " + request.path)
	//console.log("Weird request coming in on " + request.route)
	response.status(404).send('404 Error: path ' + request.path + ' is not a valid path\n')
})

app.listen(app.get('port'), function() {
  winston.debug("Node app is running at localhost:" + app.get('port'))
})
