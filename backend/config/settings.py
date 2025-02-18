import os
from pathlib import Path

# --------------------
# Base settings
# --------------------
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'change_me')
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    "localhost", "127.0.0.1",
    "backend", "nginx",
    "ft_transcendence.42.fr"
]

CSRF_TRUSTED_ORIGINS = [
    "https://ft_transcendence.42.fr"
]

# --------------------
# Installed apps
# --------------------
INSTALLED_APPS = [
	'daphne',  # WebSockets avec Django Channels
    'channels',  # gestion des WebSockets
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # API REST Django
    'config',  # application principale
]

# --------------------
# Middleware
# --------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --------------------
# Root URLs & WSGI / ASGI
# --------------------
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'  # pour Django Channels

# --------------------
# Database (PostgreSQL)
# --------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'ft_transcendence'),
        'USER': os.getenv('POSTGRES_USER', 'admin'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'ChangeMe42!'),
        'HOST': os.getenv('POSTGRES_HOST', 'ft_transcendence-postgres-1'),
        'PORT': int(os.getenv('POSTGRES_PORT', 5432)),
    }
}

# --------------------
# Channels & WebSockets
# --------------------
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}

# --------------------
# Templates & Static Files
# --------------------
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

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# --------------------
# Authentication
# --------------------
AUTH_USER_MODEL = "config.User"

# --------------------
# Default Auto Field
# --------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --------------------
# Languages
# --------------------
LANGUAGES = [
    ('en', 'English'),
    ('fr', 'Français'),
    ('es', 'Español'),
]

# default language
LANGUAGE_CODE = 'en'

# enable traduction
USE_I18N = True
USE_L10N = True

# define directory for traduction
LOCALE_PATHS = [
    BASE_DIR / 'locale'
]
