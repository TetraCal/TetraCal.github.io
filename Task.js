document.addEventListener('DOMContentLoaded', function() {
    
    var tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(function(task) {
        addTaskToList(task);
    });

 
    document.getElementById('to-do-form').addEventListener('submit', function(event) {
        event.preventDefault();

        var taskInput = document.getElementById('task').value;

        if (taskInput.trim() !== '') {
            addTaskToList(taskInput); 
            saveTaskToLocalStorage(taskInput); 
            document.getElementById('task').value = '';
        } else {
            alert('Please enter a task.');
        }
    });

    function addTaskToList(taskInput) {
        var listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
            <input type="checkbox" class="form-check-input me-2">
            <span>${taskInput}</span>
            <div class="task-buttons">
                <button class="btn btn-sm btn-primary edit-button"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-button"><i class="fas fa-times"></i></button>
            </div>
        `;
        document.getElementById('task-list').appendChild(listItem);
    }

    
    function saveTaskToLocalStorage(task) {
        var tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

   
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-button')) {
            var listItem = event.target.closest('.list-group-item');
            var taskText = listItem.querySelector('span').textContent;
            removeTaskFromLocalStorage(taskText);
            listItem.remove();
        }
    });

   
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-button')) {
            var listItem = event.target.closest('.list-group-item');
            var taskText = listItem.querySelector('span').textContent;
            var newTaskText = prompt('Edit Task', taskText);
            if (newTaskText !== null && newTaskText.trim() !== '') {
                listItem.querySelector('span').textContent = newTaskText;
                updateTaskInLocalStorage(taskText, newTaskText);
            }
        }
    });

    
    function removeTaskFromLocalStorage(task) {
        var tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        var index = tasks.indexOf(task);
        if (index !== -1) {
            tasks.splice(index, 1);
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    function updateTaskInLocalStorage(oldTask, newTask) {
        var tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        var index = tasks.indexOf(oldTask);
        if (index !== -1) {
            tasks[index] = newTask;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }
});

    document.addEventListener('change', function(event) {
         if (event.target.type === 'checkbox') {
         var listItem = event.target.closest('.list-group-item');
             listItem.classList.toggle('checked');
    }
});
