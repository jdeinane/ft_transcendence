from rest_framework import viewsets
from .models import User, Friend, ChatRoom, ChatMessage, PongGame, TicTacToeGame, Leaderboard, BlockedUser
from .serializers import UserSerializer, FriendSerializer, ChatRoomSerializer, ChatMessageSerializer, PongGameSerializer, TicTacToeGameSerializer, LeaderboardSerializer, BlockedUserSerializer

class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer

class FriendViewSet(viewsets.ModelViewSet):
	queryset = Friend.objects.all()
	serializer_class = FriendSerializer

class ChatRoomViewSet(viewsets.ModelViewSet):
	queryset = ChatRoom.objects.all()
	serializer_class = ChatRoomSerializer

class ChatMessageViewSet(viewsets.ModelViewSet):
	queryset = ChatMessage.objects.all()
	serializer_class = ChatMessageSerializer

class PongGameViewSet(viewsets.ModelViewSet):
	queryset = PongGame.objects.all()
	serializer_class = PongGameSerializer

class TicTacToeGameViewSet(viewsets.ModelViewSet):
	queryset = TicTacToeGame.objects.all()
	serializer_class = TicTacToeGameSerializer

class LeaderboardViewSet(viewsets.ModelViewSet):
	queryset = Leaderboard.objects.all()
	serializer_class = LeaderboardSerializer

class BlockedUserViewSet(viewsets.ModelViewSet):
	queryset = BlockedUser.objects.all()
	serializer_class = BlockedUserSerializer
