# Calvin Information Center API Guide
**Landon Sterk**

**v 0.2**

## Public Actions

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
```
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

```
// request
curl -X GET http://localhost:5000/test/user/1234

//Response
//STATUS: 200
{
  "uID":"1234",
  "uName":"ljs34",
  "name":"Sterk,Landon",
  "mealPlan":
  {
    "count":51,
    "isWeekly":false
    },
  "bonusBucks":7.25,
  "isLiveData":false,
  "updated":"Wed Mar 29 2017 11:05:33 GMT-0400 (EDT)"
}

```


## Authenticated User Actions

All of the below actions necessitate having an active, valid API Key, and possibly
more authentication factors (e.g. AccessToken)

### POST /login/:uID

To receive an Access Token for a particular user, upload a JSON-style body with
an API Key and the plain-text PIN of the user:

Request:
```javascript
{
  "apiKey" : String ,
  "PIN" : String
}
```

Response:

```javascript
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
  "apiKey" : UUIDV1,
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


### GET /user/:uID

Retrieves all relevant user data

| HTTP Status Code | Status Explanation  |
| :---------------:  | :---------------- |
| 200 | Authentication successful, data sent back in body|
|400 | API Key or AccessToken  not included|
| 401 | AccessToken did not exist or match supplied uID

submission example:

```javascript
{
  "accessToken" : String accessToken,
  "apiKey" : String apiKey
}
```

reply Example:

```javascript
{
  "uID" : "1403378",
  "uName" : "ljs34",
  "name" : "Sterk, Landon",
  "meals" : 25,
  "isWeekly": false,
  "bonusBucks" : 15.44  
}
```
