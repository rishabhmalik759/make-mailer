#!/usr/bin/env bash

# picking up environment variables from calling script
set -e

# script directory
sd=`dirname $0`

# table schema directory 
SCHEMA_DIR=$sd/../schema
CREATE_ORDER_FILE=$SCHEMA_DIR/table_create_order.txt
table_schema_files=`cat $CREATE_ORDER_FILE`

# args
DB_NAME=$1

# Creating tables in order from table_create_order file
for schema_file in $table_schema_files; do
  echo "Creating table: $schema_file" 
  psql -U $POSTGRES_USER -d $DB_NAME -f $SCHEMA_DIR/$schema_file
done
