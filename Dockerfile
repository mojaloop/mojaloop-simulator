FROM node:12.22.12-alpine as intermediate

WORKDIR /src/
COPY ./src/ /src/
RUN npm install --production

FROM node:12.22.12-alpine

WORKDIR /src/

COPY --from=intermediate /src/ /src/
COPY --from=intermediate /src/package.json /src/package.json

EXPOSE 3000 3001 3003

CMD node /src/index.js
