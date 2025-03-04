from django.utils.translation import activate, gettext as _
import pyotp
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

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

def send_welcome_email(user):
    """
    Envoie un email de bienvenue dans la langue préférée de l'utilisateur.
    """
    activate(user.language)

    subject = _("Welcome to ft_transcendence!")
    message = _("Hello {user},\n\nWelcome to our platform!").format(user=user.username)

    send_mail(
        subject,
        message,
        "no-reply@ft_transcendence.com",
        [user.email],
        fail_silently=False,
    )

def send_2fa_email(user, otp):
	"""
	Envoie le code 2FA par email.
	"""
	# Configuration
	smtp_server = "smtp.gmail.com"  # SMTP de Gmail
	smtp_port = 587  # Port pour TLS
	email_sender = os.getenv("EMAIL_HOST_USER")
	email_password = os.getenv("EMAIL_HOST_PASSWORD")
	email_receiver = user.email
	# Création du message
	msg = MIMEMultipart()
	msg["From"] = email_sender
	msg["To"] = email_receiver
	msg["Subject"] = "Votre code 2FA"
	# Corps du message
	message = f"Voici votre code de vérification 2FA : {otp}"
	msg.attach(MIMEText(message, "plain"))

	try:
		# Connexion au serveur SMTP
		server = smtplib.SMTP(smtp_server, smtp_port)
		server.starttls()  # Sécurisation de la connexion
		server.login(email_sender, email_password)  # Connexion
		server.sendmail(email_sender, email_receiver, msg.as_string())  # Envoi de l'email
		server.quit()  # Fermeture de la connexion
		print("Email envoyé avec succès !")
	except Exception as e:
		print(f"Erreur lors de l'envoi : {e}")
