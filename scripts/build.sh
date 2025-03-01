#!/bin/bash

# detects current os
echo "Detecting OS..."
OS=$(uname -s)

# ensure ./dockers/.env.dev exists
if [ ! -f "../dockers/.env.dev" ];
then
    echo "Loading environment variables from ./dockers/.env.dev..."
    set -o allexport
    source ./dockers/.env.dev
    set +o allexport
else
    echo "No ./dockers/.env.dev file found. Please create one."
    exit 1    
fi

# ensure docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install Docker."
    exit 1
fi

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

wait
echo "Building Docker containers..."

docker network create ft_transcendence_network || true

docker compose -f docker-compose.yml up --build -d > logs_containers.txt 2>&1 &

wait

echo "Waiting for PostgreSQL to be fully ready..."
until docker compose exec postgres psql -U admin -d ft_transcendence -c '\q' > /dev/null 2>&1; do
  echo "PostgreSQL not ready yet... Retrying in 5 seconds."
  sleep 5
done

echo "PostgreSQL is now ready!"

echo "Running Django migrations..."
rm -rf backend/config/migrations/
mkdir backend/config/migrations
touch backend/config/migrations/__init__.py
docker compose exec backend python /app/manage.py makemigrations --noinput
docker compose exec backend python /app/manage.py migrate --noinput
docker compose exec backend python /app/manage.py migrate authtoken

echo "Verifying database schema..."
docker compose exec postgres psql -U admin -d ft_transcendence -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

echo "Checking applied migrations..."
docker compose exec backend python /app/manage.py makemigrations
docker compose exec backend python /app/manage.py migrate config
docker compose exec backend python /app/manage.py showmigrations

echo "Loading initals data for Django..."
docker compose exec backend python /app/manage.py loaddata fixtures/initial_data.json

sleep 5

echo "Generating translation messages..."
docker exec -it ft_transcendence-backend django-admin makemessages -l fr -l es > make_message.txt 2>&1 &
docker exec -it ft_transcendence-backend django-admin compilemessages > compile_message.txt 2>&1 &

# wait for all background processes to complete
wait

echo "Containers are running!"
