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
			if (data.otp_required) {
                showOtpInput(data.user_id);
                return false;
            }
			
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);

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

function showOtpInput(userId) {
    const loginForm = document.getElementById("login-form");
    loginForm.innerHTML = `
        <h2 data-translate="2fa-required">🔑 2FA Required</h2>
        <p data-translate="enter-OTP">Enter the code from your authenticator app.</p>
        <input type="text" id="otp-code" placeholder="Enter OTP">
        <button id="verify-otp" data-translate="verify-otp">Verify</button>
    `;

    document.getElementById("verify-otp").addEventListener("click", () => {
        submitOtp(userId);
    });
}


async function submitOtp(userId) {
    const otpInput = document.getElementById("otp-code");
    if (!otpInput) {
        console.error("❌ Impossible de trouver l'input OTP !");
        return;
    }

    const otp = otpInput.value;
    console.log("Envoi du code OTP :", otp);  // DEBUG

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, otp_code: otp })
        });

        const data = await response.json();
        console.log("Réponse API :", data);  // DEBUG

        if (response.ok) {
            alert("✅ 2FA validé avec succès !");
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            await fetchUserProfile();
            navigate("#/profile");
        } else {
            console.warn("⚠ Code incorrect :", data.error);
            alert("⚠ Code incorrect !");
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du 2FA :", error);
    }
}
