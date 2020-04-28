FROM postman/newman:5.0.0-alpine
LABEL maintainer="kamuela.franco@modusbox.com"

WORKDIR /opt/init-central-ledger
COPY . .

RUN ["node", "inject-env-into-postman-env.js"]

RUN newman run \
    --delay-request=3000 \
    --environment="Onboard-Generic-FSP-POPULATED.postman_environment.json" \
    "Onboard-Generic-FSP.postman_collection.json"
