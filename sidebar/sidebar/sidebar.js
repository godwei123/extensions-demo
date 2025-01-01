class TodoList {
    constructor() {
        this.todos = [];
        this.todoInput = document.getElementById('todo-input');
        this.addButton = document.getElementById('add-todo');
        this.todoList = document.getElementById('todo-list');

        this.init();
    }

    init() {
        // Load saved todos
        this.loadTodos();

        // Add event listeners
        this.addButton.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }

    async loadTodos() {
        const result = await chrome.storage.local.get('todos');
        this.todos = result.todos || [];
        this.renderTodos();
    }

    async saveTodos() {
        await chrome.storage.local.set({ todos: this.todos });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (text) {
            const todo = {
                id: Date.now(),
                text,
                completed: false,
            };

            this.todos.push(todo);
            this.saveTodos();
            this.renderTodos();
            this.todoInput.value = '';
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
    }

    renderTodos() {
        this.todoList.innerHTML = '';

        this.todos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            todoItem.innerHTML = `
                <input type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                />
                <span class="todo-text">${todo.text}</span>
                <button class="delete-button">×</button>
            `;

            const checkbox = todoItem.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

            const deleteButton = todoItem.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => this.deleteTodo(todo.id));

            this.todoList.appendChild(todoItem);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});
