function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const todoListAll = document.getElementById('list-all');
const todoListPending = document.getElementById('list-pending');
const todoListCompleted = document.getElementById('list-completed');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    renderTodos();
});

todoForm.addEventListener('submit', handleAddTodo);

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

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
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
    return li;
}

function renderTodos() {
    todoListAll.innerHTML = '';
    todoListPending.innerHTML = '';
    todoListCompleted.innerHTML = '';

    if (todos.length === 0) {
        // Optional: show empty state in 'All' or just leave blank
        todoListAll.innerHTML = '<li style="text-align:center; color: var(--text-muted); padding: 1rem;">No tasks found.</li>';
        return;
    }

    todos.forEach(todo => {
        // Clone for multiple lists
        const itemAll = createTodoElement(todo);
        const itemPending = createTodoElement(todo); // Only if pending
        const itemCompleted = createTodoElement(todo); // Only if completed
        
        // 1. Add to All
        todoListAll.appendChild(itemAll);

        // 2. Add to Pending or Completed
        if (todo.completed) {
            todoListCompleted.appendChild(itemCompleted);
        } else {
            todoListPending.appendChild(itemPending);
        }
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
