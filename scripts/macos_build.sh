#!/bin/bash

# load environment variables from dockers/.env.dev
if [ -f dockers/.env.dev ];
then
	echo "Loading environment variables from dockers/.env.dev..."
	set -o allexport
	source dockers/.env.dev
	set +o allexport
else
	echo "Warning: dockers/.env.dev not found!"
fi

# check if Docker rootless is running
if ! docker info > /dev/null 2>&1;
then
    echo "Docker is not running. Please start Docker Desktop manually."
    exit 1
fi


# start prod environment
echo "Starting the production environment..."
docker-compose -f docker-compose.yml up --build -d > logs_prod.txt 2>&1 &

# start dev environment
echo "Starting the development environment..."
docker-compose -f dockers/docker-compose.dev.yml up --build -d > logs_dev.txt 2>&1 &

# wait for all background processes to complete
wait

echo "The development and production environments are running."
