import pyotp
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta

def generate_and_send_2fa_code(user):
	# Générer un code TOTP valide pendant 10 minutes
	totp = pyotp.TOTP(pyotp.random_base32(), interval=600)  # 600 secondes = 10 minutes
	code = totp.now()

	# Envoyer l'email
	subject = 'Votre code de vérification Ft_Transcendence'
	message = f'Votre code de vérification est : {code}\nCe code est valide pendant 10 minutes.'

	send_mail(
		subject,
		message,
		settings.DEFAULT_FROM_EMAIL,
		[user.email],
		fail_silently=False,
	)
	
	return totp.secret, code
