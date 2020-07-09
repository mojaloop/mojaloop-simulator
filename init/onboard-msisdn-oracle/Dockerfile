FROM alpine

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
LABEL org.opencontainers.image.title="onboard-msisdns"
LABEL org.opencontainers.image.authors="aaron.reynoza@modusbox.com"
LABEL org.opencontainers.image.licenses="Apache-2.0"

RUN apk add --no-cache --upgrade bash curl jq

COPY insert_msisdns.sh /insert_msisdns.sh

CMD ["sh", "/insert_msisdns.sh"]