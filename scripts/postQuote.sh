#!/usr/bin/env bash

# DATA='
# {
#     "quoteId": "4a0cae30-5cc6-4e9c-886b-a98406653ac1",
#     "transactionId": "e736d917-e33f-4c4f-98e5-f2a07a262798",
#     "payee": { "name": "someone-else" },
# }
# '

DATA='
{
    "quoteId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
    "transactionId": "a8323bc6-c228-4df2-ae82-e5a997baf899",
    "transactionRequestId": "a8323bc6-c228-4df2-ae82-e5a997baf890",
    "payee": {
      "partyIdInfo": {
        "partyIdType": "PERSONAL_ID",
        "partyIdentifier": "16135551212",
        "partySubIdOrType": "DRIVING_LICENSE",
        "fspId": "1234"
      },
      "merchantClassificationCode": "4321",
      "name": "Justin Trudeau",
      "personalInfo": {
        "complexName": {
          "firstName": "Justin",
          "middleName": "Pierre",
          "lastName": "Trudeau"
        },
        "dateOfBirth": "1971-12-25"
      }
    },
    "payer": {
      "partyIdInfo": {
        "partyIdType": "PERSONAL_ID",
        "partyIdentifier": "16135551212",
        "partySubIdOrType": "PASSPORT",
        "fspId": "1234"
      },
      "merchantClassificationCode": "1234",
      "name": "Donald Trump",
      "personalInfo": {
        "complexName": {
          "firstName": "Donald",
          "middleName": "John",
          "lastName": "Trump"
        },
        "dateOfBirth": "1946-06-14"
      }
    },
    "amountType": "SEND",
    "amount": {
      "currency": "USD",
      "amount": "123.45"
    },
    "fees": {
      "currency": "USD",
      "amount": "1.25"
    },
    "transactionType": {
      "scenario": "DEPOSIT",
      "subScenario": "ABCDE",
      "initiator": "PAYEE",
      "initiatorType": "CONSUMER",
      "refundInfo": {
        "originalTransactionId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
        "refundReason": "free text indicating reason for the refund"
      },
      "balanceOfPayments": "123"
    },
    "geoCode": {
      "latitude": "+45.4215",
      "longitude": "+75.6972"
    },
    "note": "Free-text memo",
    "expiration": "2016-05-24T08:38:08.699-04:00",
    "extensionList": {
      "extension": [
        {
          "key": "errorDescription",
          "value": "This is a more detailed error description"
        },
        {
          "key": "errorDescription",
          "value": "This is a more detailed error description"
        }
      ]
    }
  }

'

curl -i localhost:3000/quotes \
    -w '\n' \
    -X POST \
    -H 'content-type: application/json' \
    -H 'accept: application/json' \
    -H 'fspiop-source: test-script' \
    -H 'fspiop-destination: golden' \
    -H 'date: whatever' \
    --data "$DATA"
