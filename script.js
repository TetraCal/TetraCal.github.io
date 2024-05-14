
let savings = {};
let expenses = {};
let totalSavings = 0;
let totalExpenses = 0;
let chart;
let expenseChart;
let notificationCount = 0;

// Load data from local storage on page load
window.onload = function () {
    loadFromLocalStorage();
    updateChart();
    updateExpenseChart();
};

// Function to load data from local storage
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

    // Update total savings and expenses in UI
    document.getElementById('total-savings').textContent = totalSavings.toFixed(2);
    document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
}

// Function to save data to local storage
function saveToLocalStorage() {
    localStorage.setItem('savings', JSON.stringify(savings));
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Function to show savings menu
function showSavings() {
    document.getElementById('savings-menu').style.display = 'block';
    document.getElementById('expenses-menu').style.display = 'none';
    document.getElementById('chart-container').style.display = 'block';
    document.getElementById('expense-chart-container').style.display = 'none';
}

// Function to show expenses menu
function showExpenses() {
    document.getElementById('savings-menu').style.display = 'none';
    document.getElementById('expenses-menu').style.display = 'block';
    document.getElementById('chart-container').style.display = 'block';
    document.getElementById('expense-chart-container').style.display = 'block';
}

// Function to add savings
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

// Function to add expenses
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

// Function to show notification
function showNotification(message, type) {
    notificationCount++;
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification');
    notification.classList.add(type);
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.remove();
        notificationCount--;
    }, 3000);

    // Add the notification to history
    const history = type === 'savings-notification' ? document.getElementById('savings-history') : document.getElementById('expenses-history');
    const notificationItem = document.createElement('div');
    notificationItem.textContent = message;
    history.appendChild(notificationItem);

    // Save history to local storage
    const historyKey = type === 'savings-notification' ? 'savings-history' : 'expenses-history';
    let savedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    savedHistory.push(message);
    localStorage.setItem(historyKey, JSON.stringify(savedHistory));
}

// Function to update chart
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

// Function to update expense chart
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

// Function to toggle history
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

// Function to close history
function closeHistory() {
    document.getElementById('savings-history').style.display = 'none';
    document.getElementById('expenses-history').style.display = 'none';
}

// Function to clear all data from local storage
function clearLocalStorage() {
    localStorage.removeItem('savings');
    localStorage.removeItem('expenses');
    localStorage.removeItem('savings-history');
    localStorage.removeItem('expenses-history');
    // Clear variables
    savings = {};
    expenses = {};
    totalSavings = 0;
    totalExpenses = 0;
    notificationCount = 0;
    // Update UI
    document.getElementById('total-savings').textContent = '0';
    document.getElementById('total-expenses').textContent = '0';
    document.getElementById('savings-history').innerHTML = '';
    document.getElementById('expenses-history').innerHTML = '';
    updateChart();
    updateExpenseChart();
}
