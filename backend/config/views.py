import json
import requests
import threading, random, time, pyotp
from datetime import datetime, timedelta
from rest_framework import views, viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from config.models import Tournament, PongGame, TicTacToeGame, UserTwoFactor
from config.serializers import UserSerializer, Enable2FASerializer, Verify2FASerializer
from config.ai import PongAI, TicTacToeAI
from config.utils import generate_and_send_2fa_code, generate_otp_secret
from django.http import JsonResponse
from django.conf import settings
from django.db import connections
from django.utils import timezone
from django.utils.translation import activate
from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, authenticate
from django.utils.timezone import localtime

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

class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer

# API pour join tournament
@api_view(["POST"])
def join_tournament(request, tournament_id):
	"""
	Permet à un utilisateur de rejoindre un tournoi directement
	"""
	tournament = get_object_or_404(Tournament, id=tournament_id)
	user = request.user

	if user in tournament.players.all():
		return Response({"message": "Vous êtes déjà inscrit à ce tournoi."}, status=status.HTTP_400_BAD_REQUEST)

	tournament.players.add(user)
	return Response({"message": "Inscription réussie."}, status=status.HTTP_200_OK)

# Api pour voir tournament
@api_view(["GET"])
def list_tournaments(request):
	"""
	Retourne la liste des tournois disponibles
	"""
	tournaments = Tournament.objects.all().values("id", "name")
	return Response({"tournaments": list(tournaments)}, status=status.HTTP_200_OK)

# API pour leave tournament
@api_view(["POST"])
def leave_tournament(request, tournament_id):
	"""
	Permet à un utilisateur de quitter un tournoi
	"""
	tournament = get_object_or_404(Tournament, id=tournament_id)
	user = request.user

	if user not in tournament.players.all():
		return Response({"message": "Vous n'êtes pas inscrit à ce tournoi."}, status=status.HTTP_400_BAD_REQUEST)

	tournament.players.remove(user)
	return Response({"message": "Vous avez quitté le tournoi avec succès."}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_game(request):
    """
    Enregistre un match et met à jour le nombre de parties jouées pour le joueur inscrit.
    """
    try:
        player1 = request.user  # Joueur connecté
        score_player1 = request.data.get("score_player1", 0)
        score_player2 = request.data.get("score_player2", 0)
        game_mode = request.data.get("game_mode", "solo")  

        print(f"📩 Requête reçue: score1={score_player1}, score2={score_player2}, mode={game_mode}") # DEBUG

        # Déterminer le gagnant (ou nul si égalité)
        winner = player1 if score_player1 > score_player2 else (None if score_player1 == score_player2 else None)

        # Enregistrer la partie
        game = PongGame.objects.create(
            player1=player1,
            player2=None,  # Joueur 2 n'existe pas
            score_player1=score_player1,
            score_player2=score_player2,
            winner=winner
        )

        # ✅ Incrémenter uniquement le joueur connecté
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

        game = TicTacToeGame.objects.create(
            player1=player1,
            player2=player2,
            score_player1=score_player1,
            score_player2=score_player2,
            is_draw=is_draw
        )

        player1.increment_games_played()

        return Response({
            "message": "Tic Tac Toe game recorded successfully",
            "game_id": game.id,
            "number_of_games_played": player1.number_of_games_played
        })

    except Exception as e:
        print("❌ Erreur lors de l'enregistrement de la partie Tic Tac Toe :", str(e))
        return Response({"error": "Erreur serveur"}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_tournament_game(request):
    """
    Enregistre un match de tournoi et met à jour le nombre de parties jouées.
    """
    try:
        player1 = request.user
        score_player1 = request.data.get("score_player1", 0)
        score_player2 = request.data.get("score_player2", 0)
        winner_name = request.data.get("winner")
        
        winner = player1 if winner_name == player1.username else None

        game = PongGame.objects.create(
            player1=player1,
            player2=None,
            score_player1=score_player1,
            score_player2=score_player2,
            winner=winner
        )

        player1.increment_games_played()

        return Response({
            "message": "Tournament match recorded successfully",
            "game_id": game.id,
            "number_of_games_played": player1.number_of_games_played
        })
    except Exception as e:
        print("❌ Erreur lors de l'enregistrement du match de tournoi :", str(e))
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

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
	"""
	Inscription d'un utilisateur
	"""
	username = request.data.get('username')
	email = request.data.get('email')
	password = request.data.get('password')
	confirm_password = request.data.get('confirm_password')

	if not username or not email or not password or not confirm_password:
		return Response({'error': 'Tous les champs sont obligatoires'}, status=400)

	if password != confirm_password:
		return Response({'error': 'Les mots de passe ne correspondent pas'}, status=400)

	if User.objects.filter(username=username).exists():
		return Response({'error': 'Ce nom d’utilisateur est déjà pris'}, status=400)

	if User.objects.filter(email=email).exists():
		return Response({'error': 'Cet email est déjà utilisé'}, status=400)

	try:
		user = User.objects.create_user(username=username, email=email, password=password)
		print(f"✅ Utilisateur {username} créé avec succès !")
		return Response({'message': 'Utilisateur créé avec succès !'}, status=201)
	except Exception as e:
		print(f"❌ Erreur lors de la création de l'utilisateur : {e}")
		return Response({'error': 'Erreur interne lors de la création de l’utilisateur'}, status=500)

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

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_avatar(request):
	"""
	Met à jour l'avatar de l'utilisateur authentifié.
	"""
	token = request.headers.get('Authorization', '').split(' ')[1]
	print(f"🛠️ Token reçu dans Django: {token}")  # Debugging du token reçu

	user = request.user
	if not user.is_authenticated:
		print("❌ Utilisateur non authentifié")
		return Response({"error": "Non authentifié"}, status=401)

	print(f"🛠️ Utilisateur authentifié: {user.username}")

	new_avatar_url = request.data.get("avatar_url")

	# Vérifie si l'avatar est valide
	valid_avatars = [
		"avataralien.png",
		"avatarboy1.png",
		"avatarboy2.png",
		"avatargirl1.png",
		"avatargirl2.png"
	]

	if new_avatar_url not in valid_avatars:
		print("❌ Avatar non valide:", new_avatar_url)
		return Response({"error": "Avatar non valide"}, status=400)

	# Mettre à jour l'avatar dans la base de données
	user.avatar_url = new_avatar_url
	user.save()

	print(f"✅ Avatar mis à jour: {new_avatar_url} pour {user.username}")

	return Response({"message": "Avatar mis à jour avec succès", "avatar_url": user.avatar_url})

class Enable2FAView(APIView):
	"""
	Active le 2FA pour un utilisateur en générant un secret OTP
	"""
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user

		print(f"🔍 Tentative d'activation 2FA pour {user.username}")  # DEBUG

		if user.two_factor_secret:
			print("🚨 2FA déjà activé")  # DEBUG
			return Response({"message": "Le 2FA est déjà activé."}, status=400)

		user.two_factor_secret = generate_otp_secret()
		user.save()

		print("✅ 2FA activé avec succès !")  # DEBUG
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

    # Vérifier si l'utilisateur existe déjà
    user, created = User.objects.get_or_create(forty_two_id=user_data["id"])

    # Mettre à jour les données de l'utilisateur
    user.username = user_data.get("login", f"user_{user_data['id']}")
    user.email = user_data.get("email", f"user{user_data['id']}@42.fr")
    user.avatar_url = user_data.get("image", {}).get("link", "")
    user.save()

    # Générer un JWT Token pour l'utilisateur
    refresh = RefreshToken.for_user(user)
    return JsonResponse(
        {
            "access_token": str(refresh.access_token),
            "user_id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
        }
    )
