
DATA='{
    "displayName": "Jimmy",
    "firstName": "James",
    "middleName": "J",
    "lastName": "Murphy",
    "dateOfBirth": "2019-04-04T00:26:27.604Z",
    "idType": "MSISDN",
    "idValue": "123456"
}'

    # "merchantClassificationCode": "",
curl -w '\n' -i -X POST \
    -H 'content-type: application/json' \
    localhost:3001/repository/parties \
    --data "${DATA}"
