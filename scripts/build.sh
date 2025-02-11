#!/bin/bash

echo "Détection du système d'exploitation..."
OS=$(uname -s)

# vérifier si `.env.dev` existe avant de continuer
if [ ! -f "./dockers/.env.dev" ];
then
    echo "Fichier .env.dev introuvable ! Veuillez en créer un."
    exit 1    
else
    echo "Chargement des variables d'environnement depuis .env.dev..."
    set -o allexport
    source ./dockers/.env.dev
    set +o allexport
fi

# vérifier si Docker est installé
if ! command -v docker &> /dev/null;
then
    echo "Docker n'est pas installé ! Installez-le et réessayez."
    exit 1
fi

# démarrer Docker rootless sur Linux
if [[ "$OS" == "Linux" ]];
then
    echo "Exécution sous Linux : Vérification du mode rootless..."
    
    if command -v dockerd-rootless.sh &> /dev/null && ! pgrep -x "dockerd" > /dev/null; then
        echo "Mode rootless non actif, démarrage..."
        export PATH=$HOME/bin:$PATH
        export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
        dockerd-rootless.sh > /dev/null 2>&1 &
        sleep 5
    fi

# démarrer Colima sur macOS
elif [[ "$OS" == "Darwin" ]];
then
    echo "Exécution sous macOS : Vérification de Colima..."
    
    if ! colima status &> /dev/null;
    then
        echo "Démarrage de Colima..."
        colima start --cpu 4 --memory 4 --disk 20 --network-address
    else
        echo "Colima est déjà en cours d'exécution."
    fi
    export DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
fi

echo "Reconstruction des conteneurs Docker..."

# construire et démarrer les conteneurs avec build forcé
echo "Démarrage de l'environnement de développement..."
docker-compose -f dockers/docker-compose.dev.yml up --build -d > logs_dev.txt 2>&1 &

# attendre que le conteneur backend soit prêt
echo "Attente du démarrage du conteneur backend..."
while ! docker ps --format '{{.Names}}' | grep -q "dockers-backend-1";
do
    sleep 2
    echo "En attente du conteneur..."
done

# attendre que les conteneurs soient en cours d'exécution
sleep 5

# vérifier si `manage.py` existe, sinon le créer automatiquement
echo "Vérification de l'existence de manage.py..."
docker exec -it dockers-backend-1 bash -c "
if [ ! -f '/app/manage.py' ];
then
    echo '⚡ Création automatique du projet Django...'
    /app/venv/bin/django-admin startproject config /app/
fi"

# démarrer l'environnement de production
echo "Démarrage de l'environnement de production..."
docker-compose -f docker-compose.yml up --build -d > logs_prod.txt 2>&1 &

# attendre la fin des processus en arrière-plan
wait

echo "Déploiement terminé avec succès ! Les environnements de développement et production sont actifs."
