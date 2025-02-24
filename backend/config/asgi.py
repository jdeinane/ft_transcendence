import os
import sys
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from config.routing import websocket_urlpatterns
from channels.layers import get_channel_layer

# ajouter '/app/src/' au 'PYTHONPATH'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# définir le module de configuration
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
	"websocket": URLRouter(websocket_urlpatterns),
})

channel_layer = get_channel_layer()
