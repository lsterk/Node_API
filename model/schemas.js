/*  schemas.js declares data models to be used elsewhere

*/

var schemas = {
/*
apiKey data model for database
*/
apiKey : {

},

/*
accessToken data model for the database collection access_token
*/
accessToken : {
  // <String>
  token : null,
  uID : null,
  apiKey : String,
  created : Date
}
}

module.exports.schema = schemas;
