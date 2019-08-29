#!/usr/bin/env bash

DATA='
{
    "endpoint": "http://localhost:3000",
    "counterparty": "blah-fsp",
    "amount": { "amount": 1.5, "currency": "XOF" },
    "fee": { "amount": 1.5, "currency": "XOF" },
    "commission": { "amount": 1.5, "currency": "XOF" }
}
'

curl -i localhost:3001/control/initiate-quote \
    -w '\n' \
    -X PUT \
    -H 'content-type: application/json' \
    -H 'accept: application/json' \
    --data "$DATA"
