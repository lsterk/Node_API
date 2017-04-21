var MongoClient = require('mongodb').MongoClient;
const mongodb_url = 'mongodb://localhost:27017/kiosk';
// var winston = require('../index').logger;

function getUserByID(uID, callback){
  MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of api keys

		var col = db.collection('records');
		// check to see if the access token exists
		col.findOne({
      "uID" : uID}, function (err, doc){
			if (!doc) {
        // no document was found, so it wasn't a match
				callback(null, null);
			}
			else if (err) {
        // an error occurred while searching
				callback(err, null);
      }

      else {
        // doc was found and no error uncovered, so must be legit
        callback(null, doc);
      }
		})
	});
}

module.exports.getUserByID = getUserByID;
