import { navigate } from "./app.js";
import { refreshToken } from "./user.js";
import { check2FAStatus } from "./2fa.js"
import { fetchUserProfile } from "./user.js";
import { loadLanguage } from "./language.js";

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

export function loadProfile() {
    const user = getCurrentUser();
    
    if (!user) {
        navigate("#/login");
        return;
    }

    // Vérifier si les éléments existent avant de les modifier
    const profileUsername = document.getElementById("profile-username");
    const profileEmail = document.getElementById("profile-email");
    const profileGames = document.getElementById("profile-games");
    const profileLastSeen = document.getElementById("profile-last-seen");
    const avatarImg = document.getElementById("avatar-img");

    const savedAvatar = localStorage.getItem("selectedAvatar") || "assets/avatars/avataralien.png";
    avatarImg.src = savedAvatar;

    if (profileUsername) profileUsername.textContent = user.username || "Unknown";
    if (profileEmail) profileEmail.textContent = user.email || "No email";
    if (profileGames) profileGames.textContent = user.number_of_games_played || 0;
    if (profileLastSeen) profileLastSeen.textContent = user.last_seen || "N/A";

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
            await fetchUserProfile();
            navigate("#/profile");
        } else {
            console.error("❌ Failed to update avatar:", data.error);
        }
    } catch (error) {
        console.error("❌ Error updating avatar:", error);
    }
}


export async function savePreferredLanguage() {
    let token = localStorage.getItem("access_token");
    if (!token) {
        console.error("❌ Aucun token trouvé, impossible d'enregistrer la langue.");
        return;
    }

    const selectedLanguage = document.getElementById("language-select").value;
    console.log(`🌍 Tentative d'enregistrement de la langue : ${selectedLanguage}`);

    try {
        const response = await fetch("http://127.0.0.1:4000/api/auth/set-language/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ language: selectedLanguage })
        });

        console.log("📩 Réponse API :", response);

        if (response.ok) {
            localStorage.setItem("preferredLanguage", selectedLanguage);
            await loadLanguage(selectedLanguage);
            console.log(`✅ Langue enregistrée avec succès : ${selectedLanguage}`);
        } else {
            console.error("❌ Erreur lors de l'enregistrement de la langue.");
            const errorData = await response.json();
            console.error("Détails de l'erreur :", errorData);
        }
    } catch (error) {
        console.error("❌ Erreur lors de la requête :", error);
    }
}


document.addEventListener("DOMContentLoaded", check2FAStatus);

document.addEventListener("DOMContentLoaded", () => {
    const saveLanguageBtn = document.getElementById("save-language-btn");

    if (saveLanguageBtn) {
        console.log("✅ Bouton Save Language détecté !");
        saveLanguageBtn.addEventListener("click", savePreferredLanguage);
    } else {
        console.error("❌ Bouton Save Language NON détecté !");
    }
});
