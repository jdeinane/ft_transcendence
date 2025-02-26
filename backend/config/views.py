import threading, random, time, pyotp
from datetime import datetime, timedelta
from rest_framework import viewsets, status
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
from django.conf import settings
from django.db import connections
from django.utils import timezone, generate_and_send_2fa_code
from django.utils.translation import activate
from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, authenticate

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
			print("Database not ready, retrying in 5 seconds...")
			time.sleep(5)
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

# API pour IA
@api_view(["POST"])
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

	# Simule un score pour rendre l'IA plus réaliste
	score_ai = random.randint(0, 10)
	score_player = random.randint(0, 10)

	print(f"🤖 PongAI ({difficulty}) - Move: {move}, Score AI: {score_ai}, Score Player: {score_player}")

	return Response({"move": move, "ai_score": score_ai, "player_score": score_player})

@api_view(["POST"])
def tictactoe_ai_move(request):
	"""
	Retourne le meilleur coup de l'IA pour TicTacToe
	"""
	data = request.data
	board = data.get("board")
	difficulty = data.get("difficulty", "medium")

	ai = TicTacToeAI(difficulty)

	# Vérifie si l'IA a déjà gagné ou s'il y a un gagnant avant de jouer
	if ai.check_win(board, "O"):
		return Response({"message": "L'IA a déjà gagné."})
	if ai.check_win(board, "X"):
		return Response({"message": "Le joueur a déjà gagné."})

	move = ai.best_move(board)

	print(f"🤖 TicTacToeAI ({difficulty}) - Move: {move}")

	return Response({"move": move})

# API pour langage
@api_view(["POST"])
def set_language(request):
	"""
	Change la langue de l'utilisateur.
	"""
	language = request.data.get("language")

	if language in dict(settings.LANGUAGES):
		activate(language)
		return Response({"message": f"Langue changée en {language}"})
	else:
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

    user = authenticate(username=username, password=password)

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
        token = request.headers.get('Authorization').split(' ')[1] # Récupère le token de l'en-tête
        UntypedToken(token) # Vérifie si le token est valide
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url if hasattr(user, "avatar_url") else None
        })
    except Exception as e:
        return Response({"error": "Token invalide ou expiré"}, status=403)

class Generate2FAView(views.APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		# Générer et envoyer le code par email
		secret, code = generate_and_send_2fa_code(request.user)

		# Sauvegarder ou mettre à jour la clé
		two_factor, created = UserTwoFactor.objects.get_or_create(
			user=request.user,
			defaults={
				'secret_key': secret,
				'is_enabled': False,
				'code_expiry': timezone.now() + timedelta(minutes=10)
			}
		)
		if not created:
			two_factor.secret_key = secret
			two_factor.code_expiry = timezone.now() + timedelta(minutes=10)
			two_factor.save()

		return Response({
			'message': 'Code de vérification envoyé par email',
			'expires_in': '10 minutes'
		})

class Enable2FAView(views.APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = Enable2FASerializer(data=request.data)
		if serializer.is_valid():
			try:
				two_factor = UserTwoFactor.objects.get(user=request.user)

				# Vérifier si le code n'a pas expiré
				if timezone.now() > two_factor.code_expiry:
					return Response(
						{'error': 'Code expiré'},
						status=status.HTTP_400_BAD_REQUEST
					)

				totp = pyotp.TOTP(two_factor.secret_key, interval=600)
				if totp.verify(serializer.validated_data['code']):
					two_factor.is_enabled = True
					two_factor.save()
					return Response({'message': '2FA activé avec succès'})

				return Response(
					{'error': 'Code invalide'},
					status=status.HTTP_400_BAD_REQUEST
				)
			except UserTwoFactor.DoesNotExist:
				return Response(
					{'error': 'Session 2FA non trouvée'},
					status=status.HTTP_400_BAD_REQUEST
				)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Verify2FAView(views.APIView):
	def post(self, request):
		serializer = Verify2FASerializer(data=request.data)
		if serializer.is_valid():
			try:
				two_factor = UserTwoFactor.objects.get(
					user=request.user,
					is_enabled=True
				)

				# Générer et envoyer un nouveau code
				secret, _ = generate_and_send_2fa_code(request.user)
				two_factor.secret_key = secret
				two_factor.code_expiry = timezone.now() + timedelta(minutes=10)
				two_factor.save()

				totp = pyotp.TOTP(two_factor.secret_key, interval=600)
				if totp.verify(serializer.validated_data['code']):
					refresh = RefreshToken.for_user(request.user)
					return Response({
						'refresh': str(refresh),
						'access': str(refresh.access_token),
					})

				return Response(
					{'error': 'Code invalide'},
					status=status.HTTP_400_BAD_REQUEST
				)
			except UserTwoFactor.DoesNotExist:
				return Response(
					{'error': '2FA non activé'},
					status=status.HTTP_400_BAD_REQUEST
				)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
