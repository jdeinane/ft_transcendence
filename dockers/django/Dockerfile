# utilisation de l'image Python légère
FROM python:3.11-slim

# installation des dépendances système
RUN apt-get update -y && \
    apt-get install -y bash sudo passwd python3-venv python3-pip postgresql-client gettext && \
    rm -rf /var/lib/apt/lists/*

# définir le répertoire de travail
WORKDIR /app

# création d'un utilisateur non-root
RUN useradd -m -s /bin/bash django_user && \
    echo "django_user ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/django_user

# donner les permissions à l'utilisateur sur /app
RUN chown -R django_user:django_user /app

# copier seulement 'requirements.txt' pour optimiser le cache Docker
COPY --chown=django_user:django_user backend/requirements.txt /app/

# passer en utilisateur non-root
USER django_user

# créer l'environnement virtuel et installer les dépendances
RUN python3 -m venv /app/venv && \
    /app/venv/bin/python3 -m ensurepip --default-pip && \
    /app/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /app/venv/bin/pip install --no-cache-dir -r /app/requirements.txt

# copier le reste du code backend après l’installation des dépendances
COPY --chown=django_user:django_user backend/ /app/

# vérifier si app/src existe et créer un projet Django
RUN mkdir -p /app/src && \
    if [ ! -d "/app/src/config" ]; then \
        /app/venv/bin/django-admin startproject config /app/src/ && \
        mv /app/src/manage.py /app/manage.py; \
    fi


# variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app/src" \
    DJANGO_SETTINGS_MODULE=config.settings \
    PATH="/app/venv/bin:$PATH"

EXPOSE 8000

# lancer Gunicorn
CMD ["/app/venv/bin/gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "config.wsgi:application"]
