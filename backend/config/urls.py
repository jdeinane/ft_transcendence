from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from config.views import UserViewSet, pong_ai_move, login_view, register, get_current_user, join_tournament, leave_tournament, list_tournaments, Generate2FAView, Enable2FAView, Disable2FAView, Verify2FAView, update_avatar, RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", register, name="register"),
    path("api/auth/login/", login_view, name="login"),
    path("api/auth/me/", get_current_user, name="me"),
    path("api/auth/generate-2fa/", Generate2FAView.as_view(), name="generate-2fa"),
    path("api/auth/enable-2fa/", Enable2FAView.as_view(), name="enable-2fa"),
    path("api/auth/verify-2fa/", Verify2FAView.as_view(), name="verify-2fa"),
    path("api/auth/disable-2fa/", Disable2FAView.as_view(), name="disable-2fa"),
    path("api/tournaments/join/<int:tournament_id>/", join_tournament, name="join_tournament"),
    path("api/tournaments/leave/<int:tournament_id>/", leave_tournament, name="leave_tournament"),
    path('api/auth/update-avatar/', update_avatar, name="update_avatar"),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('api/game/ai-move/', pong_ai_move, name="pong_ai_move"),

]
