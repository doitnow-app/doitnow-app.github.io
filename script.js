// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Initialize tasks from localStorage or empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Initial render
    renderTasks();
    updateTaskCount();
    
    // Add task event
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Filter tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter tasks
            renderTasks(this.dataset.filter);
        });
    });
    
    // Add task function
    function addTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }
        
        // Create task object
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        tasks.unshift(task);
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        // Clear input
        taskInput.value = '';
        taskInput.focus();
    }
    
    // Render tasks function
    function renderTasks(filter = 'all') {
        // Clear task list
        taskList.innerHTML = '';
        
        // Filter tasks
        let filteredTasks = tasks;
        
        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Render tasks
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>Add a new task or change your filter</p>
                </div>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
            `;
            taskList.appendChild(taskItem);
        });
        
        // Add event listeners to checkboxes and delete buttons
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskStatus);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
    }
    
    // Toggle task status
    function toggleTaskStatus(e) {
        const taskId = parseInt(e.target.dataset.id);
        const task = tasks.find(task => task.id === taskId);
        
        if (task) {
            task.completed = e.target.checked;
            saveTasks();
            renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
            updateTaskCount();
        }
    }
    
    // Delete task
    function deleteTask(e) {
        const taskId = parseInt(e.target.closest('.delete-btn').dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        updateTaskCount();
    }
    
    // Clear completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        updateTaskCount();
    }
    
    // Update task count
    function updateTaskCount() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        taskCount.textContent = `${totalTasks} task${totalTasks !== 1 ? 's' : ''} (${completedTasks} completed)`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});