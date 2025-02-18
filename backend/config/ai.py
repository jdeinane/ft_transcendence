import random

class PongAI:
    def __init__(self, difficulty="medium"):
        self.difficulty = difficulty

    def move(self, ball_position, paddle_position):
        """Déplace la raquette de l'IA en fonction de la position de la balle"""
        if self.difficulty == "easy":
            return random.choice([-1, 0, 1])  # Se déplace aléatoirement

        elif self.difficulty == "medium":
            if abs(ball_position - paddle_position) > 20:
                return 1 if ball_position > paddle_position else -1
            return 0  # Ne bouge pas si la balle est proche

        elif self.difficulty == "hard":
            return 1 if ball_position > paddle_position else -1  # Suit parfaitement la balle

class TicTacToeAI:
    def __init__(self, difficulty="medium"):
        self.difficulty = difficulty

    def best_move(self, board):
        """Renvoie le meilleur coup à jouer sur une grille de TicTacToe"""
        available_moves = [i for i, x in enumerate(board) if x == " "]

        if self.difficulty == "easy":
            return random.choice(available_moves)  # Joue un coup au hasard

        elif self.difficulty == "medium":
            # Essaye de gagner ou bloque un coup gagnant
            for move in available_moves:
                board[move] = "O"
                if self.check_win(board, "O"):
                    return move
                board[move] = " "

            for move in available_moves:
                board[move] = "X"
                if self.check_win(board, "X"):
                    return move
                board[move] = " "

            return random.choice(available_moves)  # Sinon, joue au hasard

        elif self.difficulty == "hard":
            return self.minimax(board, "O")["index"]  # Algorithme Minimax

    def check_win(self, board, player):
        """Vérifie si un joueur a gagné"""
        win_conditions = [(0,1,2), (3,4,5), (6,7,8), (0,3,6), (1,4,7), (2,5,8), (0,4,8), (2,4,6)]
        return any(board[a] == board[b] == board[c] == player for a, b, c in win_conditions)
