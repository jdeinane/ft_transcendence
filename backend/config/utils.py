import pyotp
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def generate_otp_secret():
	"""
	Génère un secret OTP sécurisé.
	"""
	return pyotp.random_base32()

def get_otp_code(secret):
	"""
	Génère un code OTP à usage unique.
	"""
	return pyotp.TOTP(secret).now()

def send_2fa_email(user, otp):
	"""
	Envoie le code 2FA par email.
	"""
	subject = "Votre code 2FA"
	message = f"Voici votre code de vérification 2FA : {otp}"
	recipient_list = [user.email]

	send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=False)

def generate_and_send_2fa_code(user):
	"""
	Génère un code 2FA, met à jour le secret et envoie l'email.
	"""
	if not user.email:
		raise ValueError("L'utilisateur doit avoir un email valide.")

	# Génération du secret OTP
	user.two_factor_secret = generate_otp_secret()
	user.save()

	# Génération et envoi du code
	otp = get_otp_code(user.two_factor_secret)
	send_2fa_email(user, otp)

	return otp
