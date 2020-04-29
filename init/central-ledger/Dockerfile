FROM postman/newman:5.0.0-alpine

ARG CREATED
ARG SOURCE
ARG REVISION
ARG VERSION

# See https://github.com/opencontainers/image-spec/blob/master/annotations.md#pre-defined-annotation-keys and https://github.com/opencontainers/image-spec/blob/master/spec.md for info
LABEL org.opencontainers.image.created=${CREATED}
LABEL org.opencontainers.image.url="https://mojaloop.io/"
LABEL org.opencontainers.image.source=${SOURCE}
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.revision=${REVISION}
LABEL org.opencontainers.image.title="init-central-ledger"
LABEL org.opencontainers.image.authors="kamuela.franco@modusbox.com"
LABEL org.opencontainers.image.licenses="Apache-2.0"

WORKDIR /opt/init-central-ledger
COPY . .

CMD newman run \
    --delay-request=${DELAY_REQUEST} \
    --env-var "HOST_CENTRAL_LEDGER=${HOST_CENTRAL_LEDGER}" \
    --env-var "BASE_CENTRAL_LEDGER_ADMIN=${BASE_CENTRAL_LEDGER_ADMIN}" \
    --env-var "DFSP_NAME=${DFSP_NAME}" \
    --env-var "HUB_OPERATOR=${HUB_OPERATOR}" \
    --env-var "HUB_OPERATOR_BEARER_TOKEN=${HUB_OPERATOR_BEARER_TOKEN}" \
    --env-var "DFSP_CURRENCY=${DFSP_CURRENCY}" \
    --env-var "INITIAL_NET_DEBIT_CAP=${INITIAL_NET_DEBIT_CAP}" \
    --env-var "INITIAL_POSITION=${INITIAL_POSITION}" \
    --env-var "GENERIC_DFSP_SETTLEMENT_ACCOUNT_ID=${GENERIC_DFSP_SETTLEMENT_ACCOUNT_ID}" \
    --env-var "FUNDS_IN_PREPARE_AMOUNT=${FUNDS_IN_PREPARE_AMOUNT}" \
    --env-var "FUNDS_IN_PREPARE_TRANSFER_ID=${FUNDS_IN_PREPARE_TRANSFER_ID}" \
    --env-var "GENERIC_DFSP_SETTLEMENT_ACCOUNT_BALANCE_BEFORE_FUNDS_IN=${GENERIC_DFSP_SETTLEMENT_ACCOUNT_BALANCE_BEFORE_FUNDS_IN}" \
    --env-var "HUB_NAME=${HUB_NAME}" \
    --env-var "HUB_RECONCILIATION_ACCOUNT_BALANCE_BEFORE_FUNDS_IN=${HUB_RECONCILIATION_ACCOUNT_BALANCE_BEFORE_FUNDS_IN}" \
    --env-var "GENERIC_DFSP_CALLBACK_URL=${GENERIC_DFSP_CALLBACK_URL}" \
    --env-var "REQUEST_ID=${REQUEST_ID}" \
    --env-var "TRANSFER_ID=${TRANSFER_ID}" \
    --env-var "NDC_THRESHOLD_BREACH_EMAIL=${NDC_THRESHOLD_BREACH_EMAIL}" \
    --env-var "NDC_ADJUSTMENT_EMAIL=${NDC_ADJUSTMENT_EMAIL}" \
    --env-var "SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL=${SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL}" \
    "Onboard-Generic-FSP.postman_collection.json"
