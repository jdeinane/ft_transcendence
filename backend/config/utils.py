import pyotp, random
from django.utils.translation import activate, gettext as _
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count
from config.models import TournamentMatch, TournamentPlayer

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

def generate_tournament_bracket(tournament):
	"""
	Génère les matchs du premier tour pour un tournoi donné.
	"""
	players = list(TournamentPlayer.objects.filter(tournament=tournament).values_list("player", flat=True))
    
	if len(players) < 2:
		print("⚠️ Pas assez de joueurs pour démarrer le tournoi.")
		return

	random.shuffle(players)  # Mélanger les joueurs

	matchups = []
	for i in range(0, len(players), 2):
		if i + 1 < len(players):
			matchups.append((players[i], players[i + 1]))
		else:
			# Nombre impair → Le dernier joueur passe automatiquement au tour suivant
			matchups.append((players[i], None))

	# Enregistrer les matchs dans la base de données
	for idx, (p1, p2) in enumerate(matchups):
		TournamentMatch.objects.create(
			tournament=tournament,
			player1_id=p1,
			player2_id=p2 if p2 else None,
			round_number=1  # Premier tour
		)
	print(f"✅ Matchs du tournoi {tournament.name} générés avec succès.")

def generate_next_round(tournament):
	"""
	Génère automatiquement le tour suivant (demi-finales, finale) pour un tournoi donné.
	"""
	from config.models import TournamentMatch, TournamentPlayer

	remaining_players = list(
		TournamentPlayer.objects.filter(
			tournament=tournament,
			player__in=TournamentMatch.objects.filter(tournament=tournament, winner__isnull=False)
			.values_list("winner_id", flat=True)
			.distinct()
		).values_list("player_id", flat=True)
	)

	print(f"🏆 Joueurs qualifiés pour le tour suivant : {remaining_players}")

	if len(remaining_players) == 1:
		# 🔥 Si un seul joueur reste, il est le gagnant du tournoi
		tournament.winner_id = remaining_players[0]
		tournament.status = "Finished"
		tournament.save()
		print(f"🏆 Tournoi terminé ! Le gagnant est {tournament.winner.username}")
		return

	new_round_number = TournamentMatch.objects.filter(tournament=tournament).aggregate(Count("round_number"))["round_number__count"] + 1

	# 🔥 Gérer le cas où il y a un nombre impair de joueurs (3 restants)
	if len(remaining_players) == 3:
		print("⚠️ Nombre impair de joueurs : Création d'une demi-finale spéciale avec trois joueurs")

		# Le premier match se joue entre les deux premiers joueurs
		match1 = TournamentMatch.objects.create(
			tournament=tournament,
			player1_id=remaining_players[0],
			player2_id=remaining_players[1],
			round_number=new_round_number
		)
		print(f"✅ Match {match1.id} ajouté : {match1.player1} vs {match1.player2}")

		# Le 3ème joueur passe en finale directement
		finalist = remaining_players[2]
		print(f"⚠️ {finalist} passe directement en finale")

		return

	for i in range(0, len(remaining_players), 2):
		player1 = remaining_players[i]
		player2 = remaining_players[i + 1] if i + 1 < len(remaining_players) else None

		match = TournamentMatch.objects.create(
			tournament=tournament,
			player1_id=player1,
			player2_id=player2,
			round_number=new_round_number
		)
		print(f"✅ Nouveau match ajouté (Tour {new_round_number}) : {match.player1} vs {match.player2 if match.player2 else 'Bye'}")

def generate_tournament_bracket(tournament):
	"""
	Génère les premiers matchs du tournoi.
	"""
	from config.models import TournamentMatch, TournamentPlayer

	players = list(
		TournamentPlayer.objects.filter(tournament=tournament)
		.values_list("player_id", flat=True)
	)

	print(f"🎯 Joueurs inscrits : {players}")

	if len(players) % 2 != 0:
		print("⚠️ Nombre impair de joueurs, impossible de générer les matchs.")
		return

	round_number = 1
	for i in range(0, len(players), 2):
		match = TournamentMatch.objects.create(
			tournament=tournament,
			player1_id=players[i],
			player2_id=players[i + 1],
			round_number=round_number
		)
		print(f"✅ Match {match.id} ajouté : {match.player1} vs {match.player2}")

	print("✅ Premier tour généré !")
