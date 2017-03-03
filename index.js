var express = require('express')
var app = express()
var bodyParser = require ("body-parser")


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// parse application/json
app.use(bodyParser.json())

app.get('/', function(request, response) {
	console.log("Connection accepted from " + request.ip)
  response.send('Hello, user! Your IP address is ' + request.ip)
})

app.get('/test', function(request, response) {
	console.log("Test requested from client at " + request.ip)
	response.send('Test server running')
})

app.get('/user/:uID', function(req, res) {
	if (!req.body) return res.sendStatus(400)
	console.log("Attempting to get data from " + req.params.uID)
	res.setHeader('Content-Type', 'application/json');
	res.json({"uID" : req.params.uID, "username" : "Testy"})
})

app.get('/*', function(request, response) {
	console.log("Unknown request: " + request.path)
	//console.log("Weird request coming in on " + request.route)
	response.status(404).send('404 Error: path ' + request.path + ' is not a valid path')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
