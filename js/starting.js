// Starting Page - Simplified Working Version

let currentImageIndex = 0;
let currentImages = [];
let currentTask = null;
let isProcessingTask = false;

document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserStats();
    await loadCurrentTask();
    loadTaskProgress();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    
    const startBtn = document.getElementById('startTaskBtn');
    if (startBtn) {
        startBtn.addEventListener('click', completeTask);
    }
});

function loadUserStats() {
    let balance = localStorage.getItem('walletBalance');
    let commission = localStorage.getItem('commission');
    
    if (!balance) {
        balance = '0.00';
        localStorage.setItem('walletBalance', balance);
    }
    
    if (!commission) {
        commission = '0.00';
        localStorage.setItem('commission', commission);
    }
    
    const balanceElement = document.getElementById('walletBalance');
    const commissionElement = document.getElementById('commission');
    
    if (balanceElement) {
        balanceElement.innerHTML = parseFloat(balance).toFixed(2) + ' <span>USDT</span>';
    }
    if (commissionElement) {
        commissionElement.innerHTML = parseFloat(commission).toFixed(2) + ' <span>USDT</span>';
    }
}

async function loadCurrentTask() {
    currentTask = JSON.parse(localStorage.getItem('currentTask') || 'null');
    const completedTaskIds = JSON.parse(localStorage.getItem('completedTaskIds') || '[]');

    if (!currentTask || currentTask.completed === true) {
        try {
            const tasksSnap = await database.ref('tasks').once('value');
            const tasks = tasksSnap.val() || {};
            const now = new Date();
            currentTask = null;

            for (let taskKey in tasks) {
                const task = tasks[taskKey];
                if (!task) continue;
                if (completedTaskIds.includes(taskKey)) continue;
                if (task.availableFrom) {
                    const availableFrom = new Date(task.availableFrom);
                    if (availableFrom > now) continue;
                }

                currentTask = {
                    firebaseKey: taskKey,
                    taskId: task.taskId || taskKey,
                    productName: task.productName || 'Sample Product',
                    price: task.price || '0.00',
                    profit: task.profit || task.commission || '0.10',
                    image1: task.image1 || '',
                    image2: task.image2 || '',
                    image3: task.image3 || '',
                    completed: false
                };
                localStorage.setItem('currentTask', JSON.stringify(currentTask));
                break;
            }
        } catch (e) {
            console.error('Error loading task from Firebase:', e);
        }
    }

    displayTask(currentTask);
    loadImages(currentTask || {});
    updateStartButtonState(currentTask);
}

function loadImages(task) {
    currentImages = [task.image1, task.image2, task.image3].filter(function(img) {
        return img && img !== '';
    });
    
    if (currentImages.length === 0) {
        currentImages = ['https://placehold.co/400x300/1a1a2e/ffd700?text=Task+Image'];
    }
    
    currentImageIndex = 0;
    updateSliderImage();
    updateDots();
}

function updateSliderImage() {
    const sliderImage = document.getElementById('sliderImage');
    if (sliderImage && currentImages.length > 0) {
        sliderImage.src = currentImages[currentImageIndex];
    }
}

function updateDots() {
    const dotsContainer = document.getElementById('sliderDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    for (let i = 0; i < currentImages.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === currentImageIndex ? ' active' : '');
        dot.addEventListener('click', function() {
            currentImageIndex = i;
            updateSliderImage();
            updateDots();
        });
        dotsContainer.appendChild(dot);
    }
}

function prevImage() {
    if (currentImages.length === 0) return;
    currentImageIndex--;
    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    }
    updateSliderImage();
    updateDots();
}

function nextImage() {
    if (currentImages.length === 0) return;
    currentImageIndex++;
    if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }
    updateSliderImage();
    updateDots();
}

function displayTask(task) {
    const taskIdEl = document.getElementById('taskId');
    const productNameEl = document.getElementById('productName');
    const productPriceEl = document.getElementById('productPrice');
    const taskProfitEl = document.getElementById('taskProfit');
    const statusBadge = document.getElementById('statusBadge');

    if (!task) {
        if (taskIdEl) taskIdEl.textContent = 'N/A';
        if (productNameEl) productNameEl.textContent = 'No Tasks Available';
        if (productPriceEl) productPriceEl.textContent = '$0.00';
        if (taskProfitEl) taskProfitEl.textContent = '+0.00 USDT';
        if (statusBadge) statusBadge.textContent = 'No Task';
        return;
    }

    if (taskIdEl) taskIdEl.textContent = task.taskId;
    if (productNameEl) productNameEl.textContent = task.productName;
    if (productPriceEl) productPriceEl.textContent = '$' + parseFloat(task.price || 0).toFixed(2);
    const profitValue = parseFloat(task.profit || task.commission || 0.10);
    if (taskProfitEl) taskProfitEl.textContent = '+' + profitValue.toFixed(2) + ' USDT';
    if (statusBadge) statusBadge.textContent = task.completed === true ? 'Completed' : 'Available';
}

function updateStartButtonState(task) {
    const startBtn = document.getElementById('startTaskBtn');
    if (!startBtn) return;

    if (isProcessingTask) {
        startBtn.textContent = 'Processing...';
        startBtn.disabled = true;
        return;
    }

    if (!task) {
        startBtn.textContent = 'No Task Available';
        startBtn.disabled = true;
        return;
    }

    if (task.completed === true) {
        startBtn.textContent = 'Task Completed';
        startBtn.disabled = true;
        return;
    }

    startBtn.textContent = 'Start Optimization';
    startBtn.disabled = false;
}

function saveTransactionRecord(task, profit) {
    const records = JSON.parse(localStorage.getItem('transactionRecords') || '[]');
    records.push({
        id: 'TR' + Date.now(),
        type: 'optimization',
        taskId: task.taskId || 'Unknown',
        amount: parseFloat(profit).toFixed(2),
        status: 'completed',
        date: new Date().toISOString(),
        remark: 'Task profit added to commission'
    });
    localStorage.setItem('transactionRecords', JSON.stringify(records));
}

function loadTaskProgress() {
    let completedTasks = localStorage.getItem('completedTasks');
    let totalTasks = localStorage.getItem('totalTasksPerRound');
    
    if (!completedTasks) {
        completedTasks = 0;
        localStorage.setItem('completedTasks', completedTasks);
    }
    
    if (!totalTasks) {
        totalTasks = 40;
        localStorage.setItem('totalTasksPerRound', totalTasks);
    }
    
    completedTasks = parseInt(completedTasks);
    totalTasks = parseInt(totalTasks);
    
    const percentage = (completedTasks / totalTasks) * 100;
    
    document.getElementById('taskCount').textContent = completedTasks + '/' + totalTasks;
    document.getElementById('progressFill').style.width = percentage + '%';
}

async function completeTask() {
    if (isProcessingTask) return;

    currentTask = JSON.parse(localStorage.getItem('currentTask') || 'null');
    if (!currentTask) {
        alert('No task is currently available.');
        return;
    }

    if (currentTask.completed === true) {
        alert('This task has already been completed.');
        return;
    }

    isProcessingTask = true;
    updateStartButtonState(currentTask);

    try {
        let completedTasks = parseInt(localStorage.getItem('completedTasks') || 0);
        let totalTasks = parseInt(localStorage.getItem('totalTasksPerRound') || 40);
        let balance = parseFloat(localStorage.getItem('walletBalance') || 0);
        let commission = parseFloat(localStorage.getItem('commission') || 0);
        
        const profit = parseFloat(currentTask.profit || currentTask.commission || 0.10);
        const newBalance = balance + profit;
        const newCommission = commission + profit;
        
        localStorage.setItem('walletBalance', newBalance.toFixed(2));
        localStorage.setItem('commission', newCommission.toFixed(2));
        
        currentTask.completed = true;
        localStorage.setItem('currentTask', JSON.stringify(currentTask));

        const completedTaskIds = JSON.parse(localStorage.getItem('completedTaskIds') || '[]');
        if (currentTask.firebaseKey && !completedTaskIds.includes(currentTask.firebaseKey)) {
            completedTaskIds.push(currentTask.firebaseKey);
            localStorage.setItem('completedTaskIds', JSON.stringify(completedTaskIds));
        }
        
        completedTasks++;
        localStorage.setItem('completedTasks', completedTasks);
        
        saveTransactionRecord(currentTask, profit);
        loadUserStats();
        loadTaskProgress();
        updateStartButtonState(currentTask);
        
        alert('Task completed! +' + profit.toFixed(2) + ' USDT added to your balance.');
        
        if (completedTasks >= totalTasks) {
            alert('Congratulations! You completed all ' + totalTasks + ' tasks! Round complete!');
        }
        
        await loadCurrentTask();
    } finally {
        isProcessingTask = false;
        updateStartButtonState(currentTask);
    }
}

document.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const page = button.getAttribute('data-page');
        
        if (page === 'home') {
            window.location.href = 'dashboard.html';
        } else if (page === 'records') {
            window.location.href = 'records.html';
        }
    });
});