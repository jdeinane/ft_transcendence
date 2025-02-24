from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import MatchmakingQueue
from django.contrib.auth import get_user_model

User = get_user_model()

# Configuration du modèle utilisateur dans l'admin Django
@admin.register(User)
class CustomUserAdmin(UserAdmin):
	list_display = ("id", "username", "email", "is_staff", "is_superuser", "is_online", "created_at")
	list_filter = ("is_staff", "is_superuser", "is_online")
	search_fields = ("username", "email")
	ordering = ("id",)
	fieldsets = (
		("Informations Personnelles", {"fields": ("username", "email", "avatar_url")}),
		("Permissions", {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")}),
		("Dates", {"fields": ("created_at", "updated_at")}),
	)
	readonly_fields = ("created_at", "updated_at")

# Ajout du modèle MatchmakingQueue à l'admin Django
@admin.register(MatchmakingQueue)
class MatchmakingQueueAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "game_type", "joined_at")
	list_filter = ("game_type",)
	search_fields = ("user__username", "game_type")
	ordering = ("-joined_at",)
