#!/bin/bash

# detects current os
echo "Detecting OS..."
OS=$(uname -s)

# ensure correct Docker environment
if [[ "$OS" == "Darwin" ]];
then
    echo "Running on macOS: Setting Colima Docker environment..."
    export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
fi

# stop and remove containers, volumes & networks for dev & prod
echo "Stopping and removing containers..."
docker compose -f docker-compose.yml down -v --remove-orphans
docker compose -f dockers/docker-compose.dev.yml down -v --remove-orphans
echo "All Docker services have been stopped and cleaned up."

# remove unused Docker volumes
echo "Removing unused Docker volumes..."
docker volume prune -f

# remove unused Docker networks
echo "removing unused Docker networks..."
docker network prune -f

# remove old Docker build cache
echo "Removing old Docker build cache..."
docker builder prune -af

# remove all unused Docker resources
echo "Removing all unused Docker resources..."
docker system prune -af

# remove logs
echo "Deleting log files..."
rm -rf logs_containers.txt make_message.txt compile_message.txt database.txt

echo "Cleanup completed!"
