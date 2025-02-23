from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
	"""
	Formulaire de création d'un utilisateur personnalisé.
	"""
	class Meta:
		model = User
		fields = ("username", "email", "password1", "password2")

class CustomAuthenticationForm(AuthenticationForm):
	"""
	Formulaire de connexion d'un utilisateur.
	"""
	username = forms.CharField(widget=forms.TextInput(attrs={"placeholder": "Nom d'utilisateur"}))
	password = forms.CharField(widget=forms.PasswordInput(attrs={"placeholder": "Mot de passe"}))
