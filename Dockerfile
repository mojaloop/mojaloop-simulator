FROM node:16.15.0-alpine as builder
USER root

WORKDIR /opt/app/src

RUN apk add --no-cache -t build-dependencies git make gcc g++ python3 libtool autoconf automake \
    && cd $(npm root -g)/npm \
    && npm config set unsafe-perm true \
    && npm install -g node-gyp

COPY src /opt/app/src
RUN npm ci

FROM node:16.15.0-alpine
WORKDIR /opt/app/src

# Create empty log file & link stdout to the application log file
RUN mkdir ./logs && touch ./logs/combined.log
RUN ln -sf /dev/stdout ./logs/combined.log

# Create a non-root user: app-user
RUN adduser -D app-user
USER app-user

COPY --chown=app-user --from=builder /opt/app/src .
RUN npm prune --production

EXPOSE 3000 3001 3003
CMD ["node /src/index.js"]
