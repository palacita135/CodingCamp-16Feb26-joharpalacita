function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    renderTodos();
});

todoForm.addEventListener('submit', handleAddTodo);

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        currentFilter = e.target.dataset.filter;
        renderTodos();
    });
});

function handleAddTodo(e) {
    e.preventDefault();

    const text = todoInput.value.trim();
    const date = dateInput.value;

    if (!text || !date) {
        alert('Please fill in both task name and date.');
        return;
    }

    const newTodo = {
        id: generateId(),
        text,
        date,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    resetForm();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function resetForm() {
    todoForm.reset();
}

function renderTodos() {
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li style="text-align:center; color: var(--text-muted); padding: 1rem;">No tasks found.</li>';
        return;
    }

    filteredTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.style.animationDelay = `${index * 0.05}s`;
        
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
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        
        todoList.appendChild(li);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

window.deleteTodo = deleteTodo;
window.toggleTodo = toggleTodo;
