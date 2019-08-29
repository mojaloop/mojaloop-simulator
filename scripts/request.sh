#!/usr/bin/env bash

curl -w '\n' -i 'http://localhost:3000/participants/MSISDN/123/error' \
    --data @./data.json \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Date: blah' \
    -H 'FSPIOP-Source: blah'
