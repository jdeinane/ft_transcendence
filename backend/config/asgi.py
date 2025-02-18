import os
import sys

# Ajouter `/app/src/` au `PYTHONPATH`
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Définir le module de configuration
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.asgi import get_asgi_application

application = get_asgi_application()
