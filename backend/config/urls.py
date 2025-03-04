from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from config.views import (
    UserViewSet, register, set_language, pong_ai_move, tictactoe_ai_move, login_view, get_current_user, oauth_callback,
    create_tournament, join_tournament, leave_tournament, list_tournaments, get_tournament_details, end_tournament_game,
    list_tournament_matches, submit_match_result, get_tournament_winner, get_leaderboard, get_user_rank, match_history,
    Generate2FAView, Enable2FAView, Disable2FAView, Verify2FAView, update_avatar, end_game, end_tic_tac_toe_game
)

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
	path("admin/", admin.site.urls),
	path("auth/register/", register, name="register"),
	path("api/auth/login/", login_view, name="login"),
	path("api/auth/me/", get_current_user, name="get_current_user"),
	path("api/auth/generate-2fa/", Generate2FAView.as_view(), name="generate-2fa"),
	path("api/auth/enable-2fa/", Enable2FAView.as_view(), name="enable-2fa"),
	path("api/auth/verify-2fa/", Verify2FAView.as_view(), name="verify-2fa"),
	path("api/auth/disable-2fa/", Disable2FAView.as_view(), name="disable-2fa"),
	path("api/auth/update-avatar/", update_avatar, name="update_avatar"),
	path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
	path("api/game/ai-move/", pong_ai_move, name="pong_ai_move"),
	path("api/game/tictactoe-ai-move/", tictactoe_ai_move, name="tictactoe-ai-move"),
	path("api/auth/set-language/", set_language, name="set_language"),
	path("api/users/current/", get_current_user, name="get_current_user"),
	path("api/game/end-game/", end_game, name="end_game"),
	path("api/game/end-tic-tac-toe-game/", end_tic_tac_toe_game, name="end_tic_tac_toe_game"),
	path("api/game/end-tournament-game/", end_tournament_game, name="end_tournament_game"),
	path("api/auth/42/callback/", oauth_callback, name="oauth_callback"),
	path("api/tournaments/create/", create_tournament, name="create-tournament"),
	path("api/tournaments/<int:tournament_id>/join/", join_tournament, name="join-tournament"),
	path("api/tournaments/<int:tournament_id>/leave/", leave_tournament, name="leave-tournament"),
	path("api/tournaments/", list_tournaments, name="list-tournaments"),
	path("api/tournaments/<int:tournament_id>/", get_tournament_details, name="tournament-details"),
	path("api/tournaments/<int:tournament_id>/matches/", list_tournament_matches, name="list-matches"),
	path("api/tournaments/match/result/", submit_match_result, name="submit-match-result"),
	path("api/tournaments/<int:tournament_id>/winner/", get_tournament_winner, name="tournament-winner"),
	path('api/auth/42/callback/', oauth_callback, name='oauth_callback'),
	path("api/match-history/", match_history, name="match_history"),
    path("api/leaderboard/", get_leaderboard, name="get_leaderboard"),
    path("api/user/rank/", get_user_rank, name="get_user_rank"),
]
