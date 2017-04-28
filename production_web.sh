#!/bin/bash
if [ -z ${PORT+x} ]; then echo "PORT is unset; using default value of 5000"
		 export PORT=5000;
	else echo "PORT is set to '$PORT'";
fi
# echo "Using PORT value: '$PORT'";
curl -X GET -H "Content-Type: application/json" -d '{"accessToken" : "bbbb", "apiKey" : "aaaa"}' http://153.106.112.144:$PORT/production/user/ljs34
echo ''
