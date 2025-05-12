// Digital Clock
function updateClock() {
const now = new Date();

// Time in 12-hour format
let hours = now.getHours();
const ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12; // Convert 0 to 12
const minutes = now.getMinutes().toString().padStart(2, '0');
const seconds = now.getSeconds().toString().padStart(2, '0');

document.getElementById('time').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;

    // Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call

// To-Do List
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Render todos
function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(index));
        
        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;
        if (todo.completed) {
            span.classList.add('todo-completed');
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-btn delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            deleteTodo(index);
        });
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}

// Add new todo
function addTodo(e) {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
}

// Toggle todo completion
function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

// Delete todo
function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Event listeners
todoForm.addEventListener('submit', addTodo);

// Initial render
renderTodos();

// Google Search with Suggestions
const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');
let abortController = null;

// Fetch suggestions from Google Suggest API
async function fetchSuggestions(query) {
    if (abortController) {
        abortController.abort();
    }
    
    abortController = new AbortController();
    
    try {
        const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`, {
            signal: abortController.signal
        });
        const data = await response.json();
        return data[1] || []; // Return the suggestions array
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error fetching suggestions:', error);
        }
        return [];
    }
}

// Display suggestions
function showSuggestions(suggestions) {
    searchSuggestions.innerHTML = '';
    
    if (suggestions.length === 0) {
        searchSuggestions.classList.remove('show');
        return;
    }
    
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        div.addEventListener('click', () => {
            searchInput.value = suggestion;
            searchSuggestions.classList.remove('show');
            document.getElementById('searchForm').submit();
        });
        searchSuggestions.appendChild(div);
    });
    
    searchSuggestions.classList.add('show');
}

// Handle input events with debounce
let debounceTimer;
searchInput.addEventListener('input', async () => {
    clearTimeout(debounceTimer);
    
    const query = searchInput.value.trim();
    if (query.length < 2) {
        searchSuggestions.classList.remove('show');
        return;
    }
    
    debounceTimer = setTimeout(async () => {
        const suggestions = await fetchSuggestions(query);
        showSuggestions(suggestions);
    }, 300);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchSuggestions.classList.remove('show');
    }
});

// Keyboard navigation
searchInput.addEventListener('keydown', (e) => {
    const suggestions = document.querySelectorAll('.suggestion-item');
    if (!suggestions.length) return;
    
    const currentFocus = document.querySelector('.suggestion-item.highlight');
    let index = Array.from(suggestions).indexOf(currentFocus);
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentFocus) currentFocus.classList.remove('highlight');
        index = (index + 1) % suggestions.length;
        suggestions[index].classList.add('highlight');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentFocus) currentFocus.classList.remove('highlight');
        index = (index - 1 + suggestions.length) % suggestions.length;
        suggestions[index].classList.add('highlight');
    } else if (e.key === 'Enter' && currentFocus) {
        e.preventDefault();
        searchInput.value = currentFocus.textContent;
        searchSuggestions.classList.remove('show');
        document.getElementById('searchForm').submit();
    }
});
