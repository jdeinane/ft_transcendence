import { refreshToken } from "./user.js";

const API_BASE_URL = "http://127.0.0.1:4000";

export async function enable2FA() {
    let token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
        console.warn("Expired token, trying to refresh...");
        const refreshed = await refreshToken();

        if (!refreshed) {
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
            alert("2FA successfully activated !");
			check2FAStatus();
            console.log("Secret OTP :", data.otp_secret);
        } else {
            alert(data.message || "Error while activating 2FA.");
        }
    } catch (error) {
        console.error("Error while activating 2FA :", error);
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
            alert("2FA successfully deactivated !");
			check2FAStatus();
        } else {
            const data = await response.json();
            alert(data.message || "encountered error while deactivating 2FA.");
        }
    } catch (error) {
        console.error("Failed to deactivate 2FA :", error);
    }
}

export async function verify2FA(otpCode) {
    const token = localStorage.getItem("access_token");

    if (!token) {
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
            return true;
        } else {
            alert(data.error || "Invalid 2FA code.");
            return false;
        }
    } catch (error) {
        console.error("Failed to check 2FA :", error);
        return false;
    }
}

window.enable2FA = enable2FA;
window.disable2FA = disable2FA;

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000;
        return Date.now() >= exp;
    } catch (e) {
        return true;
    }
}

const token = localStorage.getItem("access_token");
if (token && isTokenExpired(token)) {
    console.warn("Token JWT expired, need refresh !!");
}

export async function check2FAStatus() {
    let token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
        console.warn("Expired token ma gueule");
        const refreshed = await refreshToken();

        if (!refreshed) {
            console.error("Impossible to fetch 2FA status: Invalid token.");
            return;
        }

        token = localStorage.getItem("access_token");
    }

    try {
        console.log("Checking 2FA status with token :", token);

        const response = await fetch("http://127.0.0.1:4000/api/auth/me/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch 2FA status. Code :", response.status);
            return;
        }

        const userData = await response.json();
        const is2FAEnabled = userData.two_factor_secret !== null;

        console.log("🔍 2FA activé :", is2FAEnabled);

        const activateBtn = document.getElementById("activate-2fa-btn");
        const deactivateBtn = document.getElementById("deactivate-2fa-btn");

        if (activateBtn && deactivateBtn) {
            activateBtn.style.display = is2FAEnabled ? "none" : "block";
            deactivateBtn.style.display = is2FAEnabled ? "block" : "none";
		}
    } catch (error) {
        console.error("Failed to verify 2FA :", error);
    }
}

function waitFor2FAButtons() {
    const observer = new MutationObserver((mutations, obs) => {
        const activateBtn = document.getElementById("activate-2fa-btn");
        const deactivateBtn = document.getElementById("deactivate-2fa-btn");

        if (activateBtn && deactivateBtn) {
            check2FAStatus();
            obs.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

waitFor2FAButtons();