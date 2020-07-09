#!/usr/bin/env sh

set -eux

CURRENT_DATE=$(date)
for participantMSISDN in $(echo "${MSISDN_LIST}" | jq -c '.[]'); do
    MSISDN=$(echo "${participantMSISDN}" | jq -r '.MSISDN');
    CURRENCY=$(echo "${participantMSISDN}" | jq -r '.currency');
    DATA="{\"currency\": \"${CURRENCY}\", \"fspId\": \"${DFSP_NAME}\"}"

    curl -v --location --request PUT "${HOST_PATHFINDER_ORACLE}/participants/MSISDN/${MSISDN}" \
    --header 'Content-Type: application/json' \
    --header "date: ${CURRENT_DATE}" \
    --header "fspiop-source: ${DFSP_NAME}" \
    --data-raw "${DATA}";
done

echo "MSISDN's have been onboarded"
