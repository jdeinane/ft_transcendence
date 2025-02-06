#!/bin/bash

# detects current os
echo "Detecting OS..."
OS=$(uname -s)

# start docker only if running on linux
if [[ "$OS" == "Linux" ]];
then
    echo "Running on Linux: Checking Docker rootless mode..."
    if ! pgrep -x "dockerd" > /dev/null;
    then
        echo "Docker rootless mode is not active. Starting..."
        export PATH=$HOME/bin:$PATH
        export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
        dockerd-rootless.sh > /dev/null 2>&1 &
        sleep 5
    fi
elif [[ "$OS" == "Darwin" ]];
then
    echo "Running on macOS: Starting Colima..."
    colima start --cpu 4 --memory 4 --disk 20 --network-address
    export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
fi

echo "Rebuilding Docker containers..."

# start dev environment
echo "Starting development environment..."
docker-compose -f dockers/docker-compose.dev.yml up --build -d > logs_dev.txt 2>&1 &

# start prod environment
echo "Starting production environment..."
docker-compose -f docker-compose.yml up --build -d > logs_prod.txt 2>&1 &

# wait for all background processes to complete
wait

echo "Development and Production environments are running!"
