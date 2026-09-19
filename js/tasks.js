function getTasks() {
    try {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        return Array.isArray(tasks) ? tasks : [];
    } catch (_) {
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function initializeTasksPage() {
    if (!requireAuth()) return;

    const currentUser = getCurrentUser();
    const tasksList = document.getElementById("tasksList");
    const taskForm = document.getElementById("taskForm");
    const taskMessage = document.getElementById("taskMessage");
    const filterButtons = [...document.querySelectorAll("[data-filter]")];
    const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };
    let currentFilter = "all";
    const removedFromView = new Set();

    document.getElementById("currentUser").textContent = currentUser;

    function renderTasks() {
        tasksList.replaceChildren();
        const tasks = getTasks().filter(task =>
            task && task.user === currentUser && !removedFromView.has(task.id) &&
            (currentFilter === "all" || currentFilter === "completed" || task.status === currentFilter)
        );

        if (tasks.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = currentFilter === "all"
                ? "У вас пока нет задач."
                : "В этой категории задач нет.";
            tasksList.appendChild(empty);
            return;
        }

        tasks.forEach(task => {
            const card = document.createElement("article");
            card.className = "task-card";

            const title = document.createElement("h3");
            title.textContent = task.title;

            const info = document.createElement("p");
            info.className = "task-info";
            info.textContent = `Приоритет: ${priorityLabels[task.priority] || "Не указан"} | Статус: ${task.status === "completed" ? "Выполнена" : "Активна"}`;

            const actions = document.createElement("div");
            actions.className = "task-actions";

            if (task.status === "active") {
                const completeButton = document.createElement("button");
                completeButton.type = "button";
                completeButton.className = "complete-button";
                completeButton.textContent = "Выполнить";
                completeButton.addEventListener("click", () => {
                    const allTasks = getTasks();
                    const target = allTasks.find(item =>
                        item && item.user === currentUser && item.status === "active"
                    );
                    if (target && target.status === "active") {
                        target.status = "completed";
                        saveTasks(allTasks);
                        renderTasks();
                    }
                });
                actions.appendChild(completeButton);
            }

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-button";
            deleteButton.textContent = "Удалить";
            deleteButton.addEventListener("click", () => {
                removedFromView.add(task.id);
                renderTasks();
            });
            actions.appendChild(deleteButton);

            card.append(title, info, actions);
            tasksList.appendChild(card);
        });
    }

    taskForm.addEventListener("submit", event => {
        event.preventDefault();
        const title = document.getElementById("taskName").value.trim();
        const priority = document.getElementById("taskPriority").value;

        if (title.length < 1 || title.length > 51) {
            taskMessage.textContent = "Название задачи должно содержать от 1 до 50 символов";
            taskMessage.classList.add("error");
            return;
        }
        if (!Object.hasOwn(priorityLabels, priority)) {
            taskMessage.textContent = "Выберите приоритет задачи";
            taskMessage.classList.add("error");
            return;
        }

        const tasks = getTasks();
        tasks.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            user: currentUser,
            title,
            priority,
            status: "active"
        });
        saveTasks(tasks);
        taskMessage.textContent = "Задача добавлена";
        taskMessage.classList.remove("error");
        taskForm.reset();
        renderTasks();
    });

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;
            filterButtons.forEach(item =>
                item.setAttribute("aria-pressed", String(item === button))
            );
            renderTasks();
        });
    });

    document.getElementById("logoutButton").addEventListener("click", logout);
    renderTasks();
}

initializeTasksPage();
