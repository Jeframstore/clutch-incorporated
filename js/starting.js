// Starting Page - Complete with Image Slider and Admin-Only Notice

let currentImageIndex = 0;
let currentImages = [];
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadNotice(); // Notice is READ ONLY for client, only admin can edit via admin panel
    loadUserStats();
    loadCurrentTask();
    loadTaskProgress();
    checkTaskAvailability();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    // Slider buttons
    document.getElementById('prevBtn').addEventListener('click', prevImage);
    document.getElementById('nextBtn').addEventListener('click', nextImage);
});

function loadNotice() {
    // Notice is set by admin only - client cannot edit
    let notice = localStorage.getItem('taskNotice');
    if (!notice) {
        notice = 'Online Support Hours: 10:00 - 22:00';
        localStorage.setItem('taskNotice', notice);
    }
    const noticeElement = document.getElementById('noticeText');
    if (noticeElement) {
        noticeElement.textContent = notice;
        // Make it NOT editable by client
        noticeElement.setAttribute('contenteditable', 'false');
    }
}

function loadUserStats() {
    let balance = localStorage.getItem('walletBalance');
    let commission = localStorage.getItem('commission');
    
    if (!balance) {
        balance = '198.16';
        localStorage.setItem('walletBalance', balance);
    }
    
    if (!commission) {
        commission = '4.62';
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
        const now = new Date();
        const defaultTaskTime = new Date(now.getTime() + 3600000);
        
        currentTask = {
            id: 'TSK001',
            taskId: 'TSK001',
            productName: 'New Product',
            productStyle: 'Style',
            price: '0.00',
            promoCode: 'PROMO',
            rating: '5.0',
            boosts: '0',
            profit: '0.10',
            image1: '',
            image2: '',
            image3: '',
            taskDateTime: defaultTaskTime.toISOString(),
            nextTaskDateTime: '',
            status: 'pending',
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
        currentImages = ['https://placehold.co/400x300/1a1a2e/ffd700?text=No+Image'];
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
    document.getElementById('productStyle').textContent = task.productStyle;
    document.getElementById('promoCode').textContent = task.promoCode;
    document.getElementById('productPrice').textContent = '$' + task.price;
    document.getElementById('taskRating').innerHTML = task.rating + ' ★ (' + task.boosts + ' boosts)';
    document.getElementById('taskProfit').textContent = '+' + task.profit + ' USDT';
    
    if (task.taskDateTime) {
        const taskDate = new Date(task.taskDateTime);
        const formattedTime = taskDate.toLocaleString();
        document.getElementById('taskTime').textContent = formattedTime;
    }
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

function checkTaskAvailability() {
    let currentTask = JSON.parse(localStorage.getItem('currentTask') || '{}');
    const startBtn = document.getElementById('startTaskBtn');
    const statusBadge = document.getElementById('statusBadge');
    const timerSection = document.getElementById('timerSection');
    
    if (!currentTask.taskDateTime) {
        startBtn.disabled = false;
        statusBadge.textContent = 'Available';
        statusBadge.className = 'status-badge available';
        timerSection.style.display = 'none';
        return;
    }
    
    const taskTime = new Date(currentTask.taskDateTime);
    const now = new Date();
    
    if (currentTask.completed === true) {
        startBtn.disabled = true;
        statusBadge.textContent = 'Completed';
        statusBadge.className = 'status-badge completed';
        checkNextTaskTime();
        return;
    }
    
    if (now > taskTime && !currentTask.completed) {
        startBtn.disabled = true;
        statusBadge.textContent = 'Expired';
        statusBadge.className = 'status-badge expired';
        timerSection.style.display = 'none';
        return;
    }
    
    if (now < taskTime) {
        startBtn.disabled = true;
        statusBadge.textContent = 'Locked';
        statusBadge.className = 'status-badge locked';
        timerSection.style.display = 'block';
        startCountdown(taskTime);
        return;
    }
    
    startBtn.disabled = false;
    statusBadge.textContent = 'Available';
    statusBadge.className = 'status-badge available';
    timerSection.style.display = 'none';
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
}

function startCountdown(targetTime) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    function updateCountdown() {
        const now = new Date();
        const diff = targetTime - now;
        
        if (diff <= 0) {
            clearInterval(countdownInterval);
            checkTaskAvailability();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const countdownElement = document.getElementById('countdown');
        const nextTaskTimeElement = document.getElementById('nextTaskTime');
        
        if (countdownElement) {
            countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (nextTaskTimeElement) {
            nextTaskTimeElement.textContent = `Available at: ${targetTime.toLocaleString()}`;
        }
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function checkNextTaskTime() {
    let currentTask = JSON.parse(localStorage.getItem('currentTask') || '{}');
    const timerSection = document.getElementById('timerSection');
    
    if (currentTask.nextTaskDateTime) {
        const nextTaskTime = new Date(currentTask.nextTaskDateTime);
        const now = new Date();
        
        if (now < nextTaskTime) {
            timerSection.style.display = 'block';
            startCountdown(nextTaskTime);
            
            const nextTaskTimeElement = document.getElementById('nextTaskTime');
            if (nextTaskTimeElement) {
                nextTaskTimeElement.textContent = `Next task at: ${nextTaskTime.toLocaleString()}`;
            }
        }
    }
}

const startBtn = document.getElementById('startTaskBtn');
if (startBtn) {
    startBtn.addEventListener('click', function() {
        let currentTask = JSON.parse(localStorage.getItem('currentTask') || '{}');
        let completedTasks = parseInt(localStorage.getItem('completedTasks') || 0);
        let totalTasks = parseInt(localStorage.getItem('totalTasksPerRound') || 40);
        let balance = parseFloat(localStorage.getItem('walletBalance') || 198.16);
        let commission = parseFloat(localStorage.getItem('commission') || 4.62);
        
        const now = new Date();
        const taskTime = new Date(currentTask.taskDateTime);
        
        if (now < taskTime) {
            alert('This task is not available yet. Please wait for the scheduled time.');
            return;
        }
        
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
        } else if (currentTask.nextTaskDateTime) {
            const nextTime = new Date(currentTask.nextTaskDateTime);
            alert('Next task available at: ' + nextTime.toLocaleString());
        }
        
        checkTaskAvailability();
    });
}

document.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const page = button.getAttribute('data-page');
        
        if (page === 'home') {
            window.location.href = 'dashboard.html';
        } else if (page === 'starting') {
            // Already on starting page
        } else if (page === 'records') {
            window.location.href = 'records.html';
        }
    });
});