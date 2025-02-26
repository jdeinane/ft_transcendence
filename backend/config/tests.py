from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTest(TestCase):
	"""
	Tests unitaires pour le modèle User.
	"""

	def setUp(self):
		self.user = User.objects.create_user(username="testuser", email="test@example.com", password="password123")

	def test_create_user(self):
		"""
		Vérifie que l'utilisateur est bien créé avec les bonnes informations.
		"""
		self.assertEqual(self.user.username, "testuser")
		self.assertEqual(self.user.email, "test@example.com")
		self.assertTrue(self.user.check_password("password123"))

	def test_create_superuser(self):
		"""
		Vérifie la création d'un superutilisateur.
		"""
		admin_user = User.objects.create_superuser(username="admin", email="admin@example.com", password="adminpass")
		self.assertTrue(admin_user.is_staff)
		self.assertTrue(admin_user.is_superuser)

class UserLoginTest(TestCase):
	"""
	Tests unitaires pour l'authentification de l'utilisateur.
	"""

	def setUp(self):
		self.user = User.objects.create_user(username="loginuser", email="login@example.com", password="testpass")

	def test_login_user(self):
		"""
		Vérifie que l'utilisateur peut se connecter.
		"""
		login = self.client.login(username="loginuser", password="testpass")
		self.assertTrue(login)
