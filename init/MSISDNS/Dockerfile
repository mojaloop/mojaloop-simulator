FROM alpine

WORKDIR /src/

RUN apk add curl jq

COPY ./insert_MSISDNS /src/

RUN chmod +x /src/insert_MSISDNS

CMD . ./insert_MSISDNS