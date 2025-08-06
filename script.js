document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const taskDifficulty = document.getElementById('taskDifficulty');
    const taskTime = document.getElementById('taskTime');
    const taskPriority = document.getElementById('taskPriority');
    const priorityValue = document.getElementById('priorityValue');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    
    // Initialize tasks from localStorage or empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Update priority display
    taskPriority.addEventListener('input', function() {
        priorityValue.textContent = this.value;
    });
    
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
    
    // Sort tasks
    sortSelect.addEventListener('change', function() {
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    });
    
    // Add task function
    function addTask() {
        const taskText = taskInput.value.trim();
        const difficulty = taskDifficulty.value;
        const time = parseInt(taskTime.value) || 30;
        const priority = parseInt(taskPriority.value) || 3;
        
        if (taskText === '') {
            alert('Please enter a task description!');
            return;
        }
        
        // Create task object
        const task = {
            id: Date.now(),
            text: taskText,
            difficulty: difficulty,
            time: time,
            priority: priority,
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
        
        // Sort tasks based on selected option
        const sortOption = sortSelect.value;
        filteredTasks.sort((a, b) => {
            switch (sortOption) {
                case 'difficulty-asc':
                    const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                case 'difficulty-desc':
                    const difficultyOrderDesc = { 'easy': 3, 'medium': 2, 'hard': 1 };
                    return difficultyOrderDesc[a.difficulty] - difficultyOrderDesc[b.difficulty];
                case 'time-asc':
                    return a.time - b.time;
                case 'time-desc':
                    return b.time - a.time;
                case 'priority-asc':
                    return a.priority - b.priority;
                case 'priority-desc':
                    return b.priority - a.priority;
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
        
        // Render tasks
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <li class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>Add a new task or change your filter to see your tasks here</p>
                </li>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const difficultyClass = `difficulty-${task.difficulty}`;
            const difficultyText = task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1);
            const priorityPercent = (task.priority / 5) * 100;
            
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <button class="delete-btn" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="task-meta">
                    <div class="meta-item">
                        <span class="meta-label">Difficulty</span>
                        <span class="meta-value difficulty-value ${difficultyClass}">${difficultyText}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Time</span>
                        <div class="task-time">
                            <i class="fas fa-clock"></i>
                            <span class="meta-value">${task.time} min</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Priority</span>
                        <span class="meta-value">${task.priority}/5</span>
                        <div class="priority-display-bar">
                            <div class="priority-fill" style="width: ${priorityPercent}%"></div>
                        </div>
                    </div>
                </div>
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
        taskCount.textContent = `${totalTasks} tasks (${completedTasks} completed)`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Sample tasks for initial demonstration
    function createSampleTasks() {
        if (tasks.length === 0) {
            tasks = [
                {
                    id: 1,
                    text: "Design homepage layout",
                    difficulty: "medium",
                    time: 120,
                    priority: 4,
                    completed: false,
                    createdAt: new Date()
                },
                {
                    id: 2,
                    text: "Write project documentation",
                    difficulty: "hard",
                    time: 90,
                    priority: 5,
                    completed: true,
                    createdAt: new Date(Date.now() - 86400000)
                },
                {
                    id: 3,
                    text: "Review team proposals",
                    difficulty: "easy",
                    time: 45,
                    priority: 3,
                    completed: false,
                    createdAt: new Date(Date.now() - 172800000)
                }
            ];
            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    }
    
    // Create sample tasks on first load
    createSampleTasks();
});