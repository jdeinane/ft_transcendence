import random
import threading
import time
from rest_framework import viewsets
from django.utils import timezone
from config.models import Tournament
from config.serializers import UserSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from config.ai import PongAI
from django.utils.translation import activate
from django.utils.translation import gettext as _
from django.contrib.auth import get_user_model
from config.models import MatchmakingQueue
from django.db import connection

User = get_user_model()

def wait_for_db():
	"""Attendre que la base de données soit prête."""
	retries = 5
	while retries > 0:
		try:
			connection.ensure_connection()
			print("Database is ready.")
			return
		except Exception:
			print("Database not ready, retrying in 5 seconds...")
			time.sleep(5)
			retries -= 1

wait_for_db()

class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer

def start_matchmaking():
	"""Trouve deux joueurs et les appaire pour une partie."""
	for game_type in ["pong", "tictactoe"]:
		players_waiting = MatchmakingQueue.objects.filter(game_type=game_type).order_by("joined_at")

		while players_waiting.count() >= 2:
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

			# Supprimer les joueurs de la file d'attente
			player1.delete()
			player2.delete()

def run_matchmaking():
	"""Exécute le matchmaking toutes les 10 secondes."""
	while True:
		start_matchmaking()
		time.sleep(10)

# Lancer le matchmaking en arrière-plan dès le démarrage du serveur
threading.Thread(target=run_matchmaking, daemon=True).start()

# API pour quit/join file d'attente
@api_view(["POST"])
def join_matchmaking(request):
	"""Ajoute un joueur à la file d'attente"""
	user = request.user
	game_type = request.data.get("game_type")

	if game_type not in ["pong", "tictactoe"]:
		return Response({"error": "Invalid game type"}, status=400)

	# Vérifier si l'utilisateur est déjà en matchmaking
	if MatchmakingQueue.objects.filter(user=user, game_type=game_type).exists():
		return Response({"error": "User already in matchmaking"}, status=400)

	MatchmakingQueue.objects.create(user=user, game_type=game_type)
	return Response({"message": "Player added to matchmaking queue"})

@api_view(["POST"])
def leave_matchmaking(request):
	"""Retire un joueur de la file d'attente"""
	user = request.user
	game_type = request.data.get("game_type")

	MatchmakingQueue.objects.filter(user=user, game_type=game_type).delete()
	return Response({"message": "Player removed from matchmaking queue"})

# API pour IA
@api_view(["POST"])
def pong_ai_move(request):
	"""Retourne le mouvement de l'IA en fonction de la position de la balle"""
	data = request.data
	ball_position = data.get("ball_position")
	paddle_position = data.get("paddle_position")
	difficulty = data.get("difficulty", "medium")

	ai = PongAI(difficulty)
	move = ai.move(ball_position, paddle_position)

	return Response({"move": move})

@api_view(["POST"])
def tictactoe_ai_move(request):
	"""Retourne le meilleur coup de l'IA pour TicTacToe"""
	data = request.data
	board = data.get("board")
	difficulty = data.get("difficulty", "medium")

	ai = TicTacToeAI(difficulty)
	move = ai.best_move(board)

	return Response({"move": move})

def login_view(request):
	if request.method == "POST":
		return Response({"message": _("Login successful")})
	return Response({"error": _("Invalid request")}, status=400)

@api_view(["POST"])
def set_language(request):
	"""Change la langue de l'utilisateur"""
	language = request.data.get("language")
	if language in dict(settings.LANGUAGES):
		activate(language)
		return Response({"message": f"Langue changée en {language}"})
	return Response({"error": "Langue non supportée"}, status=400)
