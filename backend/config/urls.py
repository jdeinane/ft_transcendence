from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from config.views import UserViewSet, set_language, login_view, register, get_current_user, join_tournament, leave_tournament, list_tournaments

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/', include(router.urls)),
	path('api/set-language/', set_language, name="set_language"),
    path('api/auth/register/', register, name="register"),
	path('api/auth/login/', login_view, name="login"),
	path('api/auth/me/', get_current_user, name="me"),
	path("api/tournaments/", list_tournaments, name="list_tournaments"),
    path("api/tournaments/join/<int:tournament_id>/", join_tournament, name="join_tournament"),
    path("api/tournaments/leave/<int:tournament_id>/", leave_tournament, name="leave_tournament"),
]
