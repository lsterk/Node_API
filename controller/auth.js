var MongoClient = require('mongodb').MongoClient;
const uuidV1 = require('uuid/v1');
const mongodb_url = 'mongodb://localhost:27017/kiosk';

/*
checkAPIKey will check if a particular apiKey and ipAddr match in the master db
@param: apiKey, a String formatted UUIDv1 value
@param: ipAddr, a String formatted IP Address. Taken from request.ip,
so often comes as hex IPv6 addr (e.g. ::ffff:153.106.112.144 for IPv4)
@callback: a function to be executed on method completion
passes boolean character true or false
Note that this does not include the collections argument
*/
function checkAPIKey(apiKey, ipAddr, callback){
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
			else if (err) {
        //winston.error("Error in checking token:" + err);
        callback(false);
      }
      else {
        callback(true);
      }// doc was found and no error uncovered, so must be legit
		})
	});
}

function checkAccessToken(accessToken, uID, apiKey, callback){
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
        return false; // ends execution
			}
			if (err) {
        //winston.error("Error in checking token:" + err);
        callback(false);
        return false; // ends execution
      }
      // doc was found and no error uncovered, so must be legit
      callback(true);
      return true; // ends execution
		})
	});
}

/*
Method for creating an access token and storing it in mongodb
*/
function createAccessToken(apiKey, uID, callback) {
  var accessToken = uuidV1();
  MongoClient.connect(mongodb_url, function(err, db) {
    if (err) throw err;
    var col = db.collection('access_token');
    col.insertOne({"accessToken" : accessToken, "apiKey" : apiKey,
    "uID" : uID, "created" : new Date()}, {}, function(err_write, db_write){
      if (err_write) throw err;
    });
  });
  callback(accessToken);
  return accessToken;
}

module.exports.checkAPIKey = checkAPIKey;
module.exports.checkAccessToken = checkAccessToken;
module.exports.AccessToken = createAccessToken;
