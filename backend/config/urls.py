from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from config.views import UserViewSet
from config.views import join_matchmaking, leave_matchmaking
from config.views import set_language

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/', include(router.urls)),
]

urlpatterns += [
	path('api/matchmaking/join/', join_matchmaking, name="join_matchmaking"),
	path('api/matchmaking/leave/', leave_matchmaking, name="leave_matchmaking"),
    path('api/set-language/', set_language, name="set_language"),
]
