#!/bin/bash


# stop and rm containers, volumes & networks for dev & prod
echo "Stopping and removing containers..."
docker-compose -f docker-compose.yml down -v --remove-orphans
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
echo "All Docker services have been stopped and cleaned up."

# remove unused Docker volumes
echo "Removing unused volumes..."
docker volume prune -f

echo "Removing unused networks..."
docker network prune -f

echo "Cleanup completed!"
