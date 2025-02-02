#!/bin/bash

# is docker rootless mode running?
if ! systemctl --user is-active --quiet docker;
then
	echo "Docker rootless mode is not active. Starting..."
    systemctl --user start docker
    sleep 3  # waiting for docker to start
fi

# start environments in parallel with separate logs
echo "Starting the production environment..."
docker-compose -f docker-compose.yml up --build -d > logs_prod.txt 2>&1 &

echo "Starting the development environment..."
docker-compose -f docker-compose.dev.yml up --build -d > logs_dev.txt 2>&1 &

# wait for processes to finish
wait

echo "The development and production environments are running."
