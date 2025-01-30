#!/bin/bash

service postgresql start;

sleep 5

sudo -u postgres psql <<EOF
-- create the database if not already exist
DO \$\$
BEGIN
	IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${PSQL_DATABASE}') THEN
		CREATE DATABASE "${PSQL_DATABASE}";
	END IF;
END;
\$\$;

-- create the user if not already exist
DO \$\$
BEGIN
	IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${PSQL_USER}') THEN
		CREATE USER "${PSQL_USER}" WITH PASSWORD '${PSQL_PASSWD}';
	END IF;
END;
\$\$

-- grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE "${PSQL_DATABASE}" TO "${PSQL_USER}";

-- set the passwd for the postgresql root
ALTER USER postgres WITH PASSWORD '${PSQL_ROOT_PASSWD}';
EOF

# stop postgresql server gracefully
sudo -u postgres pg_ctlcluster 12 main stop

exec postgres -D /var/lib/postgresql/data
