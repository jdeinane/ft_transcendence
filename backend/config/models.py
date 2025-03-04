from datetime import date, time, datetime, timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.apps import apps
from django.utils.timezone import now

# apps.get_app_config("config").get_models()

class UserManager(BaseUserManager):
	def create_user(self, username, email, password=None):
		if not email:
			raise ValueError("L'utilisateur doit avoir une adresse email")
		email = self.normalize_email(email)
		user = self.model(username=username, email=email)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, username, email, password=None):
		user = self.create_user(username, email, password)
		user.is_staff = True
		user.is_superuser = True
		user.save(using=self._db)
		return user

class User(AbstractBaseUser, PermissionsMixin):
	id = models.BigAutoField(primary_key=True)
	username = models.CharField(max_length=150, unique=True)
	email = models.EmailField(unique=True)
	password = models.CharField(max_length=255, null=False ,blank=False)
	avatar_url = models.TextField(blank=True, null=True)
	two_factor_secret = models.CharField(max_length=255, blank=True, null=True)
	is_online = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True)
	last_seen = models.DateTimeField(auto_now=True)
	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)
	is_2fa_enabled = models.BooleanField(default=False)
	last_2fa_verified = models.DateTimeField(null=True, blank=True)
	failed_2fa_attempts = models.IntegerField(default=0)
	token_expiry = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	number_of_games_played = models.IntegerField(default=0, null=False, blank=True)
	language = models.CharField(
		max_length=10,
		choices=[("en", "English"), ("fr", "Français"), ("es", "Español")],
		default="en"
	)

	forty_two_id = models.IntegerField(unique=True, blank=True, null=True)

	groups = models.ManyToManyField(
		"auth.Group",
		related_name="custom_user_groups",
		blank=True
	)
	user_permissions = models.ManyToManyField(
		"auth.Permission",
		related_name="custom_user_permissions",
		blank=True
	)

	def set_token_expiry(self, duration=30):
		"""
		Définit l'expiration du Token après vérification du 2FA.
		"""
		self.token_expiry = timezone.now() + timedelta(minutes=duration)
		self.save(update_fields=["token_expiry"])

	def register_2fa_success(self):
		"""
		Met à jour la dernière vérification et réinitialise les échecs.
		"""
		self.last_2fa_verified = now()
		self.failed_2fa_attempts = 0
		self.save()
	
	def register_2fa_failure(self):
		"""
		Incrémente le compteur d'échecs de 2FA.
		"""
		self.failed_2fa_attempts += 1
		self.save()
	
	def update_last_seen(self):
		"""
		Met à jour la dernière connexion de l'utilisateur
		"""
		self.last_seen = now()
		self.save(update_fields=['last_seen'])

	def increment_games_played(self):
		""" Incrémente le nombre de parties jouées """
		if self.number_of_games_played is None:
			self.number_of_games_played = 0
		self.number_of_games_played += 1
		self.save(update_fields=['number_of_games_played'])

	objects = UserManager()

	USERNAME_FIELD = "username"
	REQUIRED_FIELDS = ["email"]

	def __str__(self):
		return self.username

class Friend(models.Model):
	id = models.BigAutoField(primary_key=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends")
	friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships")
	status = models.CharField(max_length=20)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = (("user", "friend"),)

class ChatRoom(models.Model):
	id = models.BigAutoField(primary_key=True)
	name = models.CharField(max_length=100)
	is_private = models.BooleanField(default=False)
	password = models.CharField(max_length=255, blank=True, null=True)
	owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_rooms")
	created_at = models.DateTimeField(auto_now_add=True)

class ChatMessage(models.Model):
	id = models.BigAutoField(primary_key=True)
	room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
	message = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

class PongGame(models.Model):
	id = models.BigAutoField(primary_key=True)
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pong_games_as_player1")
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pong_games_as_player2", null=True, blank=True)
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="pong_wins")
	created_at = models.DateTimeField(auto_now_add=True)
	ended_at = models.DateTimeField(null=True, blank=True)

class TicTacToeGame(models.Model):
	id = models.BigAutoField(primary_key=True)
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tictactoe_games_as_player1")
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tictactoe_games_as_player2", null=True, blank=True)
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="tictactoe_wins")
	is_draw = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	ended_at = models.DateTimeField(null=True, blank=True)

class Leaderboard(models.Model):
	id = models.BigAutoField(primary_key=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leaderboard")
	games_played = models.IntegerField(default=0)
	games_won = models.IntegerField(default=0)
	games_lost = models.IntegerField(default=0)
	points = models.IntegerField(default=0)
	updated_at = models.DateTimeField(auto_now=True)

class BlockedUser(models.Model):
	id = models.BigAutoField(primary_key=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_users")
	blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_by")
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = (("user", "blocked_user"),)

class Tournament(models.Model):
	name = models.CharField(max_length=100, unique=True)
	creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournaments_created")
	created_at = models.DateTimeField(auto_now_add=True)
	max_players = models.IntegerField()
	is_public = models.BooleanField(default=True)
	status = models.CharField(
		max_length=20,
		choices=[("Pending", "Pending"), ("Ongoing", "Ongoing"), ("Finished", "Finished")],
		default="Pending",
	)
	winner = models.ForeignKey(
		User, null=True, blank=True, 
		on_delete=models.SET_NULL, 
		related_name="tournaments_won"
	)
	players = models.ManyToManyField(User, through="TournamentPlayer", related_name="tournament_players")

class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="tournament_players")
	player = models.ForeignKey(User, on_delete=models.CASCADE, related_name="player_tournaments")
	joined_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ("tournament", "player")  # Un joueur ne peut s'inscrire qu'une seule fois

	def __str__(self):
		return f"{self.player.username} dans {self.tournament.name}"

class TournamentMatch(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name="matches")
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="match_player1")
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="match_player2", null=True, blank=True)
	winner = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="match_winner")
	loser = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="match_loser")
	round_number = models.IntegerField()
	created_at = models.DateTimeField(auto_now_add=True)

class UserTwoFactor(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	secret_key = models.CharField(max_length=32, blank=True)
	is_enabled = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"2FA for {self.user.username}"

class MatchHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player1")
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches_as_player2", null=True, blank=True)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="matches_won")
    game_type = models.CharField(max_length=50, choices=[("pong", "Pong"), ("tictactoe", "TicTacToe")])
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player1.username} vs {self.player2.username} - {self.game_type}"
