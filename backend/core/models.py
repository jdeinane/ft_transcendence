from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
	avatar_url = models.TextField(blank=True, null=True)
	two_factor_secret = models.CharField(max_length=255, blank=True, null=True)
	is_online = models.BooleanField(default=False)
	groups = models.ManyToManyField(
		'auth.Group',
		related_name='core_user_groups',  # Nom unique pour la relation inverse
		blank=True,
		verbose_name='groups',
		help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
    )
	user_permissions = models.ManyToManyField(
		'auth.Permission',
		related_name='core_user_permissions',  # Nom unique pour la relation inverse
		blank=True,
		verbose_name='user permissions',
		help_text='Specific permissions for this user.',
	)

	class Meta:
		db_table = 'users'

class Friend(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friends')
	friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_of')
	status = models.CharField(max_length=20)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'friends'
		unique_together = (('user', 'friend'),)

class ChatRoom(models.Model):
	name = models.CharField(max_length=100)
	is_private = models.BooleanField(default=False)
	password = models.CharField(max_length=255, blank=True, null=True)
	owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_rooms')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'chat_rooms'

class ChatMessage(models.Model):
	room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
	message = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'chat_messages'

class PongGame(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pong_games_as_player1')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pong_games_as_player2')
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='pong_games_won')
	created_at = models.DateTimeField(auto_now_add=True)
	ended_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		db_table = 'pong_games'

class TicTacToeGame(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tictactoe_games_as_player1')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tictactoe_games_as_player2')
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='tictactoe_games_won')
	is_draw = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	ended_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		db_table = 'tictactoe_games'

class Leaderboard(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard_entries')
	games_played = models.IntegerField(default=0)
	games_won = models.IntegerField(default=0)
	games_lost = models.IntegerField(default=0)
	points = models.IntegerField(default=0)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'leaderboard'

class BlockedUser(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_users')
	blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_by')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'blocked_users'
		unique_together = (('user', 'blocked_user'),)
