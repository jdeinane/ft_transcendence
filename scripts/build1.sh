#!/bin/bash

echo "Detecting OS..."
OS=$(uname -s)

# ✅ Vérification des variables d'environnement
if [ ! -f "./dockers/.env.dev" ]; then
    echo "No ./dockers/.env.dev file found. Please create one."
    exit 1    
fi

# ✅ Vérification de l'installation de Docker
if ! command -v docker &> /dev/null; then
    echo "Docker could not be found. Please install Docker."
    exit 1
fi

# ✅ Démarrage spécifique selon l'OS
if [[ "$OS" == "Linux" ]]; then
    echo "Running on Linux: Checking Docker rootless mode..."
    if ! pgrep -x "dockerd" > /dev/null; then
        echo "Docker rootless mode is not active. Starting..."
        export PATH=$HOME/bin:$PATH
        export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
        dockerd-rootless.sh > /dev/null 2>&1 &
        sleep 5
    fi
elif [[ "$OS" == "Darwin" ]]; then
    echo "Running on macOS: Starting Colima..."
    colima start --cpu 4 --memory 4 --disk 20 --network-address
    export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
fi

# ✅ Démarrer la base de données AVANT tout, mais PAS le backend
echo "🚀 Starting database services (PostgreSQL & Redis)..."
docker compose up -d postgres redis > logs_dev.txt 2>&1 &

# ✅ Attendre que PostgreSQL soit prêt avant `migrate`
wait_for_postgres() {
    echo "⌛ Waiting for PostgreSQL to be ready..."
    until docker compose exec postgres pg_isready -U admin; do
        sleep 10
        echo "⏳ Still waiting for database connection..."
    done
    echo "✅ PostgreSQL is ready!"
}

wait_for_postgres  # ✅ On attend la BDD avant `migrate`

# ✅ Appliquer les migrations une fois la base prête
echo "⚙️ Running Django migrations..."
docker compose exec backend python3 /backend/manage.py makemigrations config
docker compose exec backend python3 /backend/manage.py migrate

# ✅ Vérifier immédiatement après `migrate`
echo "🔍 Verifying applied migrations..."
docker compose exec backend python3 /backend/manage.py showmigrations

# ✅ Attendre 5 secondes pour s'assurer que `migrate` est bien terminé
sleep 5

# ✅ Démarrer le backend après `migrate`
echo "🚀 Starting backend..."
docker compose up --build -d backend > logs_dev.txt 2>&1 &

# ✅ Attendre que le backend soit bien en place avant `loaddata`
echo "⌛ Waiting 10 seconds for backend to stabilize..."
sleep 10

# ✅ Vérifier si `config_user` existe AVANT `loaddata`
echo "🔍 Checking if config_user exists before loading data..."
docker compose exec backend python3 /backend/manage.py shell -c "
from django.db import connection;
cursor = connection.cursor();
cursor.execute(\"SELECT 1 FROM config_user LIMIT 1;\");
print(cursor.fetchall())
"

# ✅ Charger les données une fois que `backend` est actif
echo "📥 Loading initial data for Django..."
docker compose exec backend python3 /backend/manage.py loaddata backend/fixtures/initial_data.json

# ✅ Générer les fichiers de traduction après que tout soit bien en place
echo "🌍 Generating translation messages..."
docker compose exec backend django-admin makemessages -l fr -l es
docker compose exec backend django-admin compilemessages

# ✅ Attendre que tout soit bien chargé avant de finir
wait

echo "✅ Development environment is running!"
