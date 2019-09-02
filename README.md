# mojaloop simulator
[![Git Commit](https://img.shields.io/github/last-commit/mojaloop/mojaloop-simulator.svg?style=flat)](https://github.com/mojaloop/mojaloop-simulator/commits/master)
[![Git Releases](https://img.shields.io/github/release/mojaloop/mojaloop-simulator.svg?style=flat)](https://github.com/mojaloop/mojaloop-simulator/releases)
[![Docker pulls](https://img.shields.io/docker/pulls/mojaloop/mojaloop-simulator.svg?style=flat)](https://hub.docker.com/r/mojaloop/mojaloop-simulator)
[![CircleCI](https://circleci.com/gh/mojaloop/mojaloop-simulator.svg?style=svg)](https://circleci.com/gh/mojaloop/mojaloop-simulator)


The code in this repo, along with the [Mojaloop SDK Example Scheme Adapter](http://www.github.com/modusbox/mojaloop-sdk-example-scheme-adapter), intends to simulate an exemplary FSP. It is a generic simulator, an implementation of the FSPIOP spec. It is intended to be used both locally, by prospective scheme participants to validate their FSPIOP implementations, and hosted in a cloud to validate a switch implementation. The objective of these use cases is to ease DFSP backend development and integration with the Mojaloop switch.

It is also intended to be used by the Scheme implementing Mojaloop itself to validate prospective participants' implementations before inclusion in the scheme. To these ends, it intends to behave as a stand-alone implementation of the Mojaloop switch, or as a participant in a Mojaloop scheme.

This simulator has two interfaces; the FSPIOP interface for FSP simulation (which is exposed via the Mojaloop SDK Scheme Adapter); and the configuration and control interface (aka Test API). The Test API allows a user to configure the simulator as well as to initiate FSP behaviours, such as quote requests, in order to exercise another FSPIOP implementation.

A diagram showing the logical architecture of the simulator in a test scenario can be found [here](docs/SimulatorArchitecture.jpg)

# Use

## Pre-requisites
  1. docker
  2. docker-compose


## Build
From the `./src` directory:
```bash
docker-compose build
```

## Run (Local)
From the `./src` directory:
```bash
docker-compose up
```


## Configure
A sample simulator configuration is given in the file `\src\.env`.
A sample scheme adapter configuration is given in the file `\local.env`.

Configuration of parties and test execution steps is via...TODO


## APIs
The simulator exposes a Mojaloop API endpoint. An openapi specification can be found here: `./src/simulator/api.yaml`.

The simulator Test API specification can be found here: `./src/test-api/api.yaml`.


## Test API
The test API enables a user to trigger outgoing requests (from the simulator to another Mojaloop API enabled peer) via the `/scenarios` endpoint.

### Finding container IP addresses
```bash
$ docker ps
CONTAINER ID        IMAGE                                         COMMAND                  CREATED             STATUS              PORTS               NAMES
1598270a6a8d        mojaloop-simulator-backend                      "/bin/sh -c 'node /s…"   7 minutes ago       Up 7 minutes        3000-3001/tcp       src_sim_1
61d2e85d6432        modusbox/mojaloop-sdk-scheme-adapter:latest   "node /src/index.js"     7 minutes ago       Up 7 minutes        3000/tcp            src_scheme-adapter_1
1839f939f79e        redis:5.0.4-alpine                            "docker-entrypoint.s…"   7 minutes ago       Up 7 minutes        6379/tcp            src_redis_1
$ docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' src_sim_1
172.20.0.4
```

### Example request

An example request that triggers and confirms an outgoing money transfer using Curl is provided below:

```bash
CONTAINER_NAME=$(docker ps -f ancestor=mojaloop-simulator-backend --format '{{.Names}}')
SIMULATOR_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CONTAINER_NAME")
curl -X POST \
  "http://$SIMULATOR_IP:3003/scenarios" \
  -H 'Content-Type: application/json' \
  -d '[
    {
        "name": "scenario1",
        "operation": "postTransfers",
        "body": {
            "from": {
                "displayName": "James Bush",
                "idType": "MSISDN",
                "idValue": "44123456789"
            },
            "to": {
                "idType": "MSISDN",
                "idValue": "44987654321"
            },
            "amountType": "SEND",
            "currency": "USD",
            "amount": "100",
            "transactionType": "TRANSFER",
            "note": "test payment",
            "homeTransactionId": "123ABC"
        }
    },
    {
        "name": "scenario2",
        "operation": "putTransfers",
        "params": {
            "transferId": "{{scenario1.result.transferId}}"
        },
        "body": {
            "acceptQuote": true
        }
    }
]'
```


## Mutual TLS

### Testing

#### Create secrets
Use the script in `./scripts/mutualtls.sh`. Secrets will be generated in `./src/secrets`

#### Test functionality
TODO

# Develop

## Build

Dirty build, tagged with '-local' (will build clean if you don't have uncommitted local changes):
```bash
make
```

Clean build:
```bash
make build_clean
```

Specifically versioned build (dirty if you have local changes):
```bash
make build_clean VER=whatever-you-like
```

## Push to repo
```bash
make push
```

## Run locally
```bash
docker-compose up
```
