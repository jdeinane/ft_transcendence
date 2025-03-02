from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from config.views import UserViewSet, pong_ai_move, tictactoe_ai_move, login_view, register, get_current_user, join_tournament, leave_tournament, list_tournaments, Generate2FAView, Enable2FAView, Disable2FAView, Verify2FAView, update_avatar, set_language, end_game, end_tic_tac_toe_game, end_tournament_game, oauth_callback
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", register, name="register"),
    path("api/auth/login/", login_view, name="login"),
    path("api/auth/me/", get_current_user, name="get_current_user"),
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
    path("api/game/tictactoe-ai-move/", tictactoe_ai_move, name="tictactoe-ai-move"),
	path("api/auth/set-language/", set_language, name="set_language"),
    path("api/users/current/", get_current_user, name="get_current_user"),
	path("api/game/end-game/", end_game, name="end_game"),
	path("api/game/end-tic-tac-toe-game/", end_tic_tac_toe_game, name="end_tic_tac_toe_game"),
	path("api/game/end-tournament-game/", end_tournament_game, name="end_tournament_game"),
	path('api/auth/42/callback/', oauth_callback, name='oauth_callback'),

]
