FROM node:10.15.3-alpine as intermediate
WORKDIR /opt/mojaloop-simulator

RUN mkdir -p /opt/mojaloop-simulator/src

COPY package.json package-lock.json* /opt/mojaloop-simulator/
COPY ./src/lib /opt/mojaloop-simulator/src/lib

RUN npm install --production

FROM node:10.15.3-alpine

WORKDIR /opt/mojaloop-simulator

COPY --from=intermediate ./package.json /src/package.json
COPY src /opt/central-ledger/src
COPY config /opt/central-ledger/config

EXPOSE 3000 3001 3003
CMD ["npm", "run", "start"]
