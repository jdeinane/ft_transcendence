from datetime import date, time, datetime, timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.apps import apps
from django.utils.timezone import now

apps.get_app_config("config").get_models()

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
	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)
	is_2fa_enabled = models.BooleanField(default=False)
	#last_2fa_verified = models.DateTimeField(null=True, blank=True)
	#failed_2fa_attempts = models.IntegerField(default=0)
	#token_expiry = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

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

	def set_token_expiry(self):
		"""
		Définit l'expiration du Token après vérification du 2FA.
		"""
		self.token_expiry = now() + timedelta(minutes=30)
		self.save()

	def set_token_expiry(self):
		"""
		Vérifie si le Token est encore valide.
		"""
		return self.token_expiry is None or now() < self.token_expiry

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
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pong_games_as_player2")
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="pong_wins")
	created_at = models.DateTimeField(auto_now_add=True)
	ended_at = models.DateTimeField(null=True, blank=True)

class TicTacToeGame(models.Model):
	id = models.BigAutoField(primary_key=True)
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tictactoe_games_as_player1")
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tictactoe_games_as_player2")
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
	name = models.CharField(max_length=100)
	players = models.ManyToManyField(User, related_name="tournaments")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name

class UserTwoFactor(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	secret_key = models.CharField(max_length=32, blank=True)
	is_enabled = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"2FA for {self.user.username}"
