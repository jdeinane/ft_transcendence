import random

class PongAI:
    def __init__(self):
        self.target_y = None  

    def predict_ball_position(self, ball_position, ball_speed, ball_direction, paddle_x, ball_x):
        """
        Prédit où la balle atteindra la zone du paddle
        """
        frames_until_paddle = (paddle_x - ball_x) / ball_speed if ball_speed != 0 else 1
        predicted_y = ball_position + (ball_speed * ball_direction * frames_until_paddle)

        # Gérer les rebonds avec un terrain de 400px de hauteur
        while predicted_y < 0 or predicted_y > 400:
            if predicted_y < 0:
                predicted_y = -predicted_y  # Rebond sur le haut
            elif predicted_y > 400:
                predicted_y = 800 - predicted_y  # Rebond sur le bas
        
        return predicted_y

    def move(self, ball_position, ball_speed, ball_direction, paddle_position, paddle_speed, ball_x, paddle_x):
        """
        Ajuste la raquette pour intercepter la balle à son point d'arrivée.
        """
        print(f"🔍 DEBUG AI: Ball={ball_position}, Paddle={paddle_position}, Speed={ball_speed}, Dir={ball_direction}")

        if not isinstance(ball_position, (int, float)) or not isinstance(paddle_position, (int, float)):
            print("❌ Erreur: ball_position ou paddle_position invalide")
            return 0

        # Prédire où la balle atteindra la zone du paddle
        self.target_y = self.predict_ball_position(ball_position, ball_speed, ball_direction, paddle_x, ball_x)

        # Mouvement plus naturel : ne bouge que si nécessaire
        if abs(self.target_y - paddle_position) > 10:
            if self.target_y > paddle_position:
                return 1  
            else:
                return -1  

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
