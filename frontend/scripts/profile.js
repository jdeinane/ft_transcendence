import { navigate } from "./app.js";
import { refreshToken } from "./user.js";
import { check2FAStatus } from "./2fa.js"
import { fetchUserProfile } from "./user.js";

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

export function loadProfile() {
    const user = getCurrentUser();

    if (!user) {
        navigate("#/login");
        return;
    }

    const avatarImg = document.getElementById("avatar-img");
    const savedAvatar = localStorage.getItem("selectedAvatar") || "assets/avatars/avataralien.png";
    avatarImg.src = savedAvatar;

    document.getElementById("profile-username").textContent = user.username || "Unknown";
    document.getElementById("profile-email").textContent = user.email || "No email";
    document.getElementById("profile-games").textContent = user.gamesPlayed || 0;
    document.getElementById("profile-last-seen").textContent = user.lastSeen || "N/A";

    const editProfileBtn = document.getElementById("edit-profile-btn");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => navigate("#/edit-profile"));
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("loggedInUser");
            navigate("#/");
        });
    }
}

export function loadEditProfile() {
    const avatarImg = document.getElementById("avatar-img");
    const avatarOptions = document.querySelectorAll(".avatar-option");
    const saveAvatarBtn = document.getElementById("save-avatar-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");

    const savedAvatar = localStorage.getItem("selectedAvatar") || "assets/avatars/avataralien.png";
    avatarImg.src = savedAvatar;

    avatarOptions.forEach((avatar) => {
        if (avatar.src === savedAvatar) {
            avatar.classList.add("selected");
        }
        avatar.addEventListener("click", () => {
            avatarOptions.forEach((a) => a.classList.remove("selected"));
            avatar.classList.add("selected");
            avatarImg.src = avatar.src;
        });
    });

    saveAvatarBtn.addEventListener("click", () => {
        saveAvatar(avatarImg.src);
    });

    cancelEditBtn.addEventListener("click", () => navigate("#/profile"));
}

export async function saveAvatar(selectedAvatar) {
    let token = localStorage.getItem("access_token");
    if (!token) {
        console.error("❌ Aucun token trouvé.");
        await refreshToken();
        token = localStorage.getItem("access_token");
        if (!token) {
            console.error("❌ Impossible de récupérer un token valide.");
            logoutUser();
            return;
        }
    }

    const avatarFilename = selectedAvatar.split("/").pop();

    try {
        console.log("🖼️ Avatar sélectionné:", avatarFilename);

        const response = await fetch("http://127.0.0.1:4000/api/auth/update-avatar/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ avatar_url: avatarFilename })
        });

        const data = await response.json();
        console.log("📩 Réponse API:", data);

        if (response.ok) {
            await fetchUserProfile();  // 🔥 Recharge le profil après mise à jour
            navigate("#/profile");
        } else {
            console.error("❌ Failed to update avatar:", data.error);
        }
    } catch (error) {
        console.error("❌ Error updating avatar:", error);
    }
}


document.addEventListener("DOMContentLoaded", check2FAStatus);
