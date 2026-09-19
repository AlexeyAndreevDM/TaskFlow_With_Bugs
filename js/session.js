// Все страницы используют один ключ сессии. Данные хранятся в этом браузере.
function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

function requireAuth() {
    const login = getCurrentUser();
    if (!login) {
        window.location.replace("index.html");
        return false;
    }

    // Если учётная запись была удалена из хранилища, старая сессия недействительна.
    if (login !== "admin") {
        let users;
        try {
            users = JSON.parse(localStorage.getItem("users") || "[]");
        } catch (_) {
            users = [];
        }
        if (!Array.isArray(users) || !users.some(user => user && user.login === login)) {
            localStorage.removeItem("currentUser");
            window.location.replace("index.html");
            return false;
        }
    }
    return true;
}

function logout() {
    window.location.replace("index.html");
}
