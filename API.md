# Calvin Information Center API Guide
**Landon Sterk**

**v 1.0**

## User Record Data Structure

User records are cached in a MongoDB collection called "records". The records are generated from CSV dump of the CBORD database, with only a few columns being sent out. The structure of the data is shown below using both example data as well as the data types.

```javascript
// example
{
    "_id" : ObjectId("58fa1d6299ceed5978375826"),
    "mealPlan" : {
        "planName" : "CD-60 (60 Block Meals)",
        "max" : 60,
        "count" : 29,
        "isWeekly" : false
    },
    "name" : "Bryson,Barrett",
    "firstName" : "Barrett",
    "uName" : "bb36",
    "isLiveData" : false,
    "updated" : ISODate("2017-04-19T10:56:43.388Z"),
    "bonusBucks" : 2.37,
    "lastName" : "Bryson",
    "uID" : "1252391"
}

// format
// note that all HTTP replies in JSON format are really just Strings
{
    "_id" : ObjectId,
    "mealPlan" : {
        "planName" : String,
        "max" : Number,
        "count" : Number,
        "isWeekly" : Boolean
    },
    "name" : String,
    "firstName" : String,
    "uName" : String,
    "isLiveData" : Boolean,
    "updated" : ISODate,
    "bonusBucks" : 2.37,
    "lastName" : String,
    "uID" : String
}
```

## Public Actions

Actions that do not require an API key for a server response

### GET /test

Testing method to determine current server status

Request: no body needed

Reply:

```html
//STATUS: 200
Test server running
```

### POST /test/login/:uID

Testing method to receive a dummy UUIDv1 object for a user

Note that the UUIDv1 object returned is NOT entered into the access database

Format of reply:

```js
{
	  "uID" : String,
	  "accessToken" : String
}
```

example:
```js
// request
curl -X POST http://localhost:5000/test/login/1234

//Response
//STATUS: 201
{
  "uID" : "1234",
  "accessToken" : "0ae0a4b0-1490-11e7-bb9a-09c0a1761819"
}

```

### GET /test/user/:uID
Test method for acquiring dummy data for a user

Reply format:
```js
{
	  "uID" : String,
	  "uName" : String,
	  "name" : String,
		"mealPlan" : {
      "count" : Number,
      "isWeekly" : Boolean,
			"max" : Number
    },
	  "bonusBucks" : Number,
		"isLiveData" : Boolean,
		"updated" : Date
}
```
Example:

```js
// request
curl -X GET http://localhost:5000/test/user/1234

//Response
//STATUS: 200
{
  "uID":"1234",
  "uName":"rnd34",
  "name":"Random_Last, Random_First",
  "mealPlan":
  {
    "count": 6,
    "maxMeals":10
    "isWeekly": true
    },
  "bonusBucks":7.25,
  "isLiveData":false,
  "updated":"Wed Mar 29 2017 11:05:33 GMT-0400 (EDT)"
}

```

### ALL /test/query

Test method for using the query parameters, or passing in queries using the URL
This method is particularly useful for debugging cases when the queries are misinterpreted due to bad characters: passing the key "apiKey" with the value "is this right?" might seem ok, but this is not safe for a URL.

The query API will return a JSON object of the queries that were passed in, to show how the server interprets them

```js
// request
curl -X POST "http://api.calvin.edu:5000/test/query?apiKey=happiness&style=graceful"

//response
//STATUS: 200
{
  "apiKey":"happiness",
  "style":"graceful"
}
```


## Authenticated User Actions

All of the below actions necessitate having an active, valid API Key, and possibly
more authentication factors (e.g. AccessToken)

Really, the most important

### GET production/id/:uID?apiKey=$API_KEY

Retrieves all relevant user data to the supplied userID, authenticating via
an API Key provided in the URL. This is what the kiosk uses to get user data.

Note that this is done to conform to HTTP 1.1 standard (GET requests may not
	have a body) and the Method standard that GET requests are the only request
	that do not modify server side resources (e.g. edit the user record)

This is really the only important method in the whole API. And, it's the only
command on the production branch.

| HTTP Status Code | Status Explanation  |
| :---------------:  | :---------------- |
| 200 | Authentication successful, data sent back in body|
|400 | API Key not included|
| 401 | ApiKey did not exist or match device IP address
| 404 | No record could be found for the supplied uID
| 500 | Internal server error, check the server logs

submission example:

```js
// request
curl -X GET http://localhost:5000/id/1252391?apiKey=aaaa
```

reply Example:

```js
{
	"bonusBucks":2.37,
	"lastName":"Bryson",
	"firstName":"Barrett",
	"uName":"bb36",
	"mealPlan":{
		"count":29,
		"isWeekly":true,
		"max":60
	},"updated":"2017-04-19T10:56:43.388Z",
	"isLiveData":false,
	"name":"Bryson,Barrett",
	"uID":"1252391"
}
```

## Speculative Future APIs

All of the following API calls were functions that did not make it into the
final project build. These would be necessary for a web server, but not actually
used for us. Note that Kiosk code likely uses the build branch of code (mistake)
but could otherwise be changed

### POST build/login/:uID

To receive an Access Token for a particular user, upload a JSON-style body with
an API Key and the plain-text PIN of the user. This hasn't been ever built up, though,
so don't expect it to work securely...

Request:
```js
{
  "apiKey" : String ,
  "PIN" : String
}
```

Response:

```js
HTTP Status Code: 201
{
  "uID" : String ,
  "accessToken" : String  
}
```

Some submissions will generate errors, according to incorrect access privileges, etc. See the table below for examples:

| HTTP Status Code | Status Explanation
| :---------------:  | :---------------- |
| 201 | AccessToken created, and sent back in body|
|400 | API Key or PIN not included |
| 401 | PIN was not successful in authenticating; API Key is not valid. Server will reply with JSON


#### Successful submission example
request example:

```javascript
{
  "apiKey" : "a valid api key",
  "PIN" : "1453"
}
```

reply example:

```javascript
HTTP Status Code: 201
{
  "uID" : "1403378",
  "accessToken" : UUIDv1()
}

```
#### Failed submission example
request example:

```javascript
{
  "apiKey" : "a valid key",
  "pin" : "wrong pin"
}
```

reply example:

```javascript
HTTP Status Code: 401
{
  "errorCode" : 401,
  "errorMsg" : "PIN Incorrect",
  "apiKeyAccepted" : true,
  "pinAccepted" : false
}
```



### GET build/user/:username

Retrieves all relevant user data to the supplied username

Part of the build group, so it's not actually in full development yet

| HTTP Status Code | Status Explanation  |
| :---------------:  | :---------------- |
| 200 | Authentication successful, data sent back in body|
|400 | API Key not included|
| 401 | ApiKey did not exist or match device IP address
| 404 | No record could be found for the supplied uID

submission example:

```js
// request
curl -X GET http://localhost:5000/user/bb35 -d
{
  "apiKey" : String apiKey
}
```

reply Example:

```js
{
	"bonusBucks":2.37,
	"lastName":"Bryson",
	"firstName":"Barrett",
	"uName":"bb36",
	"mealPlan":{
		"count":29,
		"isWeekly":true,
		"max":60
	},"updated":"2017-04-19T10:56:43.388Z",
	"isLiveData":false,
	"name":"Bryson,Barrett",
	"uID":"1252391"
}
```
