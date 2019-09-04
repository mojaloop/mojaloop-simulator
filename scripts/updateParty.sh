
DATA='{
    "displayName": "Jimmy",
    "firstName": "John",
    "middleName": "Stephen",
    "lastName": "Murphy",
    "dateOfBirth": "2019-04-03T00:26:27.604Z",
    "idType": "MSISDN",
    "idValue": "123456"
}'

    # "merchantClassificationCode": "",
curl -w '\n' -i -X PUT \
    -H 'content-type: application/json' \
    localhost:3003/repository/parties/MSISDN/123456 \
    --data "${DATA}"
