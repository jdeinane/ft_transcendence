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
from django.utils import timezone
from django.utils.timezone import localtime
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, authenticate
from config.models import Tournament, TournamentPlayer, TournamentMatch, PongGame, TicTacToeGame, UserTwoFactor
from config.serializers import UserSerializer, Enable2FASerializer, Verify2FASerializer
from config.ai import PongAI, TicTacToeAI
from config.utils import generate_and_send_2fa_code, generate_otp_secret
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
			"avatar_url": user.avatar_url if hasattr(user, "avatar_url") else None,
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

# API pour OAuth42
@api_view(["GET"])
@permission_classes([AllowAny])
def oauth_callback(request):
    return Response({"message": "OAuth callback"}, status=200)

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

# APIs pour tournoi
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_tournament(request):
	"""
	Permet à un utilisateur authentifié de créer un tournoi.
	"""
	serializer = TournamentSerializer(data=request.data, context={"request": request})
	if serializer.is_valid():
		serializer.save(creator=request.user)
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_tournament(request, tournament_id):
	tournament = get_object_or_404(Tournament, id=tournament_id)

	if tournament.status != "Pending":
		return Response({"error": "Le tournoi a déjà commencé."}, status=status.HTTP_400_BAD_REQUEST)

	if tournament.players.count() >= tournament.max_players:
		return Response({"error": "Le tournoi est complet."}, status=status.HTTP_400_BAD_REQUEST)

	# Vérifier si l'utilisateur est déjà inscrit
	if TournamentPlayer.objects.filter(tournament=tournament, player=request.user).exists():
		return Response({"error": "Vous êtes déjà inscrit."}, status=status.HTTP_400_BAD_REQUEST)

	TournamentPlayer.objects.create(tournament=tournament, player=request.user)

	if tournament.players.count() == tournament.max_players:
		tournament.status = "Ongoing"
		tournament.save()
		generate_tournament_bracket(tournament)  # Génère les matchs

	return Response({"message": "Inscription réussie !"}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_tournament(request, tournament_id):
	"""
	Permet à un joueur de quitter un tournoi avant qu'il ne commence.
	"""
	tournament = get_object_or_404(Tournament, id=tournament_id)

	# Vérifier si le tournoi a déjà commencé
	if tournament.status != "Pending":
		return Response({"error": "Impossible de quitter un tournoi en cours."}, status=status.HTTP_400_BAD_REQUEST)

	# Vérifier si le joueur est inscrit
	participant = TournamentPlayer.objects.filter(tournament=tournament, player=request.user)
	if not participant.exists():
		return Response({"error": "Vous n'êtes pas inscrit à ce tournoi."}, status=status.HTTP_400_BAD_REQUEST)

	# Supprimer l'inscription du joueur
	participant.delete()

	return Response({"message": "Vous avez quitté le tournoi avec succès."}, status=status.HTTP_200_OK)

@api_view(["GET"])
def list_tournaments(request):
	tournaments = Tournament.objects.all().order_by("-created_at")
	serializer = TournamentSerializer(tournaments, many=True)
	return Response(serializer.data)

@api_view(["GET"])
def list_tournament_matches(request, tournament_id):
	matches = TournamentMatch.objects.filter(tournament_id=tournament_id).order_by("round_number")
	serializer = TournamentMatchSerializer(matches, many=True)
	return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_match_result(request):
	match = get_object_or_404(TournamentMatch, id=request.data.get("match_id"))

	if match.winner:
		return Response({"error": "Match déjà terminé."}, status=status.HTTP_400_BAD_REQUEST)

	winner = get_object_or_404(User, username=request.data.get("winner"))
	loser = match.player1 if match.player2 == winner else match.player2

	match.winner = winner
	match.loser = loser
	match.save()

	# Vérifier si le tournoi est terminé
	remaining_players = match.tournament.players.exclude(id__in=match.tournament.matches.values_list("loser_id", flat=True))
	if remaining_players.count() == 1:
		match.tournament.declare_winner(remaining_players.first())

	return Response({"message": "Résultat enregistré !"}, status=status.HTTP_200_OK)

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
	Enregistre le résultat d'un match de tournoi et met à jour les tours suivants.
	"""
	try:
		match = get_object_or_404(TournamentMatch, id=request.data.get("match_id"))

		if match.winner:
			return Response({"error": "Match déjà terminé."}, status=status.HTTP_400_BAD_REQUEST)

		winner = get_object_or_404(User, username=request.data.get("winner"))
		loser = match.player1 if match.player2 == winner else match.player2

		match.winner = winner
		match.loser = loser
		match.save()

		# Vérifier si le tournoi est terminé
		remaining_players = match.tournament.players.exclude(id__in=match.tournament.matches.values_list("loser_id", flat=True))
		if remaining_players.count() == 1:
			match.tournament.declare_winner(remaining_players.first())

		return Response({"message": "Résultat du match enregistré.", "winner": winner.username}, status=status.HTTP_200_OK)

	except Exception as e:
		return Response({"error": "Erreur serveur", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
