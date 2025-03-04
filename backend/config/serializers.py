from config.models import Tournament, TournamentPlayer, TournamentMatch, User
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'avatar_url', 'is_online']

# 2fa
class Enable2FASerializer(serializers.Serializer):
	code = serializers.CharField(max_length=6, min_length=6)

	def validate_code(self, value):
		if not value.isdigit():
			raise serializers.ValidationError("Le code doit contenir uniquement des chiffres")
		return value

class Verify2FASerializer(serializers.Serializer):
	code = serializers.CharField(max_length=6, min_length=6)
	user_id = serializers.IntegerField()

	def validate_code(self, value):
		if not value.isdigit():
			raise serializers.ValidationError("Le code doit contenir uniquement des chiffres")
		return value

	def validate_user_id(self, value):
		try:
			User.objects.get(id=value)
			return value
		except User.DoesNotExist:
			raise serializers.ValidationError("Utilisateur non trouvé")

class LoginSerializer(serializers.Serializer):
	username = serializers.CharField()
	password = serializers.CharField(write_only=True)
	email = serializers.EmailField(required=False)

class TournamentSerializer(serializers.ModelSerializer):
	creator = serializers.StringRelatedField(read_only=True)

	class Meta:
		model = Tournament
		fields = ["id", "name", "max_players", "is_public", "status", "creator"]

class TournamentMatchSerializer(serializers.ModelSerializer):
	player1 = serializers.StringRelatedField()
	player2 = serializers.StringRelatedField()
	winner = serializers.StringRelatedField()

	class Meta:
		model = TournamentMatch
		fields = ["id", "tournament", "round_number", "player1", "player2", "winner", "created_at"]

class TournamentSerializer(serializers.ModelSerializer):
	creator = serializers.StringRelatedField(read_only=True)  
	players = serializers.SerializerMethodField()

	class Meta:
		model = Tournament
		fields = ["id", "name", "max_players", "is_public", "status", "creator", "players"]

	def get_players(self, obj):
		return [player.username for player in obj.players.all()]
