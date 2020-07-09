#!/usr/bin/env sh

CURRENT_DATE=$(date)
for participantMSISDN in $(echo "${MSISDN_LIST}" | jq -c '.[]'); do
    MSISDN=$(echo "${participantMSISDN}" | jq -r '.MSISDN');
    CURRENCY=$(echo "${participantMSISDN}" | jq -r '.currency');
    DATA="{\"currency\": \"${CURRENCY}\", \"fspId\": \"${SIM_NAME}\"}"
    
    curl -v --location --request PUT "${PATHFINDER_ORACLE_HOST}/participants/MSISDN/${MSISDN}" \
    --header 'Content-Type: application/json' \
    --header "date: ${CURRENT_DATE}" \
    --header "fspiop-source: ${SIM_NAME}" \
    --data-raw "${DATA}";
done

echo "MSISDNS have been onboarded"
