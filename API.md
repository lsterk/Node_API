# Calvin Information Center API Guide
**Landon Sterk**

**v 0.1**

## Public Actions

GET /test

Testing method to determine current server status

POST /login/:uID

submission example:
{
  "PIN" : hash(1453)  
}

reply example:

{
  "uID" : "1403378",
  "accessToken" :
}

## Authenticated User Actions

GET /user/:uID

Retrieves all relevant user data

submission example:
{
  "accessToken" : <accessToken>
}

reply Example:

{
  "uID" : "1403378",
  "uName" : "ljs34",
  "name" : "Sterk, Landon",
  "meals" : 25,
  "isWeekly": false,
  "bonusBucks" : 15.44  
}
