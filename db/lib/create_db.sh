#!/usr/bin/env bash

# picking up environment variables from calling script
set -e

# args
DB_NAME=$1
DB_OWNER=$2

# postgres login command
export POSTGRES_CMD="psql -U ${POSTGRES_USER}"

$POSTGRES_CMD <<EOSQL
CREATE DATABASE $DB_NAME OWNER $DB_OWNER;
EOSQL
