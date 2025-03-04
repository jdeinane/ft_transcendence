import json, threading, random, requests, time, pyotp
from datetime import datetime, timedelta
from rest_framework import views, viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from django.conf import settings
from django.db import connections
from django.db.models import Count, F
from django.utils import timezone
from django.utils.timezone import localtime
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth import get_user_model, authenticate
from config.ai import PongAI, TicTacToeAI
from config.models import (
    Tournament, TournamentPlayer, TournamentMatch, PongGame, TicTacToeGame,
    MatchHistory, Leaderboard, User, UserTwoFactor
)
from config.serializers import (
    UserSerializer, TournamentSerializer, TournamentMatchSerializer
)
from config.utils import (
    generate_and_send_2fa_code, generate_otp_secret, generate_tournament_bracket, generate_next_round
)
from django.utils.translation import activate
from django.utils.translation import gettext as _

User = get_user_model()

def wait_for_db():
	"""
	Attendre que la base de données soit prête.
	"""
	retries = 5
	while retries > 0:
		try:
			connections['default'].cursor()
			print("Database is ready.")
			return
		except Exception:
			print("Database not ready, retrying in 10 seconds...")
			time.sleep(10)
			retries -= 1
	raise Exception("Database connection failed after retries.")

wait_for_db()

# Gestion des Utilisateurs
class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_game(request):
	"""
	Enregistre un match et met à jour le nombre de parties jouées pour le joueur inscrit.
	"""
	try:
		player1 = request.user
		score_player1 = request.data.get("score_player1", 0)
		score_player2 = request.data.get("score_player2", 0)
		game_mode = request.data.get("game_mode", "solo")  

		print(f"📩 Requête reçue: score1={score_player1}, score2={score_player2}, mode={game_mode}")

		# céterminer le gagnant (ou nul si égalité)
		winner = player1 if score_player1 > score_player2 else (None if score_player1 == score_player2 else None)

		# enregistrer la partie
		game = PongGame.objects.create(
			player1=player1,
			player2=None,
			score_player1=score_player1,
			score_player2=score_player2,
			winner=winner
		)

		match = MatchHistory.objects.create(
			player1=player1,
			player2=None,
			winner=winner,
			game_type="pong",
			score_player1=score_player1,
			score_player2=score_player2
		)

		leaderboard_entry, _ = Leaderboard.objects.get_or_create(user=player1)
		leaderboard_entry.games_played = F("games_played") + 1
		if winner == player1:
			leaderboard_entry.games_won = F("games_won") + 1
			leaderboard_entry.points = F("points") + 3 
		leaderboard_entry.save()

		player1.increment_games_played()

		return Response({
			"message": "Game recorded successfully",
			"game_id": game.id,
			"number_of_games_played": player1.number_of_games_played
		})
	except Exception as e:
		print("❌ Erreur lors de l'enregistrement du match :", str(e))
		return Response({"error": "Erreur serveur"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_tic_tac_toe_game(request):
	"""
	Enregistre une partie de Tic Tac Toe et met à jour le nombre de parties jouées
	"""
	try:
		player1 = request.user
		game_mode = request.data.get("game_mode", "solo")
		score_player1 = request.data.get("score_player1", 0)
		score_player2 = request.data.get("score_player2", 0)
		is_draw = request.data.get("is_draw", False)

		if game_mode == "solo":
			player2 = None  
		else:
			player2_id = request.data.get("player2_id")
			player2 = User.objects.get(id=player2_id) if player2_id else None

		winner = None
		if not is_draw:
			if score_player1 > score_player2:
				winner = player1
			elif score_player2 > score_player1:
				winner = player2

		game = TicTacToeGame.objects.create(
			player1=player1,
			player2=player2,
			score_player1=score_player1,
			score_player2=score_player2,
			is_draw=is_draw
		)

		match = MatchHistory.objects.create(
			player1=player1,
			player2=player2,
			winner=winner,
			game_type="tictactoe",
			score_player1=score_player1,
			score_player2=score_player2
		)

		leaderboard_entry, _ = Leaderboard.objects.get_or_create(user=player1)
		leaderboard_entry.games_played = F("games_played") + 1
		if winner == player1:
			leaderboard_entry.games_won = F("games_won") + 1
			leaderboard_entry.points = F("points") + 3 
		leaderboard_entry.save()

		player1.increment_games_played()

		return Response({
			"message": "Tic Tac Toe game recorded successfully",
			"game_id": game.id,
			"number_of_games_played": player1.number_of_games_played
		})

	except Exception as e:
		print("❌ Erreur lors de l'enregistrement de la partie Tic Tac Toe :", str(e))
		return Response({"error": "Erreur serveur"}, status=500)

# API pour IA
@api_view(["POST"])
@permission_classes([AllowAny])
def pong_ai_move(request):
	"""
	Retourne le mouvement de l'IA en fonction de la position de la balle
	"""
	data = request.data
	ball_position = data.get("ball_position")
	paddle_position = data.get("paddle_position")
	difficulty = data.get("difficulty", "medium")

	ai = PongAI(difficulty)
	move = ai.move(ball_position, paddle_position)
	return Response({"move": move})


@api_view(["POST"])
def tictactoe_ai_move(request):
	"""
	Retourne le meilleur coup de l'IA pour TicTacToe
	"""
	print("📩 Requête reçue :", request.data)  # Debug
    
	try:
		data = request.data
		board = data.get("board")
		difficulty = data.get("difficulty", "medium")

		if not board or len(board) != 9:
			return Response({"error": "Board invalide"}, status=400)

		ai = TicTacToeAI(difficulty)

		if not hasattr(ai, "best_move"):
			return Response({"error": "Erreur: La classe TicTacToeAI ne contient pas best_move()"}, status=500)

		move = ai.best_move(board)

		if move is None:  # ⚠️ Si aucun coup possible
			return Response({"message": "Match nul, aucun coup possible."}, status=200)

		print(f"🤖 IA joue : {move}")  # Debug

		return Response({"move": move})

	except Exception as e:
		print("❌ Erreur backend :", str(e))  # Debug
		return Response({"error": "Erreur interne du serveur", "details": str(e)}, status=500)
		
# API pour langage
@api_view(["POST"])
def set_language(request):
	"""
	Change la langue de l'utilisateur.
	"""
	language = request.data.get("language")
	print(f"🌍 Requête reçue pour changer la langue en : {language}")

	if language in dict(settings.LANGUAGES):
		if request.user.is_authenticated:
			print(f"✅ Utilisateur {request.user.username} : mise à jour de la langue.")
			request.user.language = language
			request.user.save()

		activate(language)
		return Response({"message": f"Langue changée en {language}"})
	else:
		print("❌ Langue non supportée :", language)
		return Response({"error": "Langue non supportée"}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
	"""
	Authentification de l'utilisateur
	"""
	username = request.data.get('username')
	password = request.data.get('password')

	if not username or not password:
		return Response({'error': 'Nom d’utilisateur et mot de passe requis'}, status=400)

	user = authenticate(username=request.data["username"], password=request.data["password"])

	if user is not None:
		refresh = RefreshToken.for_user(user)
		return Response({
			'access': str(refresh.access_token),
			'refresh': str(refresh)
		})
	else:
		return Response({'error': 'Nom d’utilisateur ou mot de passe incorrect'}, status=401)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
	"""
	Renvoie les informations de l'utilisateur connecté
	"""
	try:
		token = request.headers.get('Authorization', '').split(' ')[1] 
		print("🛠️ Token reçu dans Django:", token)

		UntypedToken(token)
		user = request.user
		user.update_last_seen()

		return Response({
			"id": user.id,
			"username": user.username,
			"email": user.email,
			"two_factor_secret": user.two_factor_secret,
			"avatar_url": user.avatar_url if hasattr(user, "avatar_url") else "avataralien.png",
			"language": user.language,
			"number_of_games_played": user.number_of_games_played or 0,
			"last_seen": localtime(user.last_seen).strftime("%Y-%m-%d %H:%M:%S") 
		})
	except Exception as e:
		print("❌ Erreur de token:", str(e))
		return Response({"error": "Token invalide ou expiré"}, status=403)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
	"""
	Inscription d'un nouvel utilisateur.
	"""
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_avatar(request):
	"""
	Met à jour l'avatar de l'utilisateur authentifié.
	"""
	user = request.user
	new_avatar_url = request.data.get("avatar_url")

	valid_avatars = [
		"avataralien.png",
		"avatarboy1.png",
		"avatarboy2.png",
		"avatargirl1.png",
		"avatargirl2.png"
	]

	if new_avatar_url not in valid_avatars:
		return Response({"error": "Avatar non valide"}, status=400)

	user.avatar_url = new_avatar_url
	user.save()

	return Response({"message": "Avatar mis à jour avec succès", "avatar_url": user.avatar_url})

# APIs pour tournoi
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_tournament(request):
	"""
	Crée un tournoi et inscrit automatiquement le créateur comme participant.
	"""
	serializer = TournamentSerializer(data=request.data, context={"request": request})
	if serializer.is_valid():
		tournament = serializer.save(creator=request.user)
		TournamentPlayer.objects.create(tournament=tournament, player=request.user)
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_tournament(request, tournament_id):
	"""
	Permet à un utilisateur de rejoindre un tournoi si celui-ci est encore ouvert.
	"""
	tournament = get_object_or_404(Tournament, id=tournament_id)
	if tournament.status != "Pending":
		return Response({"error": "Le tournoi a déjà commencé."}, status=status.HTTP_400_BAD_REQUEST)

	if TournamentPlayer.objects.filter(tournament=tournament, player=request.user).exists():
		return Response({"error": "Vous êtes déjà inscrit à ce tournoi."}, status=status.HTTP_400_BAD_REQUEST)

	TournamentPlayer.objects.create(tournament=tournament, player=request.user)

	if tournament.players.count() == tournament.max_players:
		generate_tournament_bracket(tournament)
		tournament.status = "Ongoing"
		tournament.save()

	return Response({"message": "Inscription réussie !"}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_tournament(request, tournament_id):
	"""
	Permet à un utilisateur de quitter un tournoi tant qu'il n'a pas commencé.
	"""
	tournament = get_object_or_404(Tournament, id=tournament_id)
	if tournament.status != "Pending":
		return Response({"error": "Impossible de quitter un tournoi en cours."}, status=status.HTTP_400_BAD_REQUEST)

	participant = TournamentPlayer.objects.filter(tournament=tournament, player=request.user)
	if not participant.exists():
		return Response({"error": "Vous n'êtes pas inscrit à ce tournoi."}, status=status.HTTP_400_BAD_REQUEST)

	participant.delete()
	return Response({"message": "Vous avez quitté le tournoi avec succès."}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([AllowAny])
def list_tournaments(request):
	tournaments = Tournament.objects.all().order_by("-created_at")
	serializer = TournamentSerializer(tournaments, many=True)
	return Response(serializer.data)

@api_view(["GET"])
@permission_classes([AllowAny])
def list_tournament_matches(request, tournament_id):
	matches = TournamentMatch.objects.filter(tournament_id=tournament_id).order_by("round_number")
	serializer = TournamentMatchSerializer(matches, many=True)
	return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_match_result(request):
	"""
	Enregistre le résultat d'un match et génère la phase suivante si nécessaire.
	"""
	match = get_object_or_404(TournamentMatch, id=request.data.get("match_id"))

	if match.winner:
		return Response({"error": "Match déjà terminé."}, status=status.HTTP_400_BAD_REQUEST)

	winner = get_object_or_404(User, username=request.data.get("winner"))
	loser = match.player1 if match.player2 == winner else match.player2

	match.winner = winner
	match.loser = loser
	match.save()

	generate_next_round(match.tournament)

	return Response({"message": f"Résultat enregistré ! {winner.username} remporte le match."}, status=status.HTTP_200_OK)

@api_view(["GET"])
def get_tournament_winner(request, tournament_id):
	tournament = get_object_or_404(Tournament, id=tournament_id)
	return Response({"winner": tournament.winner.username if tournament.winner else "Not decided yet"})

@api_view(["GET"])
def get_tournament_details(request, tournament_id):
	"""
	Récupère les détails d'un tournoi spécifique.
	"""
	tournament = get_object_or_404(Tournament, id=tournament_id)
	serializer = TournamentSerializer(tournament)
	return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_tournament_game(request):
	"""
	Enregistre un match de tournoi et met à jour les tours suivants.
	"""
	match = get_object_or_404(TournamentMatch, id=request.data.get("match_id"))
	if match.winner:
		return Response({"error": "Match déjà terminé."}, status=status.HTTP_400_BAD_REQUEST)

	winner = get_object_or_404(User, username=request.data.get("winner"))
	loser = match.player1 if match.player2 == winner else match.player2

	match.winner = winner
	match.loser = loser
	match.save()

    remaining_players = match.tournament.players.exclude(id__in=match.tournament.matches.values_list("loser_id", flat=True))
    if remaining_players.count() == 1:
		match.tournament.declare_winner(remaining_players.first())

	return Response({"message": "Résultat du match enregistré.", "winner": winner.username}, status=status.HTTP_200_OK)

# Gestion des Jeux (Pong, Tic Tac Toe)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_game(request):
	"""
	Enregistre un match et met à jour le nombre de parties jouées pour le joueur inscrit.
	"""
	try:
		player1 = request.user  
		score_player1 = request.data.get("score_player1", 0)
		score_player2 = request.data.get("score_player2", 0)

		winner = player1 if score_player1 > score_player2 else None

		game = PongGame.objects.create(
			player1=player1,
			player2=None,  
			score_player1=score_player1,
			score_player2=score_player2,
			winner=winner
		)

		player1.increment_games_played()

		return Response({
			"message": "Game recorded successfully",
			"game_id": game.id,
			"number_of_games_played": player1.number_of_games_played
		})
	except Exception as e:
		return Response({"error": "Erreur serveur"}, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_tic_tac_toe_game(request):
	"""
	Enregistre un match de Tic-Tac-Toe et met à jour le nombre de parties jouées.
	"""
	try:
		player1 = request.user  
		score_player1 = request.data.get("score_player1", 0)
		score_player2 = request.data.get("score_player2", 0)

		# Déterminer le vainqueur
		winner = None
		if score_player1 > score_player2:
			winner = player1
		elif score_player2 > score_player1:
			winner = None  # À modifier si on gère un deuxième joueur

		# Enregistrer le match
		game = TicTacToeGame.objects.create(
			player1=player1,
			player2=None,  
			score_player1=score_player1,
			score_player2=score_player2,
			winner=winner
		)

		# Mettre à jour les statistiques du joueur
		player1.increment_games_played()

		return Response({
			"message": "Tic-Tac-Toe game recorded successfully",
			"game_id": game.id,
			"number_of_games_played": player1.number_of_games_played
		})
	except Exception as e:
		return Response({"error": "Erreur serveur"}, status=500)

@api_view(["POST"])
@permission_classes([AllowAny])
def pong_ai_move(request):
	"""
	Retourne le mouvement de l'IA en fonction de la position de la balle
	"""
	data = request.data
	ball_position = data.get("ball_position")
	paddle_position = data.get("paddle_position")
	difficulty = data.get("difficulty", "medium")

	ai = PongAI(difficulty)
	move = ai.move(ball_position, paddle_position)
	return Response({"move": move})

@api_view(["POST"])
def tictactoe_ai_move(request):
	"""
	Retourne le meilleur coup de l'IA pour TicTacToe
	"""
	try:
		data = request.data
		board = data.get("board")
		difficulty = data.get("difficulty", "medium")

		if not board or len(board) != 9:
			return Response({"error": "Board invalide"}, status=400)

		ai = TicTacToeAI(difficulty)
		move = ai.best_move(board)

		return Response({"move": move})
	except Exception as e:
		return Response({"error": "Erreur interne du serveur", "details": str(e)}, status=500)

# Gestion de l'Authentification 2FA
class Enable2FAView(APIView):
	"""
	Active le 2FA pour un utilisateur en générant un secret OTP
	"""
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		if user.two_factor_secret:
			return Response({"message": "Le 2FA est déjà activé."}, status=400)

		user.two_factor_secret = generate_otp_secret()
		user.save()

		return Response({"message": "2FA activé avec succès.", "otp_secret": user.two_factor_secret}, status=200)

class Generate2FAView(APIView):
	"""
	Génère et envoie un code 2FA à l'utilisateur authentifié.
	"""
	permission_classes = [IsAuthenticated]

	def post(self, request):
		try:
			generate_and_send_2fa_code(request.user)
			return Response({"message": "Le code 2FA a été envoyé à votre email."}, status=status.HTTP_200_OK)
		except ValueError as e:
			return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response({"error": "Une erreur est survenue. Contactez le support."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Verify2FAView(APIView):
	"""
	Vérifie un code OTP saisi par l'utilisateur
	"""
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		otp_code = request.data.get("otp_code")

		if not user.two_factor_secret:
			return Response({"error": "Le 2FA n'est pas activé."}, status=400)

		totp = pyotp.TOTP(user.two_factor_secret)
		if totp.verify(otp_code):
			return Response({"message": "Vérification réussie."}, status=200)
		else:
			return Response({"error": "Code 2FA invalide."}, status=400)

class Disable2FAView(APIView):
	"""
	Désactive le 2FA pour un utilisateur
	"""
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		user.two_factor_secret = None
		user.save()
		return Response({"message": "2FA désactivé avec succès."}, status=200)

def verify_2fa(request):
	if request.method == "POST":
		data = json.loads(request.body)
		otp_code = data.get("otp_code", "")

		user = request.user
		if not user.two_factor_secret:
			return JsonResponse({"error": "2FA non activé."}, status=400)

		totp = pyotp.TOTP(user.two_factor_secret)
		if totp.verify(otp_code, valid_window=1):
			user.register_2fa_success()
			user.set_token_expiry()

			return JsonResponse({"message": "2FA vérifié avec succès. Token valide 30 minutes."})

		user.register_2fa_failure()
		if user.failed_2fa_attempts >= 5:
			return JsonResponse({"error": "Trop de tentatives échouées. Essayez plus tard."}, status=403)

		return JsonResponse({"error": "Code 2FA invalide."}, status=400)

def check_token_expiry(user):
	if user.is_token_expired():
		return JsonResponse({"error": "Token expiré. Veuillez vous reconnecter."}, status=401)
	return None

def protected_view(request):
	response = check_token_expiry(request.user)
	if response:
		return response

	return JsonResponse({"message": "Accès autorisé avec Token valide."})

@api_view(["GET"])
@permission_classes([AllowAny])
def oauth_callback(request):
	"""
	Handles the OAuth callback from 42 and exchanges the code for an access token.
	"""
	code = request.GET.get("code")
	if not code:
		return JsonResponse({"error": "No authorization code provided."}, status=400)

	token_url = "https://api.intra.42.fr/oauth/token"
	token_data = {
		"client_id": settings.OAUTH_CLIENT_ID,
		"client_secret": settings.OAUTH_CLIENT_SECRET,
		"code": code,
		"redirect_uri": settings.OAUTH_REDIRECT_URI,
		"grant_type": "authorization_code",
	}
	token_response = requests.post(token_url, data=token_data)

	if token_response.status_code != 200:
		return JsonResponse(
			{"error": "Failed to fetch access token.", "details": token_response.json()},
			status=token_response.status_code,
		)

	access_token = token_response.json().get("access_token")
	if not access_token:
		return JsonResponse({"error": "Access token not found."}, status=400)

	# Fetch user data from 42 API
	user_info_url = "https://api.intra.42.fr/v2/me"
	user_info_headers = {"Authorization": f"Bearer {access_token}"}
	user_info_response = requests.get(user_info_url, headers=user_info_headers)

	if user_info_response.status_code != 200:
		return JsonResponse(
			{"error": "Failed to fetch user info.", "details": user_info_response.json()},
			status=user_info_response.status_code,
		)

	user_data = user_info_response.json()
	avatar_url = user_data.get("image", {}).get("link", "")

	user, created = User.objects.get_or_create(forty_two_id=user_data["id"])

	user.username = user_data.get("login", f"user_{user_data['id']}")
	user.email = user_data.get("email", f"user{user_data['id']}@42.fr")
	user.last_seen = timezone.now()
	if not user.language:
		user.language = "en"
	if avatar_url:
		user.avatar_url = avatar_url
	if created:
		user.number_of_games_played = 0
		if not avatar_url:
		user.avatar_url = "avataralien.png"
	user.update_last_seen()
	user.save()

	refresh = RefreshToken.for_user(user)

	frontend_url = "https://localhost:8443/#/oauth-success"
	return redirect(
		f"{frontend_url}?access_token={refresh.access_token}&user_id={user.id}"
		f"&username={user.username}&avatar_url={user.avatar_url}&email={user.email}"
		f"&language={user.language}&number_of_games_played={user.number_of_games_played}"
		f"&last_seen={user.last_seen.strftime('%Y-%m-%d %H:%M:%S')}"
	)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def match_history(request):
	"""
	Retourne l'historique des matchs de l'utilisateur connecté
	"""
	user = request.user
	matches = MatchHistory.objects.filter(player1=user).order_by("-created_at") | MatchHistory.objects.filter(player2=user).order_by("-created_at")

	match_data = [{
		"id": match.id,
		"player1": match.player1.username,
		"player2": match.player2.username if match.player2 else "AI",
		"winner": match.winner.username if match.winner else "Draw",
		"game_type": match.game_type.upper(),
		"score_player1": match.score_player1,
		"score_player2": match.score_player2,
		"created_at": match.created_at.strftime("%Y-%m-%d %H:%M:%S")
	} for match in matches]

	return Response({"matches": match_data}, status=200)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_leaderboard(request):
	"""
	Retourne le classement des joueurs basé sur les points.
	"""
	try:
		top_players = Leaderboard.objects.select_related("user").order_by("-points")[:10]  # Top 10 joueurs

		leaderboard_data = [
			{
				"rank": idx + 1,
				"username": player.user.username,
				"score": player.points
			}
			for idx, player in enumerate(top_players)
		]

		return Response(leaderboard_data, status=200)

	except Exception as e:
		print("❌ Erreur lors du chargement du leaderboard:", str(e))
		return Response({"error": "Erreur serveur"}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_rank(request):
	"""
	Retourne le classement d'un utilisateur spécifique.
	"""
	try:
		user_leaderboard = Leaderboard.objects.filter(user=request.user).first()
		if not user_leaderboard:
			return Response({"error": "Utilisateur non classé"}, status=404)

		rank = Leaderboard.objects.filter(points__gt=user_leaderboard.points).count() + 1
		return Response({"rank": rank, "points": user_leaderboard.points}, status=200)

	except Exception as e:
		print("❌ Erreur lors de la récupération du classement utilisateur:", str(e))
		return Response({"error": "Erreur serveur"}, status=500)
