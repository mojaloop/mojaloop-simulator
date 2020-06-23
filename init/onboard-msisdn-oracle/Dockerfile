FROM alpine

RUN apk add --no-cache --upgrade bash curl jq

COPY insert_msisdns.sh /insert_msisdns.sh

CMD ["sh", "/insert_msisdns.sh"]
