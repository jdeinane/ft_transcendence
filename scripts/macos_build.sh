#!/bin/bash

# load environment variables from dockers/.env
if [ -f dockers/.env ];
then
	echo "Loading environment variables from dockers/.env..."
	set -o allexport
	source dockers/.env
	set +o allexport
else
	echo "Warning: dockers/.env not found!"
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
cd dockers/
docker-compose -f docker-compose.dev.yml up --build -d > logs_dev.txt 2>&1 &
cd ../

# wait for all background processes to complete
wait

echo "The development and production environments are running."
