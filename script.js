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

    document.addEventListener('change', function(event) {
        if (event.target.type === 'checkbox') {
            var listItem = event.target.closest('.list-group-item');
            listItem.classList.toggle('checked');
        }
    });

    let savings = {};
    let expenses = {};
    let totalSavings = 0;
    let totalExpenses = 0;
    let chart;
    let expenseChart;
    let notificationCount = 0;

    window.onload = function () {
        loadFromLocalStorage();
        updateChart();
        updateExpenseChart();
    };

    function loadFromLocalStorage() {
        const savedSavings = JSON.parse(localStorage.getItem('savings'));
        if (savedSavings) {
            savings = savedSavings;
            totalSavings = Object.values(savings).reduce((acc, cur) => acc + cur, 0);
        }

        const savedExpenses = JSON.parse(localStorage.getItem('expenses'));
        if (savedExpenses) {
            expenses = savedExpenses;
            totalExpenses = Object.values(expenses).reduce((acc, day) => acc + (day ? Object.values(day).reduce((a, b) => a + b, 0) : 0), 0);
        }

        document.getElementById('total-savings').textContent = totalSavings.toFixed(2);
        document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
    }

    function saveToLocalStorage() {
        localStorage.setItem('savings', JSON.stringify(savings));
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    function showSavings() {
        document.getElementById('savings-menu').style.display = 'block';
        document.getElementById('expenses-menu').style.display = 'none';
        document.getElementById('chart-container').style.display = 'block';
        document.getElementById('expense-chart-container').style.display = 'none';
    }

    function showExpenses() {
        document.getElementById('savings-menu').style.display = 'none';
        document.getElementById('expenses-menu').style.display = 'block';
        document.getElementById('chart-container').style.display = 'block';
        document.getElementById('expense-chart-container').style.display = 'block';
    }

    document.getElementById('add-saving-button').addEventListener('click', addSaving);
    document.getElementById('add-expense-button').addEventListener('click', addExpense);

    function addSaving() {
        const savingAmount = parseFloat(document.getElementById('saving-amount').value);
        const day = parseInt(document.getElementById('saving-day').value);
        if (!isNaN(savingAmount) && !isNaN(day) && day > 0) {
            savings[day] = (savings[day] || 0) + savingAmount;
            totalSavings += savingAmount;
            document.getElementById('total-savings').textContent = totalSavings.toFixed(2);
            showNotification(`${savingAmount} is added to your Day ${day} Savings!`, 'savings-notification');
            updateChart();
            saveToLocalStorage();
        }
    }

    function addExpense() {
        const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
        const day = parseInt(document.getElementById('expense-day').value);
        const category = document.getElementById('expense-category').value;
        if (!isNaN(expenseAmount) && !isNaN(day) && day > 0) {
            expenses[day] = expenses[day] || {};
            expenses[day][category] = (expenses[day][category] || 0) + expenseAmount;
            totalExpenses += expenseAmount;
            document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
            showNotification(`${expenseAmount} is added to your Day ${day} ${category} Expenses!`, 'expenses-notification');
            updateChart();
            updateExpenseChart();
            saveToLocalStorage();
        }
    }

    function showNotification(message, type) {
        notificationCount++;
        const notificationContainer = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.classList.add('notification', type);
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
            notificationCount--;
        }, 3000);

        const history = type === 'savings-notification' ? document.getElementById('savings-history') : document.getElementById('expenses-history');
        const notificationItem = document.createElement('div');
        notificationItem.textContent = message;
        history.appendChild(notificationItem);

        const historyKey = type === 'savings-notification' ? 'savings-history' : 'expenses-history';
        let savedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
        savedHistory.push(message);
        localStorage.setItem(historyKey, JSON.stringify(savedHistory));
    }

    function updateChart() {
        const ctx = document.getElementById('chart').getContext('2d');
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(savings).map(day => `Day ${day}`),
                datasets: [{
                    label: 'Savings',
                    data: Object.values(savings),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: Object.values(expenses).map(day => day ? Object.values(day).reduce((acc, cur) => acc + cur, 0) : 0),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateExpenseChart() {
        const ctx = document.getElementById('expense-chart').getContext('2d');
        if (expenseChart) {
            expenseChart.destroy();
        }
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Food', 'Transportation', 'Academic'],
                datasets: [{
                    label: 'Expenses',
                    data: [
                        Object.values(expenses).reduce((acc, day) => acc + (day && day.food ? day.food : 0), 0),
                        Object.values(expenses).reduce((acc, day) => acc + (day && day.transportation ? day.transportation : 0), 0),
                        Object.values(expenses).reduce((acc, day) => acc + (day && day.academic ? day.academic : 0), 0)
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }

    function toggleHistory(type) {
        const history = document.getElementById(`${type}-history`);
        const historyKey = type === 'savings' ? 'savings-history' : 'expenses-history';
        const savedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
        history.innerHTML = '';

        if (savedHistory.length > 0) {
            savedHistory.forEach(message => {
                const notificationItem = document.createElement('div');
                notificationItem.textContent = message;
                history.appendChild(notificationItem);
            });
        }

        history.style.display = history.style.display === 'block' ? 'none' : 'block';
    }

    function closeHistory() {
        document.getElementById('savings-history').style.display = 'none';
        document.getElementById('expenses-history').style.display = 'none';
    }

    document.getElementById('toggle-savings-history').addEventListener('click', function() {
        toggleHistory('savings');
    });

    document.getElementById('toggle-expenses-history').addEventListener('click', function() {
        toggleHistory('expenses');
    });

    document.getElementById('close-history').addEventListener('click', closeHistory);

    document.getElementById('clear-local-storage').addEventListener('click', clearLocalStorage);

    function clearLocalStorage() {
        localStorage.removeItem('savings');
        localStorage.removeItem('expenses');
        localStorage.removeItem('savings-history');
        localStorage.removeItem('expenses-history');
        savings = {};
        expenses = {};
        totalSavings = 0;
        totalExpenses = 0;
        notificationCount = 0;
        document.getElementById('total-savings').textContent = '0';
        document.getElementById('total-expenses').textContent = '0';
        document.getElementById('savings-history').innerHTML = '';
        document.getElementById('expenses-history').innerHTML = '';
        updateChart();
        updateExpenseChart();
    }
});
