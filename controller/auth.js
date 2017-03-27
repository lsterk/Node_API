var MongoClient = require('mongodb').MongoClient;

function checkAPIKey(apiKey, ipAddr, mongodb_url, callback){
  MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of access tokens
		var col = db.collection('api_key');
		// check to see if the access token exists
		col.findOne({
      "apiKey" : apiKey,
      "ipAddr" : ipAddr}, function (err, doc){
			if (!doc) {
        // no document was found, so it wasn't a match
				winston.info("Unauthorized user attempting to access user " + req.params.uID);
				callback(false);
			}
			if (err) {
        winston.error("Error in checking token:" + err);
        callback(false);
      }
      // doc was found and no error uncovered, so must be legit
      callback(true);
		})
	});
}

module.exports.checkAPI = checkAPIKey;
