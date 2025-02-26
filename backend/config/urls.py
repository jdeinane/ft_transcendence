from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from config.views import UserViewSet, join_matchmaking, leave_matchmaking, set_language, login_view, register, get_current_user, update_avatar, RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/matchmaking/join/', join_matchmaking, name="join_matchmaking"),
    path('api/matchmaking/leave/', leave_matchmaking, name="leave_matchmaking"),
    path('api/set-language/', set_language, name="set_language"),
    path('api/auth/register/', register, name="register"),
	path('api/auth/login/', login_view, name="login"),
	path('api/auth/me/', get_current_user, name="me"),
    path('api/auth/update-avatar/', update_avatar, name="update_avatar"),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]
