#!/bin/bash

# stop and rm containers, volumes & networks for dev & prod
echo "Stopping and removing containers..."
docker compose -f docker-compose.yml down -v --remove-orphans
docker compose -f dockers/docker-compose.dev.yml down -v --remove-orphans
echo "All Docker services have been stopped and cleaned up."

# remove unused Docker volumes
echo "Removing unused Docker volumes..."
docker volume prune -f

# remove unused Docker networks
echo "Removing unused Docker networks..."
docker network prune -f

# remove old Docker build cache
echo "Removing old Docker build cache..."
docker builder prune -af

# remove all unused Docker resources
echo "Removing all unused Docker resources..."
docker system prune -af

# remove logs.txt
rm -rf logs_prod.txt
rm -rf logs_dev.txt

echo "Cleanup completed!"
