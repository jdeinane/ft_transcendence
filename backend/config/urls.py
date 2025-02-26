from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from config.views import UserViewSet
from config.views import join_tournament, leave_tournament, list_tournaments
from config.views import set_language

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/', include(router.urls)),
]

urlpatterns += [
    path("api/tournaments/", list_tournaments, name="list_tournaments"),
    path("api/tournaments/join/<int:tournament_id>/", join_tournament, name="join_tournament"),
    path("api/tournaments/leave/<int:tournament_id>/", leave_tournament, name="leave_tournament"),
]
