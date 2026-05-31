// Starting Page - Firebase Version

let currentImageIndex = 0;
let currentImages = [];
let countdownInterval = null;
let currentUserId = null;
let currentTask = null;

document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    currentUserId = localStorage.getItem('userId');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    await loadNotice();
    await loadUserStats();
    await loadCurrentTask();
    await loadTaskProgress();
    await checkTaskAvailability();
    
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
});

async function loadNotice() {
    try {
        const snapshot = await database.ref('settings/taskNotice').once('value');
        let notice = snapshot.val();
        if (!notice) {
            notice = 'Online Support Hours: 10:00 - 22:00';
            await database.ref('settings/taskNotice').set(notice);
        }
        const noticeElement = document.getElementById('noticeText');
        if (noticeElement) {
            noticeElement.textContent = notice;
        }
    } catch (error) {
        console.error('Error loading notice:', error);
    }
}

async function loadUserStats() {
    try {
        const snapshot = await database.ref('users/' + currentUserId).once('value');
        const user = snapshot.val();
        
        const balance = parseFloat(user?.balance || 0).toFixed(2);
        const commission = parseFloat(user?.commission || 0).toFixed(2);
        
        const balanceElement = document.getElementById('walletBalance');
        const commissionElement = document.getElementById('commission');
        
        if (balanceElement) {
            balanceElement.innerHTML = balance + ' <span>USDT</span>';
        }
        if (commissionElement) {
            commissionElement.innerHTML = commission + ' <span>USDT</span>';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadCurrentTask() {
    try {
        const snapshot = await database.ref('tasks/current').once('value');
        currentTask = snapshot.val();
        
        if (!currentTask) {
            // Create default task
            const now = new Date();
            const defaultTask = {
                id: 'TSK001',
                taskId: 'TSK001',
                productName: 'Sample Product',
                price: '25.99',
                profit: '0.75',
                image1: '',
                image2: '',
                image3: '',
                taskDateTime: now.toISOString(),
                completed: false
            };
            await database.ref('tasks/current').set(defaultTask);
            currentTask = defaultTask;
        }
        
        displayTask(currentTask);
        loadImages(currentTask);
        
    } catch (error) {
        console.error('Error loading task:', error);
    }
}

function loadImages(task) {
    currentImages = [task.image1, task.image2, task.image3].filter(img => img && img !== '');
    
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
        dot.addEventListener('click', () => {
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
    
    if (task.taskDateTime) {
        const taskDate = new Date(task.taskDateTime);
        document.getElementById('taskTime').textContent = taskDate.toLocaleString();
    }
}

async function loadTaskProgress() {
    try {
        const userSnapshot = await database.ref('users/' + currentUserId).once('value');
        const user = userSnapshot.val();
        
        const completedTasks = user?.completedTasks || 0;
        const totalTasks = user?.totalTasks || 40;
        
        const percentage = (completedTasks / totalTasks) * 100;
        
        document.getElementById('taskCount').textContent = completedTasks + '/' + totalTasks;
        document.getElementById('progressFill').style.width = percentage + '%';
        
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

async function checkTaskAvailability() {
    const startBtn = document.getElementById('startTaskBtn');
    const statusBadge = document.getElementById('statusBadge');
    const timerSection = document.getElementById('timerSection');
    
    if (!currentTask) {
        startBtn.disabled = true;
        statusBadge.textContent = 'No Task';
        return;
    }
    
    const taskTime = new Date(currentTask.taskDateTime);
    const now = new Date();
    
    // Check if task is already completed
    const userSnapshot = await database.ref('users/' + currentUserId).once('value');
    const user = userSnapshot.val();
    
    if (currentTask.completed === true) {
        startBtn.disabled = true;
        statusBadge.textContent = 'Completed';
        statusBadge.className = 'status-badge completed';
        return;
    }
    
    if (now >= taskTime) {
        // Task is available
        startBtn.disabled = false;
        statusBadge.textContent = 'Available';
        statusBadge.className = 'status-badge available';
        timerSection.style.display = 'none';
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        // Add click handler
        const startBtnElement = document.getElementById('startTaskBtn');
        startBtnElement.onclick = completeTask;
        
    } else {
        // Task is locked
        startBtn.disabled = true;
        statusBadge.textContent = 'Locked';
        statusBadge.className = 'status-badge locked';
        timerSection.style.display = 'block';
        startCountdown(taskTime);
    }
}

function startCountdown(targetTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    
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
        if (countdownElement) {
            countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

async function completeTask() {
    try {
        // Get current user data
        const userSnapshot = await database.ref('users/' + currentUserId).once('value');
        const user = userSnapshot.val();
        
        const currentBalance = parseFloat(user.balance || 0);
        const currentCommission = parseFloat(user.commission || 0);
        const completedTasks = user.completedTasks || 0;
        const totalTasks = user.totalTasks || 40;
        const profit = parseFloat(currentTask.profit || 0.10);
        
        // Update user balance and commission
        const newBalance = currentBalance + profit;
        const newCommission = currentCommission + profit;
        const newCompletedTasks = completedTasks + 1;
        
        await database.ref('users/' + currentUserId).update({
            balance: newBalance.toFixed(2),
            commission: newCommission.toFixed(2),
            completedTasks: newCompletedTasks
        });
        
        // Mark task as completed
        await database.ref('tasks/current/completed').set(true);
        
        // Update local storage
        localStorage.setItem('walletBalance', newBalance.toFixed(2));
        localStorage.setItem('commission', newCommission.toFixed(2));
        
        alert('Task completed! +' + profit.toFixed(2) + ' USDT added to your balance.');
        
        // Reload data
        await loadUserStats();
        await loadTaskProgress();
        
        if (newCompletedTasks >= totalTasks) {
            alert('Congratulations! You completed all tasks!');
        }
        
        // Reload task
        await loadCurrentTask();
        await checkTaskAvailability();
        
    } catch (error) {
        console.error('Error completing task:', error);
        alert('Error completing task. Please try again.');
    }
}

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        if (page === 'home') {
            window.location.href = 'dashboard.html';
        } else if (page === 'records') {
            window.location.href = 'records.html';
        }
    });
});