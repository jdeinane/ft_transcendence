import { refreshToken } from "./user.js";

const API_BASE_URL = "http://127.0.0.1:4000";

export async function enable2FA() {
    let token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
        console.warn("🚨 Token expiré, tentative de rafraîchissement...");
        const refreshed = await refreshToken();

        if (!refreshed) {
            alert("❌ Impossible d'activer le 2FA. Connexion requise.");
            return;
        }

        token = localStorage.getItem("access_token");
    }

    try {
        const response = await fetch("http://127.0.0.1:4000/api/auth/enable-2fa/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ 2FA activé avec succès !");
			check2FAStatus();
            console.log("🔐 OTP Secret :", data.otp_secret);
        } else {
            alert(data.message || "❌ Erreur lors de l'activation du 2FA.");
        }
    } catch (error) {
        console.error("❌ Erreur activation 2FA :", error);
    }
}

export async function disable2FA() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Vous devez être connecté pour désactiver le 2FA.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/disable-2fa/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("2FA désactivé avec succès !");
			check2FAStatus();
        } else {
            const data = await response.json();
            alert(data.message || "Erreur lors de la désactivation du 2FA.");
        }
    } catch (error) {
        console.error("❌ Erreur désactivation 2FA :", error);
    }
}

export async function verify2FA(otpCode) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Vous devez être connecté pour vérifier le 2FA.");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ otp_code: otpCode })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Vérification réussie !");
            return true;
        } else {
            alert(data.error || "Code 2FA invalide.");
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur vérification 2FA :", error);
        return false;
    }
}

window.enable2FA = enable2FA;
window.disable2FA = disable2FA;

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));  // Décoder le token JWT
        const exp = payload.exp * 1000;  // Convertir en millisecondes
        return Date.now() >= exp;  // Comparer la date actuelle
    } catch (e) {
        return true;  // Considérer comme expiré si erreur
    }
}

const token = localStorage.getItem("access_token");
if (token && isTokenExpired(token)) {
    console.warn("🚨 Token JWT expiré, rafraîchissement nécessaire !");
}

export async function check2FAStatus() {
    let token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
        console.warn("🚨 Token expiré, tentative de rafraîchissement...");
        const refreshed = await refreshToken();

        if (!refreshed) {
            console.error("❌ Impossible de récupérer le statut du 2FA. Token invalide.");
            return;
        }

        token = localStorage.getItem("access_token");
    }

    try {
        console.log("🔍 Vérification du statut 2FA avec token :", token); // DEBUG

        const response = await fetch("http://127.0.0.1:4000/api/auth/me/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("❌ Erreur lors de la récupération du statut 2FA. Code :", response.status);
            return;
        }

        const userData = await response.json();
        const is2FAEnabled = userData.two_factor_secret !== null;

        console.log("🔍 2FA activé :", is2FAEnabled);

        // Vérifie si les boutons existent avant d'essayer de modifier leur style
        const activateBtn = document.getElementById("activate-2fa-btn");
        const deactivateBtn = document.getElementById("deactivate-2fa-btn");

        if (activateBtn && deactivateBtn) {
            activateBtn.style.display = is2FAEnabled ? "none" : "block";
            deactivateBtn.style.display = is2FAEnabled ? "block" : "none";
        } else {
            console.warn("⚠ Les boutons 2FA ne sont pas présents dans le DOM.");
        }

    } catch (error) {
        console.error("❌ Erreur lors de la vérification du 2FA :", error);
    }
}

function waitFor2FAButtons() {
    const observer = new MutationObserver((mutations, obs) => {
        const activateBtn = document.getElementById("activate-2fa-btn");
        const deactivateBtn = document.getElementById("deactivate-2fa-btn");

        if (activateBtn && deactivateBtn) {
            console.log("✅ Boutons 2FA détectés, lancement de check2FAStatus...");
            check2FAStatus();
            obs.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

waitFor2FAButtons();
