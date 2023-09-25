# Arguments
ARG NODE_VERSION=lts-alpine

# NOTE: Ensure you set NODE_VERSION Build Argument as follows...
#
#  export NODE_VERSION="$(cat .nvmrc)-alpine" \
#  docker build \
#    --build-arg NODE_VERSION=$NODE_VERSION \
#    -t mojaloop/sdk-scheme-adapter:local \
#    . \
#

# Build Image
FROM node:${NODE_VERSION} as builder

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
LABEL org.opencontainers.image.title="onboard-central-ledger"
LABEL org.opencontainers.image.authors="kamuela.franco@modusbox.com"
LABEL org.opencontainers.image.licenses="Apache-2.0"

WORKDIR /opt/onboard-central-ledger
COPY package* *.js /opt/onboard-central-ledger/

RUN ["npm", "ci", "--production"]

FROM node:${NODE_VERSION}
WORKDIR /opt/onboard-central-ledger

COPY --from=builder /opt/onboard-central-ledger .

CMD ["node", "onboard-dfsp.js"]
