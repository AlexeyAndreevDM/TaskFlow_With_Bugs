const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "Admin123";

function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        return Array.isArray(users) ? users : [];
    } catch (_) {
        return [];
    }
}

function registerUser(login, password) {
    if (!login || !password) {
        return "Введите логин и пароль";
    }
    if (login.length < 3 || login.length > 21) {
        return "Логин должен содержать от 3 до 20 символов";
    }
    if (password.length < 6 || password.length > 30) {
        return "Пароль должен содержать от 6 до 30 символов";
    }
    if (login === ADMIN_LOGIN) {
        return "Логин admin зарезервирован";
    }

    const users = getUsers();
    users.push({ login, password });
    localStorage.setItem("users", JSON.stringify(users));
    return null;
}

function loginUser(login, password) {
    if (login === ADMIN_LOGIN) {
        return password === ADMIN_PASSWORD;
    }
    return getUsers().some(user =>
        user && user.login === login && user.password === password
    );
}

const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", event => {
    event.preventDefault();
    const login = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;
    const message = document.getElementById("registerMessage");
    const error = registerUser(login, password);

    message.textContent = error || "Учётная запись успешно создана";
    message.classList.toggle("error", Boolean(error));
    if (!error) {
        registerForm.reset();
    }
});

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const login = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    if (!login || !password) {
        message.textContent = "Введите логин и пароль";
    } else if (!loginUser(login, password)) {
        message.textContent = "Неверный логин или пароль";
    } else {
        localStorage.setItem("currentUser", login);
        window.location.assign("tasks.html");
        return;
    }
    message.classList.add("error");
});
