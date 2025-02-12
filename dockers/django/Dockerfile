# utilisation de l'image Python légère
FROM python:3.11-slim

# installation des dépendances système
RUN apt-get update -y && \
    apt-get install -y bash sudo passwd python3-venv python3-pip && \
    rm -rf /var/lib/apt/lists/*

# définir le répertoire de travail
WORKDIR /app

# création d'un utilisateur non-root
RUN useradd -m -s /bin/bash django_user && \
    echo "django_user ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/django_user

# donner la permission à l'utilisateur sur /app
RUN mkdir -p /app/venv && chown -R django_user:django_user /app

# Ccpier seulement le fichier de dépendances pour l'installation
COPY --chown=django_user:django_user backend/requirements.txt /app/

# passer en utilisateur non-root
USER django_user

# créer l'environnement virtuel et installer les dépendances
RUN python3 -m venv /app/venv && \
    /app/venv/bin/python -m ensurepip --default-pip && \
    /app/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /app/venv/bin/pip install --no-cache-dir -r /app/requirements.txt && \
    /app/venv/bin/pip install --no-cache-dir gunicorn


# copier le reste du code backend sans écraser /venv
COPY --chown=django_user:django_user backend/ /app/

# si 'manage.py' n'existe pas, créer un projet Django
RUN if [ ! -f "/app/manage.py" ]; then \
        /app/venv/bin/django-admin startproject config /app/; \
    fi

# variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings \
    PATH="/app/venv/bin:$PATH"

# exposition du port de Django
EXPOSE 8000

# lancer Gunicorn
CMD ["bash", "-c", "/app/venv/bin/gunicorn --bind 0.0.0.0:8000 config.wsgi:application"]