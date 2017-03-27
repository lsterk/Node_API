#!/bin/bash
curl -X POST -H "Content-Type: application/json" -d '{"PIN":"1234", "apiKey":"aaaa"}' http://localhost:5000/test/auth
