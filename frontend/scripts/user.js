import { navigate, updateNavigation } from "./app.js"
import { translate } from "./language.js";

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
        showError("login-error", "All fields are required!");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            
            console.log("✅ Connexion réussie, récupération du profil...");
            
            await fetchUserProfile(); // Assure-toi que l'utilisateur est chargé

            console.log("✅ Navigation vers le profil");
            navigate("#/profile");

            return true;
        } else {
            showError("login-error", data.error || "Invalid credentials");
            return false;
        }
    } catch (error) {
        console.error("❌ Error:", error);
        showError("login-error", "Something went wrong");
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
        console.warn("No access token found, trying to refresh...");
        const refreshed = await refreshToken();
        if (!refreshed) return;
        token = localStorage.getItem("access_token");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const user = await response.json();
            console.log("👤 Profil utilisateur récupéré :", user);
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            updateNavigation();
        } else {
            console.warn("Failed to fetch user profile");
        }
    } catch (error) {
        console.error("Error fetching user:", error);
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
