#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

curl -w '\n' -i 'https://server.localhost:3000/participants/MSISDN/123/error' \
    --cacert "$DIR/../src/secrets/cacert.pem" \
    --data @"$DIR/../data.json" \
    --cert "$DIR/../src/secrets/client0cert.pem" \
    --key "$DIR/../src/secrets/client0key.pem" \
    -X PUT \
    -H 'Content-Type: application/json' \
    -H 'Date: blah' \
    -H 'FSPIOP-Source: blah'
