/*
Index.js is the application for the API server
It creates an Express.js app, loads other routes and controllers, etc.
*/
var express = require('express')
var app = express()
var bodyParser = require ("body-parser")
// parse application/x-www-form-urlencoded
// pretty sure this isn't used though
var urlParser = (bodyParser.urlencoded({ extended: false }))
// parse application/json
var jsonParser = (bodyParser.json())
// MongoClient is the Node.js MongoDB driver
var MongoClient = require('mongodb').MongoClient

// logging software
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
