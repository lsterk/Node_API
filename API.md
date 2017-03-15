# Calvin Information Center API Guide
**Landon Sterk**

**v 0.1**

## Public Actions

### GET /test

Testing method to determine current server status

Request: no formatting needed

Reply:

```html
Test server running
```

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


## Authenticated User Actions

### GET /user/:uID

Retrieves all relevant user data

| HTTP Status Code | Status Explanation  |
| :---------------:  | :---------------- |
| 200 | Authentication successful, data sent back in body|
|400 | API Key or PIN not included |
| 401 | AccessToken did not exist or match supplied uID

submission example:

```javascript
{
  "accessToken" : <accessToken>
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
