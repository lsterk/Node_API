#!/bin/bash
if [ -z ${PORT+x} ]; then echo "PORT is unset; using default value of 5000"
		export PORT=5000;
	else echo "PORT is set to '$PORT'";
fi
curl -X GET  http://153.106.112.144:$PORT/test/user/1234567
echo ''
