// Starting Page - Simplified Working Version

let currentImageIndex = 0;
let currentImages = [];

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserStats();
    loadCurrentTask();
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

function loadCurrentTask() {
    let currentTask = localStorage.getItem('currentTask');
    
    if (!currentTask) {
        currentTask = {
            id: 'TSK001',
            taskId: 'TSK001',
            productName: 'Sample Product',
            price: '25.99',
            profit: '0.75',
            image1: '',
            image2: '',
            image3: '',
            completed: false
        };
        localStorage.setItem('currentTask', JSON.stringify(currentTask));
    } else {
        currentTask = JSON.parse(currentTask);
    }
    
    displayTask(currentTask);
    loadImages(currentTask);
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
    document.getElementById('taskId').textContent = task.taskId;
    document.getElementById('productName').textContent = task.productName;
    document.getElementById('productPrice').textContent = '$' + task.price;
    document.getElementById('taskProfit').textContent = '+' + task.profit + ' USDT';
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

function completeTask() {
    let currentTask = JSON.parse(localStorage.getItem('currentTask') || '{}');
    let completedTasks = parseInt(localStorage.getItem('completedTasks') || 0);
    let totalTasks = parseInt(localStorage.getItem('totalTasksPerRound') || 40);
    let balance = parseFloat(localStorage.getItem('walletBalance') || 0);
    let commission = parseFloat(localStorage.getItem('commission') || 0);
    
    if (currentTask.completed === true) {
        alert('This task has already been completed.');
        return;
    }
    
    const profit = parseFloat(currentTask.profit || 0.10);
    const newBalance = balance + profit;
    const newCommission = commission + profit;
    
    localStorage.setItem('walletBalance', newBalance.toFixed(2));
    localStorage.setItem('commission', newCommission.toFixed(2));
    
    currentTask.completed = true;
    localStorage.setItem('currentTask', JSON.stringify(currentTask));
    
    completedTasks++;
    localStorage.setItem('completedTasks', completedTasks);
    
    loadUserStats();
    loadTaskProgress();
    
    alert('Task completed! +' + profit.toFixed(2) + ' USDT added to your balance.');
    
    if (completedTasks >= totalTasks) {
        alert('Congratulations! You completed all ' + totalTasks + ' tasks! Round complete!');
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