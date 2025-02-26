from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from config.models import Tournament

User = get_user_model()

# configuration du modèle utilisateur dans l'admin Django
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

# ajout du modèle Tournament à l'admin Django
@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "created_at")
	search_fields = ("name",)
	ordering = ("-created_at",)

