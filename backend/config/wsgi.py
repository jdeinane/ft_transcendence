import os, sys
from django.core.wsgi import get_wsgi_application

# définir le bon module de configuration
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()
