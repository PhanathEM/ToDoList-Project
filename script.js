// Target UI Elements
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const dateStringElem = document.getElementById("date-string");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// Global Application Engine State
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentTheme = localStorage.getItem("theme") || "light";

// Mount active configs on application start
function init() {
  // Apply saved theme state
  if (currentTheme === "dark") {
    document.body.classList.replace("light-mode", "dark-mode");
    themeIcon.className = "bi bi-sun-fill";
  }

  // Set Header Date
  const options = { weekday: "long", month: "short", day: "numeric" };
  dateStringElem.innerText = new Date().toLocaleDateString("en-US", options);

  renderTodos();
}

// Global state sync mechanism
function syncState() {
  localStorage.setItem("todos", JSON.stringify(todos));
  updateProgress();
}

// B&W Theme Management Module
themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("light-mode")) {
    document.body.classList.replace("light-mode", "dark-mode");
    themeIcon.className = "bi bi-sun-fill";
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.replace("dark-mode", "light-mode");
    themeIcon.className = "bi bi-moon-fill";
    localStorage.setItem("theme", "light");
  }
});

// Primary UI Layout Parser
function renderTodos() {
  todoList.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;

    if (todo.isEditing) {
      li.innerHTML = `
                <div class="edit-container">
                    <input type="text" class="edit-input" id="edit-input-${index}" value="${escapeHTML(todo.text)}">
                    <span class="todo-date">${todo.date}</span>
                </div>
                <div class="action-buttons">
                    <button class="action-btn" onclick="saveEdit(${index})" aria-label="Save changes">
                        <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="action-btn" onclick="cancelEdit(${index})" aria-label="Cancel edit">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `;
      setTimeout(() => {
        const el = document.getElementById(`edit-input-${index}`);
        el.focus();
        el.addEventListener("keypress", (e) => {
          if (e.key === "Enter") saveEdit(index);
        });
      }, 50);
    } else {
      li.innerHTML = `
                <div class="todo-content" onclick="toggleTodo(${index})">
                    <i class="bi ${todo.completed ? "bi-check-circle-fill" : "bi-circle"}"></i>
                    <div class="text-group">
                        <span class="todo-text">${escapeHTML(todo.text)}</span>
                        <span class="todo-date">${todo.date || ""}</span>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="action-btn" onclick="enableEdit(event, ${index})" aria-label="Edit task">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="action-btn" onclick="deleteTodo(event, ${index})" aria-label="Delete task">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            `;
    }
    todoList.appendChild(li);
  });

  updateProgress();
}

// Append new item objects with a clean timestamp
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();

  // Captures both date and current time
  const now = new Date();
  const taskDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const taskTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const fullTimestamp = `${taskDate} • ${taskTime}`;

  if (text !== "") {
    todos.push({
      text: text,
      completed: false,
      isEditing: false,
      date: fullTimestamp,
    });
    todoInput.value = "";
    renderTodos();
    syncState();
  }
});

// Flip item true/false status completed value
window.toggleTodo = function (index) {
  todos[index].completed = !todos[index].completed;
  renderTodos();
  syncState();
};

// Editing Operations Logic
window.enableEdit = function (event, index) {
  event.stopPropagation();
  todos[index].isEditing = true;
  renderTodos();
};

window.saveEdit = function (index) {
  const editInput = document.getElementById(`edit-input-${index}`);
  const updatedText = editInput.value.trim();

  if (updatedText !== "") {
    todos[index].text = updatedText;
    todos[index].isEditing = false;
    renderTodos();
    syncState();
  }
};

window.cancelEdit = function (index) {
  todos[index].isEditing = false;
  renderTodos();
};

// Item Removal logic
window.deleteTodo = function (event, index) {
  event.stopPropagation();
  todos.splice(index, 1);
  renderTodos();
  syncState();
};

// Progress bar logic calculations
function updateProgress() {
  if (todos.length === 0) {
    progressBar.style.width = "0%";
    progressText.innerText = "0% completed";
    return;
  }
  const completedCount = todos.filter((t) => t.completed).length;
  const percentage = Math.round((completedCount / todos.length) * 100);

  progressBar.style.width = `${percentage}%`;
  progressText.innerText = `${percentage}% completed (${completedCount}/${todos.length} tasks)`;
}

// Escape dangerous tags
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[tag] || tag);
}

init();
