import threading
import random
import time
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from config.models import Tournament, PongGame, TicTacToeGame, MatchmakingQueue
from config.serializers import UserSerializer
from config.ai import PongAI, TicTacToeAI
from django.utils import timezone
from django.conf import settings
from django.utils.translation import activate
from django.utils.translation import gettext as _
from django.db import connections
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

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

def start_matchmaking():
	"""
	Trouve deux joueurs et les appaire pour une partie.
	"""
	for game_type in ["pong", "tictactoe"]:
		players_waiting = MatchmakingQueue.objects.filter(game_type=game_type).order_by("joined_at")

		while players_waiting.count() >= 2:
			try:
				player1 = players_waiting.first()
				player2 = players_waiting[1]

				if game_type == "pong":
					PongGame.objects.create(
						player1=player1.user,
						player2=player2.user,
						created_at=timezone.now(),
					)
				elif game_type == "tictactoe":
					TicTacToeGame.objects.create(
						player1=player1.user,
						player2=player2.user,
						created_at=timezone.now(),
					)

				print(f"🎮 Match trouvé : {player1.user.username} VS {player2.user.username} ({game_type})")

				# Supprimer les joueurs de la file d'attente
				player1.delete()
				player2.delete()

			except Exception as e:
				print(f"⚠️ Erreur lors du matchmaking: {e}")

def run_matchmaking():
	"""
	Exécute le matchmaking en arrière-plan.
	"""
	print("🚀 Démarrage du matchmaking en arrière-plan...")
	while True:
		try:
			start_matchmaking()
		except Exception as e:
			print(f"❌ Erreur dans le matchmaking: {e}")
		time.sleep(10)

def matchmaking_ready():
	try:
		MatchmakingQueue.objects.first()
		return True
	except Exception as e:
		print(f"⚠️ Impossible de vérifier `MatchmakingQueue`: {e}")
		return False

# Lancer le matchmaking en arrière-plan dès le démarrage du serveur
if matchmaking_ready():
	threading.Thread(target=run_matchmaking, daemon=True).start()
else:
	print("⚠️ Matchmaking désactivé car `MatchmakingQueue` n'existe pas.")

# API pour join queue
@api_view(["POST"])
def join_matchmaking(request):
	"""
	Ajoute un joueur à la file d'attente
	"""
	user = request.user
	game_type = request.data.get("game_type")

	if game_type not in ["pong", "tictactoe"]:
		return Response({"error": "Invalid game type"}, status=400)

	# Vérifier si l'utilisateur est déjà en matchmaking
	if MatchmakingQueue.objects.filter(user=user, game_type=game_type).exists():
		return Response({"error": "User already in matchmaking"}, status=400)

	MatchmakingQueue.objects.create(user=user, game_type=game_type)
	return Response({"message": "Player added to matchmaking queue"})

# API pour quit queue
@api_view(["POST"])
def leave_matchmaking(request):
	"""
	Retire un joueur de la file d'attente
	"""
	user = request.user
	game_type = request.data.get("game_type")

	MatchmakingQueue.objects.filter(user=user, game_type=game_type).delete()
	return Response({"message": "Player removed from matchmaking queue"})

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

def login_view(request):
	if request.method == "POST":
		return Response({"message": _("Login successful")})
	return Response({"error": _("Invalid request")}, status=400)

# API pour langage
@api_view(["POST"])
def set_language(request):
	"""Change la langue de l'utilisateur."""
	language = request.data.get("language")

	if language in dict(settings.LANGUAGES):
		activate(language)
		return Response({"message": f"Langue changée en {language}"})
	else:
		return Response({"error": "Langue non supportée"}, status=400)
