import { navigate, updateNavigation } from "./app.js"
import { translate } from "./language.js";
import { verify2FA } from "./2fa.js";
import { loadMatchHistory, loadProfile } from "./profile.js";
import { loadLanguage } from "./language.js";

const API_BASE_URL = "http://127.0.0.1:4000";

function showError(elementId, message) {
	const errorElement = document.getElementById(elementId);
	if (errorElement) {
		errorElement.textContent = message;
		errorElement.classList.add("shake");
		setTimeout(() => errorElement.classList.remove("shake"), 500);
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
			localStorage.setItem("selectedAvatar", "assets/avatars/avataralien.png");
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
        showError("login-error", "All fields are required !");
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

            if (data.otp_required) {
                const otpCode = prompt("Entrez votre code 2FA :");
                const verified = await verify2FA(otpCode);

                if (!verified) {
                    console.error("Invalid 2FA code");
                    logoutUser();
                    return false;
                }
            }

            const profileResponse = await fetch(`${API_BASE_URL}/api/auth/me/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${data.access}`,
                    "Content-Type": "application/json"
                }
            });

            if (profileResponse.ok) {
                const user = await profileResponse.json();
                localStorage.setItem("loggedInUser", JSON.stringify(user));

                if (user.language) {
                    localStorage.setItem("preferredLanguage", user.language);
                    await loadLanguage(user.language);
                    console.log(`Langue definie sur : ${user.language}`);
                }
            }
			await fetchUserProfile();

			setTimeout(async () => {
				await fetchMatchHistory();
				loadMatchHistory();
				navigate("#/profile");
			}, 500);

			return true;
        } else {
            showError("login-error", data.error || "Invalid credentials.");
            return false;
        }
    } catch (error) {
        showError("login-error", "An error has occured.");
        return false;
    }
}

export function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("loggedInUser");
	localStorage.removeItem("selectedAvatar")
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
            console.log("Profile user fetched :", user);
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            localStorage.setItem("selectedAvatar", user.avatar_url.startsWith("http") ? user.avatar_url : `assets/avatars/${user.avatar_url}`);
			document.getElementById("profile-games").textContent = user.number_of_games_played || 0;
			loadProfile();
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
            console.log("✅ Token successfully refreshed !");
            return true;
        } else {
            logoutUser();
            return false;
        }
    } catch (error) {
        logoutUser();
        return false;
    }
}

export async function fetchMatchHistory() {
    let token = localStorage.getItem("access_token");
    if (!token) {
        console.warn("No access token found, cannot fetch match history.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:4000/api/match-history/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("📜 Match history retrieved:", data.matches);
            localStorage.setItem("matchHistory", JSON.stringify(data.matches));

			loadMatchHistory();
        } else {
            console.warn("Failed to fetch match history");
        }
    } catch (error) {
        console.error("Error fetching match history:", error);
    }
}
