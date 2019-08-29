#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

OUTPUT_DIR="$DIR/../src/secrets/"

# Create directory
mkdir -p "$OUTPUT_DIR"

# Server certificate

## Generate a CA
openssl req -new -nodes -x509 -days 10000 -keyout "$OUTPUT_DIR/cakey.pem" -out "$OUTPUT_DIR/cacert.pem" -subj '/CN=ca.localhost'

## Generate a server key
openssl genrsa -out "$OUTPUT_DIR/serverkey.pem" 4096

## Generate a server certificate signing request
openssl req -new -key "$OUTPUT_DIR/serverkey.pem" -out "$OUTPUT_DIR/servercsr.pem" -subj '/CN=server.localhost'

## Sign certificate using the CA
openssl x509 -req -days 10000 -in "$OUTPUT_DIR/servercsr.pem" -CA "$OUTPUT_DIR/cacert.pem" -CAkey "$OUTPUT_DIR/cakey.pem" -CAcreateserial -out "$OUTPUT_DIR/servercert.pem"

## Verify server certificate
openssl verify -CAfile "$OUTPUT_DIR/cacert.pem" "$OUTPUT_DIR/servercert.pem"

# Client certificate

## Generate client key
openssl genrsa -out "$OUTPUT_DIR/client0key.pem" 4096

## Generate client certificate signing request
openssl req -new -key "$OUTPUT_DIR/client0key.pem" -out "$OUTPUT_DIR/client0csr.pem" -subj '/CN=client.localhost'

## Sign client cert using CA
openssl x509 -req -days 10000 -in "$OUTPUT_DIR/client0csr.pem" -CA "$OUTPUT_DIR/cacert.pem" -CAkey "$OUTPUT_DIR/cakey.pem" -CAcreateserial -out "$OUTPUT_DIR/client0cert.pem"

## Verify client cert
openssl verify -CAfile "$OUTPUT_DIR/cacert.pem" "$OUTPUT_DIR/client0cert.pem"
