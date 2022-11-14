#!/usr/bin/env bash

# script directory
sd=`dirname $0`

# environment variable
export POSTGRES_USER=postgres

# Database that will be created, retrieved from db_name.txt
DB_NAME=`cat ${sd}/db_name.txt`

echo "Initializing databases..."

export PGPASSWORD
export DROPTABLES=N

printf "Enter password: "
read -s PGPASSWORD

printf "\ndrop tables[N/y]?: "
read -s DROPTABLES

if [ $DROPTABLES = "y" ] || [ $DROPTABLES = "Y" ] ; then
  echo "Dropping old tables..."
  psql -U $POSTGRES_USER -d $DB_NAME -f $sd/../lib/drop_tables.sql
fi

echo "Creating database: ${DB_NAME} ..."
$sd/../lib/create_db.sh $DB_NAME $POSTGRES_USER

echo "Creating extensions..."
psql -U $POSTGRES_USER -d $DB_NAME -f $sd/create_extensions.sql

echo "Creating tables..."
$sd/../lib/create_all_tables.sh $DB_NAME

echo "Database initialization complete."
