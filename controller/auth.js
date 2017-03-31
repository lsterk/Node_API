var MongoClient = require('mongodb').MongoClient;
const uuidV1 = require('uuid/v1');

/*
checkAPIKey will check if a particular apiKey and ipAddr match in the master db
@param: apiKey, a String formatted UUIDv1 value
@param: ipAddr, a String formatted IP Address. Taken from request.ip,
so often comes as hex IPv6 addr (e.g. ::ffff:153.106.112.144 for IPv4)
@param: mongodb_url, a String formatted URL for the MongoDB database of apiKeys
ex: 'mongodb://localhost:27017/kiosk'
Note that this does not include the collections argument
*/
function checkAPIKey(apiKey, ipAddr, mongodb_url, callback){
  MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of api keys

		var col = db.collection('api_key');
		// check to see if the access token exists
		col.findOne({
      "apiKey" : apiKey,
      "ipAddr" : ipAddr}, function (err, doc){
			if (!doc) {
        // no document was found, so it wasn't a match
				//winston.info("Unauthorized user attempting to access user " + req.params.uID);
				callback(false);
			}
			if (err) {
        //winston.error("Error in checking token:" + err);
        callback(false);
      }
      // doc was found and no error uncovered, so must be legit
      callback(true);
		})
	});
}

function checkAccessToken(accessToken, uID, apiKey, mongodb_url, callback){
  MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of api keys

		var col = db.collection('access_token');
		// check to see if the access token exists
		col.findOne({
      "accessToken" : accessToken,
      "uID" : uID,
      "apiKey" : apiKey}, function (err, doc){
			if (!doc) {
        // no document was found, so it wasn't a match
				//winston.info("Unauthorized user attempting to access user " + req.params.uID);
				callback(false);
			}
			if (err) {
        //winston.error("Error in checking token:" + err);
        callback(false);
      }
      // doc was found and no error uncovered, so must be legit
      callback(true);
		})
	});
}

/*
Method for creating an access token and storing it in mongodb
*/
function createAccessToken(apiKey, uID, mongodb_url, callback) {
  var accessToken = uuidV1();
  MongoClient.connect(mongodb_url, function(err, db) {
    if (err) throw err;
    var col = db.collection('acces_token');
    col.insertOne({"accessToken" : accessToken, "apiKey" : apiKey,
    "uID" : uID, "created" : new Date()}, {}, function(err_write, db_write){
      if (err_write) throw err;
    });
  });
  callback(accessToken);
  return accessToken;
}

module.exports.checkAPI = checkAPIKey;
module.exports.checkAccessToken = checkAccessToken;
module.exports.AccessToken = createAccessToken;
