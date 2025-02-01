from rest_framework import serializers
from .models import User, Friend, ChatRoom, ChatMessage, PongGame, TicTacToeGame, Leaderboard, BlockedUser

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = '__all__'

class FriendSerializer(serializers.ModelSerializer):
	class Meta:
		model = Friend
		fields = '__all__'

class ChatRoomSerializer(serializers.ModelSerializer):
	class Meta:
		model = ChatRoom
		fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
	class Meta:
		model = ChatMessage
		fields = '__all__'

class PongGameSerializer(serializers.ModelSerializer):
	class Meta:
		model = PongGame
		fields = '__all__'

class TicTacToeGameSerializer(serializers.ModelSerializer):
	class Meta:
		model = TicTacToeGame
		fields = '__all__'

class LeaderboardSerializer(serializers.ModelSerializer):
	class Meta:
		model = Leaderboard
		fields = '__all__'

class BlockedUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = BlockedUser
		fields = '__all__'
