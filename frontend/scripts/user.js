import { navigate, updateNavigation } from "./app.js"
import { translate } from "./language.js";
import { verify2FA } from "./2fa.js";
import { loadProfile } from "./profile.js";

const API_BASE_URL = "http://127.0.0.1:4000";

function showError(elementId, message) {
	const errorElement = document.getElementById(elementId);
	if (errorElement) {
		errorElement.textContent = message;
		errorElement.classList.add("shake"); // effet secousse
		setTimeout(() => errorElement.classList.remove("shake"), 500); // enleve l'effet apres 0.5s
	}
  }

export async function createUser(username, password, email, confirmPassword) {
	if (!username || !password || !email || !confirmPassword) {
		showError("signup-error", translate("all-fields-required"));
		return;
	}

	if (password !== confirmPassword) {
		showError("signup-error", translate("passwords-no-match"));
		return;
	}

	try {
		const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ 
				username, 
				email, 
				password, 
				confirm_password: confirmPassword
			})
		});

		const data = await response.json();
		if (response.ok) {
			alert("Account successfully created!");
			navigate("#/login");
		} else {
			showError("signup-error", data.error || "Registration failed");
		}
	} catch (error) {
		console.error("Error:", error);
		showError("signup-error", "Something went wrong. Check your backend.");
	}
}


export async function loginUser(username, password) {
    if (!username || !password) {
        showError("login-error", "Tous les champs sont requis !");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);

            console.log("✅ Connexion réussie, récupération du profil...");

            // Vérification du 2FA après connexion
            const otpRequired = data.otp_required; // Ajoute cette info côté backend

            if (otpRequired) {
                const otpCode = prompt("Entrez votre code 2FA :");
                const verified = await verify2FA(otpCode);

                if (!verified) {
                    console.error("❌ Code 2FA invalide !");
                    logoutUser();
                    return false;
                }
            }

            await fetchUserProfile();
            navigate("#/profile");

            return true;
        } else {
            showError("login-error", data.error || "Identifiants invalides.");
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur de connexion :", error);
        showError("login-error", "Une erreur s'est produite.");
        return false;
    }
}

export function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("loggedInUser");
    navigate("#/");
    updateNavigation();
}

export async function fetchUserProfile() {
    let token = localStorage.getItem("access_token");
    
    if (!token) {
        console.warn("❌ Aucun access token trouvé, tentative de rafraîchissement...");
        const refreshed = await refreshToken();
        if (!refreshed) {
            console.error("🚨 Impossible de récupérer le profil utilisateur !");
            return;
        }
        token = localStorage.getItem("access_token");
    }

    console.log("🔍 Vérification du profil avec token :", token);

    try {
        const response = await fetch("http://127.0.0.1:4000/api/auth/me/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("❌ Impossible de récupérer le profil, statut :", response.status);
            return;
        }

        const user = await response.json();
        console.log("👤 Profil utilisateur récupéré :", user);

        localStorage.setItem("loggedInUser", JSON.stringify(user));
        localStorage.setItem("selectedAvatar", `assets/avatars/${user.avatar_url}`);
        loadProfile();
        updateNavigation();

    } catch (error) {
        console.error("❌ Erreur lors de la récupération du profil utilisateur :", error);
    }
}



export function getCurrentUser() {
	return JSON.parse(localStorage.getItem("loggedInUser"));
}

export async function refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
        console.error("❌ Aucun refresh token trouvé, impossible de renouveler l'accès.");
        logoutUser();
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("access_token", data.access);
            console.log("✅ Token rafraîchi avec succès !");
            return true;
        } else {
            console.error("❌ Échec du rafraîchissement du token :", data);
            logoutUser();
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur lors du rafraîchissement du token:", error);
        logoutUser();
        return false;
    }
}
