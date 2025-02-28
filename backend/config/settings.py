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
    "daphne",  # WebSockets avec Django Channels
    "channels",  # gestion des WebSockets
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
	"corsheaders",
    "rest_framework",  # API REST Django
    "rest_framework_simplejwt",
	"rest_framework.authtoken", # 2FA
    "config",  # application principale
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
		'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

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

CORS_ALLOWED_ORIGINS = [
    "https://localhost:8443",  # Nginx (frontend)
    "http://localhost:4000",   # Backend local
    "http://127.0.0.1:4000",   # Backend via localhost
    "http://127.0.0.1:5000",   # Backend via autre port
]

MIDDLEWARE.insert(1, "corsheaders.middleware.CorsMiddleware")
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["Authorization", "Content-Type"]

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
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "ft_transcendence"),
        "USER": os.getenv("POSTGRES_USER", "admin"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "ChangeMe42!"),
        "HOST": os.getenv("POSTGRES_HOST", "ft_transcendence_postgres"),
        "PORT": int(os.getenv("POSTGRES_PORT", 5432)),
		"OPTIONS": {
            "options": "-c search_path=public"
        },
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

# --------------------
# Email Configuration
# --------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')

# --------------------
# Time & Date
# --------------------
TIME_ZONE = "Europe/Paris"
USE_TZ = True