import os
from pathlib import Path

# Définition de BASE_DIR pour correspondre à /app/src dans Docker
BASE_DIR = Path(__file__).resolve().parent.parent

# Définir le SECRET_KEY (à remplacer en prod par une variable d'environnement)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key')

# Activer le mode debug en dev
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

# Définir les hôtes autorisés (mettre '*' en dev, restreindre en prod)
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '*').split(',')

# Applications installées
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

# Middleware Django
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL de la configuration principale
ROOT_URLCONF = 'config.urls'

# Configuration des templates Django
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Configuration WSGI
WSGI_APPLICATION = 'config.wsgi.application'

# Base de données (PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'ft_transcendence'),
        'USER': os.getenv('POSTGRES_USER', 'Nimda'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'nimdAmAI42'),
        'HOST': os.getenv('POSTGRES_HOST', 'postgres'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# Configuration des fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
