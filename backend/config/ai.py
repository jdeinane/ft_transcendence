import random

class PongAI:
	def __init__(self, difficulty="medium"):
		self.difficulty = difficulty

	def move(self, ball_position, paddle_position, ball_speed=1):
		reaction_speed = {"easy": 2, "medium": 4, "hard": 6}
		speed = reaction_speed.get(self.difficulty, 4)

		predicted_position = ball_position + ball_speed * 10 

		if abs(predicted_position - paddle_position) > 10:
			return 1 if predicted_position > paddle_position else -1

		return 0  

class TicTacToeAI:
	def __init__(self, difficulty="medium"):
		self.difficulty = difficulty

	def best_move(self, board):
		"""
		Renvoie le meilleur coup à jouer sur une grille de TicTacToe
		"""
		available_moves = [i for i, x in enumerate(board) if x == ""]

		if not available_moves:  # ⚠️ Eviter l'erreur si aucun coup possible
			print("❌ Aucun coup possible, l'IA ne peut pas jouer.")
			return None  # Retourne None si le board est plein

		if self.difficulty == "easy":
			return random.choice(available_moves)

		elif self.difficulty == "medium":
			# Priorité au centre si disponible
			if 4 in available_moves:
				return 4

			# Essaye de gagner ou bloque un coup gagnant
			for move in available_moves:
				board[move] = "O"
				if self.check_win(board, "O"):
					return move
				board[move] = ""

			for move in available_moves:
				board[move] = "X"
				if self.check_win(board, "X"):
					return move
				board[move] = ""

			return random.choice(available_moves)

		elif self.difficulty == "hard":
			# Utilisation de Minimax si disponible
			return self.minimax(board, "O")["index"]

	def check_win(self, board, player):
		"""
		Vérifie si un joueur a gagné
		"""
		win_conditions = [(0,1,2), (3,4,5), (6,7,8), (0,3,6), (1,4,7), (2,5,8), (0,4,8), (2,4,6)]
		return any(board[a] == board[b] == board[c] == player for a, b, c in win_conditions)
