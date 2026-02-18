// Function to generate unique IDs
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Select DOM Elements
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const dateInput = document.getElementById("date-input");
const fileInput = document.getElementById("file-input");
const fileNameDisplay = document.getElementById("file-name");
const todoList = document.getElementById("todo-list");
const filterBtns = document.querySelectorAll(".filter-btn");

// State
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Set min date to today
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
  renderTodos();
});

todoForm.addEventListener("submit", handleAddTodo);

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    fileNameDisplay.textContent = e.target.files[0].name;
  } else {
    fileNameDisplay.textContent = "No file chosen";
  }
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    // Update Active Button
    filterBtns.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");

    // Update State & Render
    currentFilter = e.target.dataset.filter;
    renderTodos();
  });
});

// Functions
async function handleAddTodo(e) {
  e.preventDefault();

  const text = todoInput.value.trim();
  const date = dateInput.value;
  const file = fileInput.files[0];
  let imageData = null;

  if (!text || !date) {
    alert("Please fill in both task name and date.");
    return;
  }

  if (file) {
    if (file.type !== "image/png") {
      alert("Only PNG files are allowed.");
      fileInput.value = "";
      fileNameDisplay.textContent = "No file chosen";
      return;
    }
    // Resize image if too large (optional optimization for localStorage)
    imageData = await readImage(file);
  }

  const newTodo = {
    id: generateId(),
    text,
    date,
    image: imageData,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  resetForm();
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}

function saveTodos() {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch (e) {
    alert("Storage quota exceeded! Cannot save more images.");
    console.error(e);
  }
}

function resetForm() {
  todoForm.reset();
  fileNameDisplay.textContent = "No file chosen";
}

function renderTodos() {
  todoList.innerHTML = "";

  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "pending") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
  });

  if (filteredTodos.length === 0) {
    todoList.innerHTML =
      '<li style="text-align:center; color: var(--text-muted); padding: 1rem;">No tasks found.</li>';
    return;
  }

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;

    li.innerHTML = `
            <button class="todo-check" onclick="toggleTodo('${todo.id}')">
                <i class="fa-solid fa-check"></i>
            </button>
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <span class="todo-date">
                    <i class="fa-regular fa-calendar"></i> ${formatDate(todo.date)}
                </span>
            </div>
            ${todo.image ? `<img src="${todo.image}" class="todo-image" alt="Task attachment" onclick="viewImage('${todo.image}')">` : ""}
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

    todoList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Global expose for onclick
window.deleteTodo = deleteTodo;
window.toggleTodo = toggleTodo;
window.viewImage = (src) => {
  const w = window.open("");
  w.document.write(`<img src="${src}" style="max-width: 100%; height: auto;">`);
};
