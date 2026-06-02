// Starting Page - Simplified Working Version

let currentImageIndex = 0;
let currentImages = [];
let currentTask = null;
let isProcessingTask = false;
let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    userId = sessionStorage.getItem('userId');
    await loadUserStats();
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

async function loadUserStats() {
    try {
        if (!userId) return;
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        if (!user) return;

        const balance = user.balance || '0.00';
        const commission = user.commission || '0.00';
        
        const balanceElement = document.getElementById('walletBalance');
        const commissionElement = document.getElementById('commission');
        
        if (balanceElement) {
            balanceElement.innerHTML = parseFloat(balance).toFixed(2) + ' <span>USDT</span>';
        }
        if (commissionElement) {
            commissionElement.innerHTML = parseFloat(commission).toFixed(2) + ' <span>USDT</span>';
        }
    } catch(e) {
        console.error('Error loading user stats:', e);
    }
}

async function loadCurrentTask() {
    try {
        const userSnap = await database.ref('users/' + userId).once('value');
        const user = userSnap.val() || {};
        const completedTaskIds = user.completedTaskIds || [];
        const currentTaskData = user.currentTask || null;
        
        if (currentTaskData && !currentTaskData.completed) {
            currentTask = currentTaskData;
        } else {
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
                await database.ref('users/' + userId).update({ currentTask: currentTask });
                break;
            }
        }
    } catch (e) {
        console.error('Error loading task from Firebase:', e);
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
    const taskTimeEl = document.getElementById('taskTime');
    const statusBadge = document.getElementById('statusBadge');

    if (!task) {
        if (taskIdEl) taskIdEl.textContent = 'N/A';
        if (productNameEl) productNameEl.textContent = 'No Tasks Available';
        if (productPriceEl) productPriceEl.textContent = '$0.00';
        if (taskProfitEl) taskProfitEl.textContent = '+0.00 USDT';
        if (taskTimeEl) taskTimeEl.textContent = '--:-- --';
        if (statusBadge) statusBadge.textContent = 'No Task';
        return;
    }

    if (taskIdEl) taskIdEl.textContent = task.taskId;
    if (productNameEl) productNameEl.textContent = task.productName;
    if (productPriceEl) productPriceEl.textContent = '$' + parseFloat(task.price || 0).toFixed(2);
    const profitValue = parseFloat(task.profit || task.commission || 0.10);
    if (taskProfitEl) taskProfitEl.textContent = '+' + profitValue.toFixed(2) + ' USDT';
    
    // Display available time if set
    if (taskTimeEl) {
        if (task.availableFrom) {
            const availableDate = new Date(task.availableFrom);
            const hours = availableDate.getHours().toString().padStart(2, '0');
            const minutes = availableDate.getMinutes().toString().padStart(2, '0');
            const ampm = availableDate.getHours() >= 12 ? 'PM' : 'AM';
            taskTimeEl.textContent = `${hours}:${minutes} ${ampm}`;
        } else {
            taskTimeEl.textContent = 'Available Now';
        }
    }
    
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

async function saveTransactionRecord(task, profit) {
    const record = {
        id: 'TR' + Date.now(),
        type: 'optimization',
        taskId: task.taskId || 'Unknown',
        amount: parseFloat(profit).toFixed(2),
        status: 'completed',
        date: new Date().toISOString(),
        remark: 'Task profit added to commission'
    };
    await database.ref('users/' + userId + '/transactions/' + record.id).set(record);
}

async function loadTaskProgress() {
    try {
        const userSnap = await database.ref('users/' + userId).once('value');
        const user = userSnap.val() || {};
        let completedTasks = user.completedTasks || 0;
        let totalTasks = user.totalTasksPerRound || 40;
        
        const percentage = (completedTasks / totalTasks) * 100;
        
        document.getElementById('taskCount').textContent = completedTasks + '/' + totalTasks;
        document.getElementById('progressFill').style.width = percentage + '%';
    } catch (e) {
        console.error('Error loading task progress:', e);
    }
}

async function completeTask() {
    if (isProcessingTask) return;

    try {
        const userSnap = await database.ref('users/' + userId).once('value');
        const user = userSnap.val() || {};
        const currentTaskData = user.currentTask || null;
        
        if (!currentTaskData) {
            alert('No task is currently available.');
            return;
        }

        if (currentTaskData.completed === true) {
            alert('This task has already been completed.');
            return;
        }

        isProcessingTask = true;
        currentTask = currentTaskData;
        updateStartButtonState(currentTask);

        let completedTasks = user.completedTasks || 0;
        let totalTasks = user.totalTasksPerRound || 40;
        const completedTaskIds = user.completedTaskIds || [];
        
        let balance = parseFloat(user.balance || 0);
        let commission = parseFloat(user.commission || 0);
        
        const profit = parseFloat(currentTask.profit || currentTask.commission || 0.10);
        const newBalance = balance + profit;
        const newCommission = commission + profit;
        
        currentTask.completed = true;
        
        if (currentTask.firebaseKey && !completedTaskIds.includes(currentTask.firebaseKey)) {
            completedTaskIds.push(currentTask.firebaseKey);
        }
        
        completedTasks++;
        
        await database.ref('users/' + userId).update({
            balance: newBalance.toFixed(2),
            commission: newCommission.toFixed(2),
            currentTask: currentTask,
            completedTaskIds: completedTaskIds,
            completedTasks: completedTasks
        });
        
        await saveTransactionRecord(currentTask, profit);
        await loadUserStats();
        await loadTaskProgress();
        updateStartButtonState(currentTask);
        
        alert('Task completed! +' + profit.toFixed(2) + ' USDT added to your balance.');
        
        if (completedTasks >= totalTasks) {
            alert('Congratulations! You completed all ' + totalTasks + ' tasks! Round complete!');
        }
        
        await loadCurrentTask();
    } catch (e) {
        console.error('Error completing task:', e);
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