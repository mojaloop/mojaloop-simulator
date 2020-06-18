FROM alpine

WORKDIR /src/

COPY ./inset_MSISDNS /src/

RUN apk add curl jq

RUN chmod +x /src/inset_MSISDNS

CMD /src/inset_MSISDNS
