var MongoClient = require('mongodb').MongoClient;
const mongodb_url = 'mongodb://localhost:27017/kiosk';
// var winston = require('../index').logger;

/*
given a particular student ID number, will retrieve the file
uID: String, e.g. "1403378"
callback: a function that will be called with (err, doc),
  where err is any encountered (else null), and doc is the found doc
  (see API for JSON fields and structure)
*/
function getUserByID(uID, callback){
  MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of api keys

    //if error encountered, callback error and stop execution
    if (err) {
      callback(err, null);
      return;
    }

		var col = db.collection('records');
		// check to see if the access token exists
    // filter out the _id internal field for MongoDB
		col.findOne({
      "uID" : uID}, {'fields' : {'_id' : 0}, function (err, doc){
			if (!doc) {
        // no document was found, so it wasn't a match
        // err might be null, but we probably don't even care
				callback(err, null);
        return;
			}
			else if (err) {
        // an error occurred while searching
				callback(err, null);
        return;
      }

      else {
        // doc was found and no error uncovered, so must be legit
        callback(null, doc);
      }
		})
	});
}


/*
given a particular username, will retrieve the relevant records
username: String, e.g. "ljs34"
callback: a function that will be called with (err, doc),
  where err is any encountered (else null), and doc is the found doc
  (see API for JSON fields and structure)
*/
function getUserByUsername(username, callback){
  MongoClient.connect(mongodb_url, function(err, db) {
		// Connect to the collection of api keys

    //if error encountered, callback error and stop execution
    if (err) {
      callback(err, null);
      return;
    }

		var col = db.collection('records');
		// check to see if the access token exists
    // filter out the _id internal field for MongoDB
		col.findOne({
      "uName" : username}, {'fields' : {'_id' : 0}}, function (err, doc){
			if (!doc) {
        // no document was found, so it wasn't a match
        // err might be null, but we probably don't even care
				callback(err, null);
        return;
			}
			else if (err) {
        // an error occurred while searching
				callback(err, null);
        return;
      }

      else {
        // doc was found and no error uncovered, so must be legit
        callback(null, doc);
      }
		})
	});
}

module.exports.getUserByID = getUserByID;
module.exports.getUserByUsername = getUserByUsername;
