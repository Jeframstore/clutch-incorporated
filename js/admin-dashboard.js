// Admin Dashboard\nimport { database } from './firebase-config.js'; - Complete with Base Salary Management

let adminType = '';
let adminId = '';
let adminName = '';
let currentPage = 'dashboard';

document.addEventListener('DOMContentLoaded', async function() {
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn');
    adminType = sessionStorage.getItem('adminType') || 'sub';
    adminId = sessionStorage.getItem('adminId') || '';
    adminName = sessionStorage.getItem('adminUsername') || '';
    
    if (!isAdmin || isAdmin !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    loadSidebar();
    loadDashboard();
    watchWithdrawals();
    watchOpenTrades();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    const logoutMobile = document.getElementById('logoutMobileBtn');
    if (logoutMobile) logoutMobile.addEventListener('click', logout);
});

function logout() {
    sessionStorage.clear();
    window.location.href = 'admin-login.html';
}

function loadSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    const adminBadge = document.getElementById('adminTypeBadge');
    
    if (adminBadge) {
        adminBadge.textContent = adminType === 'master' ? '👑 MASTER' : '📋 SUB ADMIN';
    }
    
    let menuHtml = `
        <button class="nav-item active" data-page="dashboard">📊 Dashboard</button>
        <button class="nav-item" data-page="users">👥 User Management</button>
        <button class="nav-item" data-page="tasks">📋 Task Management</button>
        <button class="nav-item" data-page="withdrawals">💰 Withdrawal Requests <span id="withdrawalCountBadge" class="sidebar-badge"></span></button>
        <button class="nav-item" data-page="deposits">💳 Deposit Records</button>
        <button class="nav-item" data-page="opentrades">📈 Open Trades <span id="openTradesBadge" class="sidebar-badge"></span></button>
        <button class="nav-item" data-page="content">📝 Content Management</button>
        <button class="nav-item" data-page="email">📧 Email Management</button>
        <button class="nav-item" data-page="vip">⭐ VIP Settings</button>
        <button class="nav-item" data-page="service">📞 Service Settings</button>
        <button class="nav-item" data-page="wallet">🏦 Wallet Settings</button>
        <button class="nav-item" data-page="invitecodes">🔑 Invitation Codes</button>
    `;
    
    if (adminType === 'master') {
        menuHtml += `<button class="nav-item" data-page="admins">👑 Admin Management</button>`;
    }
    
    if (sidebarNav) sidebarNav.innerHTML = menuHtml;
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            currentPage = page;
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) pageTitle.textContent = this.textContent.trim();
            
            if (page === 'dashboard') loadDashboard();
            else if (page === 'users') loadUserManagement();
            else if (page === 'tasks') loadTaskManagement();
            else if (page === 'withdrawals') loadWithdrawalRequests();
            else if (page === 'deposits') loadDepositRecords();
            else if (page === 'opentrades') loadOpenTrades();
            else if (page === 'content') loadContentManagement();
            else if (page === 'email') loadEmailManagement();
            else if (page === 'vip') loadVIPSettings();
            else if (page === 'service') loadServiceSettings();
            else if (page === 'wallet') loadWalletSettings();
            else if (page === 'invitecodes') loadInvitationCodes();
            else if (page === 'admins' && adminType === 'master') loadAdminManagement();
        });
    });
}

async function loadDashboard() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = `<div class="stats-grid">
        <div class="stat-card"><h3>Total Users</h3><div class="stat-value" id="totalUsers">0</div></div>
        <div class="stat-card"><h3>Total Balance</h3><div class="stat-value" id="totalBalance">0 USDT</div></div>
        <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value" id="pendingWithdrawals">0</div></div>
        <div class="stat-card"><h3>Total Tasks</h3><div class="stat-value" id="totalTasks">0</div></div>
    </div>
    <div style="text-align:center; padding:40px; color:#888;"><p>Welcome to Admin Panel</p><p>Admin Type: ${adminType === 'master' ? 'Master Admin' : 'Sub Admin'}</p></div>`;
    
    await loadDashboardStats();
}

function watchWithdrawals() {
    const withdrawalsRef = database.ref('withdrawals');
    withdrawalsRef.on('value', snapshot => {
        const withdrawals = snapshot.val() || {};
        let pending = 0;
        for (let id in withdrawals) {
            if (withdrawals[id].status === 'pending') pending++;
        }

        const pendingEl = document.getElementById('pendingWithdrawals');
        if (pendingEl) pendingEl.textContent = pending;
        updateWithdrawalBadge(pending);

        if (currentPage === 'withdrawals') {
            loadWithdrawalRequests();
        }
    });
}

function updateWithdrawalBadge(pending) {
    const badge = document.getElementById('withdrawalCountBadge');
    if (!badge) return;
    badge.textContent = pending > 0 ? pending : '';
    badge.style.display = pending > 0 ? 'inline-block' : 'none';
}

function watchOpenTrades() {
    const openTradesRef = database.ref('tradingOrders');
    openTradesRef.on('value', snapshot => {
        const openTrades = snapshot.val() || {};
        let pending = 0;
        const now = Date.now();
        
        for (let id in openTrades) {
            const trade = openTrades[id];
            const endTime = new Date(trade.endTime).getTime();
            
            // Check if order has expired and is still open
            if (trade.status === 'open' && endTime <= now) {
                // Auto-update status to ready_for_admin
                database.ref('tradingOrders/' + id).update({ status: 'ready_for_admin' });
            }
            
            // Count open orders and ready_for_admin orders for badge
            if (trade.status === 'open' || trade.status === 'ready_for_admin') pending++;
        }

        const badge = document.getElementById('openTradesBadge');
        if (badge) {
            badge.textContent = pending > 0 ? pending : '';
            badge.style.display = pending > 0 ? 'inline-block' : 'none';
        }

        if (currentPage === 'opentrades') {
            loadOpenTrades();
        }
    });
}

async function loadDashboardStats() {
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        let totalBalance = 0;
        let userCount = 0;
        for (let id in users) {
            userCount++;
            totalBalance += parseFloat(users[id].balance || 0);
        }
        
        const totalUsersEl = document.getElementById('totalUsers');
        const totalBalanceEl = document.getElementById('totalBalance');
        if (totalUsersEl) totalUsersEl.textContent = userCount;
        if (totalBalanceEl) totalBalanceEl.textContent = totalBalance.toFixed(2) + ' USDT';
        
        const withdrawalsSnap = await database.ref('withdrawals').once('value');
        const withdrawals = withdrawalsSnap.val() || {};
        let pending = 0;
        for (let id in withdrawals) if (withdrawals[id].status === 'pending') pending++;
        
        const pendingEl = document.getElementById('pendingWithdrawals');
        if (pendingEl) pendingEl.textContent = pending;
        updateWithdrawalBadge(pending);
        
        const tasksSnap = await database.ref('tasks').once('value');
        const tasks = tasksSnap.val() || {};
        const tasksEl = document.getElementById('totalTasks');
        if (tasksEl) tasksEl.textContent = Object.keys(tasks).length;
        
    } catch(e) { console.error(e); }
}

async function loadUserManagement() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="refreshUsersBtn">🔄 Refresh Users</button></div>
        <div class="table-container"><table class="data-table"><thead>
            <tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Frozen</th><th>Available</th><th>Invite Code</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody id="usersTableBody"><tr><td colspan="9">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    const refreshBtn = document.getElementById('refreshUsersBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => loadUsersTable());
    await loadUsersTable();
}

async function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        let html = '';
        
        // Get admin's invitation codes if sub admin
        let adminCodes = [];
        if (adminType === 'sub') {
            const codesSnap = await database.ref('invitationCodes').once('value');
            const codes = codesSnap.val() || {};
            for (let id in codes) {
                if (codes[id].adminId === adminId) {
                    adminCodes.push(codes[id].code);
                }
            }
        }
        
        for (let id in users) {
            const user = users[id];
            
            // Sub admins only see users who registered with their codes
            if (adminType === 'sub' && !adminCodes.includes(user.inviteCode)) continue;
            
            const balance = parseFloat(user.balance || 0).toFixed(2);
            const frozen = parseFloat(user.frozenAmount || 0).toFixed(2);
            const available = (parseFloat(balance) - parseFloat(frozen)).toFixed(2);
            
            html += `<tr>
                <td>${id.substring(0, 15)}...<\/td>
                <td><strong>${user.username || 'Unknown'}<\/strong><\/td>
                <td>${user.email || 'N/A'}<\/td>
                <td style="color:#ffd700;">${balance} USDT<\/td>
                <td style="color:#ff6666;">${frozen} USDT<\/td>
                <td style="color:#00ff00;">${available} USDT<\/td>
                <td style="color:#ffd700;">${user.inviteCode || 'N/A'}<\/td>
                <td>${user.status || 'active'}<\/td>
                <td>
                    <button class="edit-btn" onclick="viewUserDetails('${id}')">👁️ View<\/button>
                    <button class="edit-btn" onclick="addFunds('${id}')">➕ Add<\/button>
                    <button class="delete-btn" onclick="subtractFunds('${id}')">➖ Sub<\/button>
                    <button class="edit-btn" onclick="freezeAmount('${id}')">❄️ Freeze<\/button>
                    <button class="save-btn" onclick="unfreezeAmount('${id}')">🔥 Unfreeze<\/button>
                    <button class="edit-btn" onclick="assignCustomerService('${id}')">📞 Assign CS<\/button>
                    <button class="edit-btn" onclick="viewBaseSalary('${id}')">💰 Base Salary<\/button>
                <\/td>
            <\/tr>`;
        }
        
        tbody.innerHTML = html || '<td><td colspan="9">No users found<\/td><\/tr>';
        
        const totalUsersEl = document.getElementById('totalUsers');
        if (totalUsersEl) totalUsersEl.textContent = Object.keys(users).length;
        
    } catch(e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="9">Error loading users<\/td><\/tr>';
    }
}

window.viewUserDetails = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    const available = (parseFloat(user.balance || 0) - parseFloat(user.frozenAmount || 0)).toFixed(2);
    
    Swal.fire({
        title: `User Details: ${user.username}`,
        html: `<div style="text-align:left;">
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email || 'Not set'}</p>
            <p><strong>Phone:</strong> ${user.phone || 'Not set'}</p>
            <p><strong>Wallet:</strong> ${user.walletAddress || 'Not bound'}</p>
            <p><strong>Invite Code:</strong> ${user.inviteCode || 'N/A'}</p>
            <p><strong>Balance:</strong> ${user.balance || '0'} USDT</p>
            <p><strong>Frozen:</strong> ${user.frozenAmount || '0'} USDT</p>
            <p><strong>Available:</strong> ${available} USDT</p>
            <p><strong>Commission:</strong> ${user.commission || '0'} USDT</p>
            <p><strong>Status:</strong> ${user.status || 'active'}</p>
        </div>`,
        icon: 'info',
        confirmButtonColor: '#ffd700'
    });
};

window.addFunds = async function(userId) {
    const { value: amount } = await Swal.fire({
        title: 'Add Funds', input: 'number', inputLabel: 'Amount in USDT', inputPlaceholder: '0.00',
        showCancelButton: true, confirmButtonColor: '#ffd700'
    });
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        const snap = await database.ref('users/' + userId).once('value');
        const user = snap.val();
        const newBalance = (parseFloat(user.balance || 0) + parseFloat(amount)).toFixed(2);
        await database.ref('users/' + userId).update({ balance: newBalance });
        Swal.fire('Success', `Added ${amount} USDT. New balance: ${newBalance}`, 'success');
        loadUsersTable();
        loadDashboardStats();
    }
};

window.subtractFunds = async function(userId) {
    const { value: amount } = await Swal.fire({
        title: 'Subtract Funds', input: 'number', inputLabel: 'Amount to subtract', inputPlaceholder: '0.00',
        showCancelButton: true, confirmButtonColor: '#ffd700'
    });
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        const snap = await database.ref('users/' + userId).once('value');
        const user = snap.val();
        const currentBalance = parseFloat(user.balance || 0);
        if (parseFloat(amount) > currentBalance) {
            Swal.fire('Error', 'Cannot subtract more than current balance', 'error');
            return;
        }
        const newBalance = (currentBalance - parseFloat(amount)).toFixed(2);
        await database.ref('users/' + userId).update({ balance: newBalance });
        Swal.fire('Success', `Subtracted ${amount} USDT. New balance: ${newBalance}`, 'success');
        loadUsersTable();
        loadDashboardStats();
    }
};

window.freezeAmount = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    const currentFrozen = parseFloat(user.frozenAmount || 0);
    const currentBalance = parseFloat(user.balance || 0);
    const available = currentBalance - currentFrozen;
    
    const { value: amount } = await Swal.fire({
        title: 'Freeze Amount', input: 'number', 
        inputLabel: `Available to freeze: ${available.toFixed(2)} USDT`, inputPlaceholder: '0.00',
        showCancelButton: true, confirmButtonColor: '#ffd700'
    });
    
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        if (parseFloat(amount) > available) {
            Swal.fire('Error', `Cannot freeze more than available. Available: ${available.toFixed(2)}`, 'error');
            return;
        }
        const newFrozen = (currentFrozen + parseFloat(amount)).toFixed(2);
        await database.ref('users/' + userId).update({ frozenAmount: newFrozen });
        Swal.fire('Success', `Frozen ${amount} USDT. Total frozen: ${newFrozen}`, 'success');
        loadUsersTable();
    }
};

window.unfreezeAmount = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    const currentFrozen = parseFloat(user.frozenAmount || 0);
    
    const { value: amount } = await Swal.fire({
        title: 'Unfreeze Amount', input: 'number',
        inputLabel: `Currently frozen: ${currentFrozen.toFixed(2)} USDT (0 = all)`, inputPlaceholder: '0',
        showCancelButton: true, confirmButtonColor: '#ffd700'
    });
    
    if (amount !== null) {
        let newFrozen = 0;
        if (parseFloat(amount) === 0 || parseFloat(amount) >= currentFrozen) {
            newFrozen = 0;
            Swal.fire('Success', `All frozen funds (${currentFrozen.toFixed(2)} USDT) unfrozen`, 'success');
        } else if (parseFloat(amount) > 0) {
            newFrozen = (currentFrozen - parseFloat(amount)).toFixed(2);
            Swal.fire('Success', `Unfrozen ${amount} USDT. Remaining frozen: ${newFrozen}`, 'success');
        } else { return; }
        await database.ref('users/' + userId).update({ frozenAmount: newFrozen });
        loadUsersTable();
    }
};

window.assignCustomerService = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    
    const { value: formValues } = await Swal.fire({
        title: `Assign Customer Service for ${user.username}`,
        html: `<input id="whatsapp" class="swal2-input" placeholder="WhatsApp Number" value="${user.assignedWhatsapp || ''}">
               <input id="telegram" class="swal2-input" placeholder="Telegram Username" value="${user.assignedTelegram || ''}">`,
        focusConfirm: false, showCancelButton: true, confirmButtonColor: '#ffd700',
        preConfirm: () => ({ whatsapp: document.getElementById('whatsapp').value, telegram: document.getElementById('telegram').value })
    });
    
    if (formValues) {
        await database.ref('users/' + userId).update({
            assignedWhatsapp: formValues.whatsapp,
            assignedTelegram: formValues.telegram
        });
        Swal.fire('Success', 'Customer service assigned', 'success');
        loadUsersTable();
    }
};

window.viewBaseSalary = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    const streak = user.signInStreak || 0;
    const baseSalary = user.baseSalary || 0;
    const lastSignIn = user.lastSignIn || 'Never';
    
    const { value: action } = await Swal.fire({
        title: `Base Salary: ${user.username}`,
        html: `<div style="text-align:left;">
            <p><strong>Current Streak:</strong> ${streak}/15 days</p>
            <p><strong>Base Salary:</strong> ${baseSalary.toFixed(2)} USDT</p>
            <p><strong>Last Sign In:</strong> ${lastSignIn}</p>
            <p><strong>Reward System:</strong> +150 day 1, +50 each day for 15 days</p>
            <p><strong>Reset on skip:</strong> Yes</p>
            <p><strong>Payout after 15 days:</strong> Yes (to balance)</p>
        </div>`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Reset Streak & Salary',
        cancelButtonText: 'Close',
        confirmButtonColor: '#ff4444',
        cancelButtonColor: '#ffd700'
    });
    
    if (action === 'confirm') {
        const { value: confirm } = await Swal.fire({
            title: 'Confirm Reset',
            text: 'This will reset the user\'s sign-in streak to 0 and base salary to 0. Continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4444',
            cancelButtonColor: '#ffd700'
        });
        
        if (confirm) {
            await database.ref('users/' + userId).update({
                signInStreak: 0,
                baseSalary: 0
            });
            Swal.fire('Reset', 'Sign-in streak and base salary reset to 0', 'success');
            loadUsersTable();
        }
    }
};

async function loadTaskManagement() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="addTaskBtn">+ Add New Task</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Task ID</th><th>Product Name</th><th>Price</th><th>Commission</th><th>Special</th><th>Images</th><th>Actions</th></tr></thead>
        <tbody id="tasksTableBody"><td><td colspan="7">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) addBtn.addEventListener('click', addNewTask);
    await loadTasksTable();
}

async function loadTasksTable() {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;
    
    try {
        const tasksSnap = await database.ref('tasks').once('value');
        const tasks = tasksSnap.val() || {};
        let html = '';
        for (let id in tasks) {
            const task = tasks[id];
            const hasImages = (task.image1 ? 1 : 0) + (task.image2 ? 1 : 0) + (task.image3 ? 1 : 0);
            html += `<tr>
                <td>${task.taskId || id}<\/td>
                <td>${task.productName || 'N/A'}<\/td>
                <td>$${task.price || '0'}<\/td>
                <td>+${task.commission || '0'} USDT<\/td>
                <td>${task.isSpecial ? '<span class="special-badge">🔥 SPECIAL</span>' : '-'}<\/td>
                <td>${hasImages}/3 images<\/td>
                <td>
                    <button class="edit-btn" onclick="editTask('${id}')">✏️ Edit<\/button>
                    <button class="delete-btn" onclick="deleteTask('${id}')">🗑️ Delete<\/button>
                <\/td>
            <\/tr>`;
        }
        tbody.innerHTML = html || '<td><td colspan="7">No tasks found<\/td><\/tr>';
    } catch(e) { console.error(e); }
}

window.editTask = async function(taskId) {
    const snap = await database.ref('tasks/' + taskId).once('value');
    const task = snap.val();
    
    let imagesHtml = '';
    for (let i = 1; i <= 3; i++) {
        const imgSrc = task[`image${i}`];
        imagesHtml += `<div style="flex:1; text-align:center;">
            <div id="preview${i}" style="width:100%; height:100px; background:#333; border-radius:8px; margin-bottom:5px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                ${imgSrc ? `<img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="color:#888;">No Image</span>'}
            </div>
            <input type="file" id="image${i}" accept="image/*" style="font-size:11px;">
        </div>`;
    }
    
    const { value: formValues } = await Swal.fire({
        title: `Edit Task: ${task.taskId}`,
        html: `<div style="max-height:70vh; overflow-y:auto;">
            <input id="taskId" class="swal2-input" placeholder="Task ID" value="${task.taskId || ''}">
            <input id="productName" class="swal2-input" placeholder="Product Name" value="${task.productName || ''}">
            <input id="price" class="swal2-input" placeholder="Price (USD)" value="${task.price || '0'}">
            <input id="commission" class="swal2-input" placeholder="Commission (USDT)" value="${task.commission || '0'}">
            <input id="availableFrom" class="swal2-input" type="datetime-local" placeholder="Available From" value="${task.availableFrom ? task.availableFrom.slice(0,16) : ''}">
            <label style="display:flex; align-items:center; gap:10px; margin:10px 0;"><input type="checkbox" id="isSpecial" ${task.isSpecial ? 'checked' : ''}> <span style="color:#ffd700;">🔥 Special Task</span></label>
            <div style="margin-top:15px;"><label>Task Images (Max 3):</label></div>
            <div style="display:flex; gap:10px; margin-top:10px;">${imagesHtml}</div>
        </div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'Save', cancelButtonText: 'Cancel',
        confirmButtonColor: '#ffd700', width: '650px',
        preConfirm: () => {
            return {
                taskId: document.getElementById('taskId').value,
                productName: document.getElementById('productName').value,
                price: document.getElementById('price').value,
                commission: document.getElementById('commission').value,
                availableFrom: document.getElementById('availableFrom').value,
                isSpecial: document.getElementById('isSpecial').checked
            };
        }
    });
    
    if (formValues) {
        const updates = {
            taskId: formValues.taskId,
            productName: formValues.productName,
            price: formValues.price,
            commission: formValues.commission,
            availableFrom: formValues.availableFrom,
            isSpecial: formValues.isSpecial
        };
        
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById(`image${i}`);
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const imageData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                updates[`image${i}`] = imageData;
            }
        }
        
        await database.ref('tasks/' + taskId).update(updates);
        Swal.fire('Success', 'Task updated!', 'success');
        loadTasksTable();
    }
};

window.deleteTask = async function(taskId) {
    const result = await Swal.fire({ title: 'Delete Task?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff6666', confirmButtonText: 'Delete' });
    if (result.isConfirmed) {
        await database.ref('tasks/' + taskId).remove();
        Swal.fire('Deleted!', 'Task deleted.', 'success');
        loadTasksTable();
    }
};

async function addNewTask() {
    const { value: formValues } = await Swal.fire({
        title: 'Create New Task',
        html: `<input id="taskId" class="swal2-input" placeholder="Task ID">
               <input id="productName" class="swal2-input" placeholder="Product Name">
               <input id="price" class="swal2-input" placeholder="Price (USD)">
               <input id="commission" class="swal2-input" placeholder="Commission (USDT)">
               <input id="availableFrom" class="swal2-input" type="datetime-local" placeholder="Available From">
               <label style="display:flex; align-items:center; gap:10px; margin:10px 0;"><input type="checkbox" id="isSpecial"> <span style="color:#ffd700;">🔥 Special Task</span></label>
               <div style="margin-top:15px;"><label>Task Images (Max 3):</label></div>
               <div style="display:flex; gap:10px;"><div><input type="file" id="image1" accept="image/*"></div>
               <div><input type="file" id="image2" accept="image/*"></div>
               <div><input type="file" id="image3" accept="image/*"></div></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonColor: '#ffd700', width: '550px',
        preConfirm: () => {
            return {
                taskId: document.getElementById('taskId').value,
                productName: document.getElementById('productName').value,
                price: document.getElementById('price').value,
                commission: document.getElementById('commission').value,
                availableFrom: document.getElementById('availableFrom').value,
                isSpecial: document.getElementById('isSpecial').checked
            };
        }
    });
    
    if (formValues && formValues.productName) {
        const newTask = {
            taskId: formValues.taskId || 'TSK' + Date.now(),
            productName: formValues.productName,
            price: formValues.price || '0',
            commission: formValues.commission || '0',
            availableFrom: formValues.availableFrom || null,
            isSpecial: formValues.isSpecial || false,
            createdAt: new Date().toISOString()
        };
        
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById(`image${i}`);
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const imageData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                newTask[`image${i}`] = imageData;
            }
        }
        
        await database.ref('tasks/' + newTask.taskId).set(newTask);
        Swal.fire('Success', 'Task created!', 'success');
        loadTasksTable();
    }
}

async function loadWithdrawalRequests() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    try {
        const snap = await database.ref('withdrawals').once('value');
        const withdrawals = snap.val() || {};
        let pending = '', history = '';
        for (let id in withdrawals) {
            const w = withdrawals[id];
            if (w.status === 'pending') {
                pending += `<tr>
                    <td>${w.id}<\/td>
                    <td>${w.username}<\/td>
                    <td>${w.amount} USDT<\/td>
                    <td>${w.walletAddress || 'Not set'}<\/td>
                    <td>${new Date(w.requestDate).toLocaleString()}<\/td>
                    <td><button class="approve-btn" onclick="approveWithdrawal('${id}')">Approve<\/button><button class="reject-btn" onclick="rejectWithdrawal('${id}')">Reject<\/button><\/td>
                <\/tr>`;
            } else {
                history += `<tr>
                    <td>${w.id}<\/td>
                    <td>${w.username}<\/td>
                    <td>${w.amount} USDT<\/td>
                    <td>${w.walletAddress || 'Not set'}<\/td>
                    <td>${w.status}<\/td>
                    <td>${new Date(w.requestDate).toLocaleString()}<\/td>
                <\/tr>`;
            }
        }
        
        content.innerHTML = `<h3 style="color:#ffd700;">💰 Pending Withdrawals</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Wallet Address</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>${pending || '<td><td colspan="6">None<\/td><\/tr>'}<\/tbody><\/table><\/div>
        <h3 style="color:#ffd700; margin-top:30px;">📜 Withdrawal History</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Wallet Address</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${history || '<td><td colspan="6">None<\/td><\/tr>'}<\/tbody><\/table><\/div>`;
    } catch(e) { console.error(e); }
}

window.approveWithdrawal = async function(id) {
    const snap = await database.ref('withdrawals/' + id).once('value');
    const w = snap.val();
    if (!w) return;

    const userSnap = await database.ref('users/' + w.userId).once('value');
    const user = userSnap.val();
    const newBalance = (parseFloat(user.balance || 0) - parseFloat(w.amount || 0)).toFixed(2);

    await database.ref('users/' + w.userId).update({ balance: newBalance });
    await database.ref('withdrawals/' + id).update({ status: 'confirmed', processedDate: new Date().toISOString() });
    Swal.fire('Approved', `Withdrawal of ${w.amount} USDT approved`, 'success');
    loadWithdrawalRequests();
    loadDashboardStats();
};

window.rejectWithdrawal = async function(id) {
    const snap = await database.ref('withdrawals/' + id).once('value');
    const w = snap.val();
    if (!w) return;

    await database.ref('withdrawals/' + id).update({ status: 'rejected', processedDate: new Date().toISOString() });
    Swal.fire('Rejected', `Withdrawal rejected.`, 'info');
    loadWithdrawalRequests();
    loadDashboardStats();
};

async function loadDepositRecords() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody id="depositsTableBody"><td><td colspan="4">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    const depositBtn = document.getElementById('manualDepositBtn');
    if (depositBtn) depositBtn.addEventListener('click', manualDeposit);
    await loadDepositsTable();
}

async function loadOpenTrades() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="refreshTradesBtn">🔄 Refresh Trades</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Trade ID</th><th>User</th><th>Coin</th><th>Type</th><th>Amount</th><th>Price</th><th>Total</th><th>Duration</th><th>Time Left</th><th>Entry Price</th><th>Actions</th></tr></thead>
        <tbody id="openTradesTableBody"><td><td colspan="11">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    const refreshBtn = document.getElementById('refreshTradesBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => loadOpenTradesTable());
    await loadOpenTradesTable();
}

async function loadOpenTradesTable() {
    const tbody = document.getElementById('openTradesTableBody');
    if (!tbody) return;
    
    try {
        const openTradesSnap = await database.ref('tradingOrders').once('value');
        const openTrades = openTradesSnap.val() || {};
        let html = '';
        
        for (let id in openTrades) {
            const trade = openTrades[id];
            if (trade.status !== 'open' && trade.status !== 'ready_for_admin' && trade.status !== 'closed') continue;
            
            // Get user info
            const userSnap = await database.ref('users/' + trade.userId).once('value');
            const user = userSnap.val();
            const username = user ? user.username : 'Unknown';
            
            const now = Date.now();
            const endTime = new Date(trade.endTime).getTime();
            const timeLeft = Math.max(0, endTime - now);
            const minutesLeft = Math.floor(timeLeft / 60000);
            const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
            
            const typeColor = trade.side === 'buy' ? '#00ff00' : '#ff6666';
            const isReady = trade.status === 'ready_for_admin';
            const isClosed = trade.status === 'closed';
            
            html += `<tr>
                <td>${id.substring(0, 10)}...<\/td>
                <td><strong>${username}<\/strong><\/td>
                <td>${trade.symbol}/USD<\/td>
                <td style="color:${typeColor}; font-weight:bold;">${trade.side.toUpperCase()}<\/td>
                <td>${trade.amount} USDT<\/td>
                <td>${trade.price.toFixed(2)}<\/td>
                <td>${trade.amount} USDT<\/td>
                <td>${trade.duration} min<\/td>
                <td style="color:${isClosed ? '#00ff00' : isReady ? '#00ff00' : '#ffd700'}; font-weight:bold;">${isClosed ? 'Closed' : isReady ? 'Ready' : `${minutesLeft}m ${secondsLeft}s`}<\/td>
                <td>${trade.price.toFixed(2)}<\/td>
                <td>
                    ${isClosed ? `<span style="color:#00ff00;">Completed</span>` : isReady ? `<button class="approve-btn" onclick="confirmTrade('${id}')">Add Funds</button><button class="reject-btn" onclick="rejectTrade('${id}')">Reject</button>` : '<span style="color:#888;">Waiting...</span>'}
                <\/td>
            <\/tr>`;
        }
        
        tbody.innerHTML = html || '<td><td colspan="11">No orders<\/td><\/tr>';
        
        // Auto-refresh every 5 seconds
        setTimeout(loadOpenTradesTable, 5000);
        
    } catch(e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="11">Error loading open trades<\/td><\/tr>';
    }
}

window.confirmTrade = async function(tradeId) {
    try {
        const snap = await database.ref('tradingOrders/' + tradeId).once('value');
        const trade = snap.val();
        if (!trade) return;
        
        // Get user info
        const userSnap = await database.ref('users/' + trade.userId).once('value');
        const user = userSnap.val();
        const username = user ? user.username : 'Unknown';
        
        const { value: profitAmount } = await Swal.fire({
            title: 'Add Funds',
            html: `<div style="text-align:left;">
                <p><strong>User:</strong> ${username}</p>
                <p><strong>Coin:</strong> ${trade.symbol}/USD</p>
                <p><strong>Type:</strong> ${trade.side.toUpperCase()}</p>
                <p><strong>Order Price:</strong> ${trade.price.toFixed(2)} USD</p>
                <p><strong>Order Amount:</strong> ${trade.amount} USDT</p>
                <p><strong>Duration:</strong> ${trade.duration} min</p>
                <p><strong>Status:</strong> Ready</p>
            </div>`,
            input: 'number',
            inputLabel: 'Enter profit amount to add (USDT)',
            inputPlaceholder: '0.00',
            showCancelButton: true,
            confirmButtonColor: '#00ff00',
            confirmButtonText: 'Add Funds'
        });
        
        if (profitAmount !== null && !isNaN(profitAmount)) {
            const profit = parseFloat(profitAmount);
            
            console.log('Adding profit:', profit);
            console.log('Trade amount:', trade.amount);
            
            // Fetch fresh user balance after admin enters profit amount
            const freshUserSnap = await database.ref('users/' + trade.userId).once('value');
            const freshUser = freshUserSnap.val();
            
            const currentBalance = parseFloat(freshUser.balance || 0);
            console.log('Current balance:', currentBalance);
            
            // Add only the profit amount to user balance (not order amount)
            const newBalance = (currentBalance + profit).toFixed(2);
            console.log('New balance:', newBalance);
            
            await database.ref('users/' + trade.userId).update({ balance: newBalance });
            
            // Update trade status to closed with profit info
            await database.ref('tradingOrders/' + tradeId).update({
                status: 'closed',
                profit: profit,
                totalReturn: profit,
                closedAt: new Date().toISOString()
            });
            
            console.log('Order status updated to closed');
            
            Swal.fire('Success', `Added ${profit.toFixed(2)} USDT to ${username}'s balance. Order marked as closed.`, 'success');
            loadOpenTradesTable();
            loadDashboardStats();
        }
    } catch (error) {
        console.error('Error confirming trade:', error);
        Swal.fire('Error', 'Failed to add funds. Please try again.', 'error');
    }
};

window.rejectTrade = async function(tradeId) {
    const snap = await database.ref('tradingOrders/' + tradeId).once('value');
    const trade = snap.val();
    if (!trade) return;
    
    // Get user info
    const userSnap = await database.ref('users/' + trade.userId).once('value');
    const user = userSnap.val();
    const username = user ? user.username : 'Unknown';
    
    const { value: refundAmount } = await Swal.fire({
        title: 'Reject Trade',
        html: `<div style="text-align:left;">
            <p><strong>User:</strong> ${username}</p>
            <p><strong>Coin:</strong> ${trade.symbol}/USD</p>
            <p><strong>Type:</strong> ${trade.side.toUpperCase()}</p>
            <p><strong>Trade Amount:</strong> ${trade.amount} USDT</p>
            <p>Enter refund amount (0 = no refund):</p>
        </div>`,
        input: 'number',
        inputLabel: 'Refund Amount (USDT)',
        inputPlaceholder: '0',
        showCancelButton: true,
        confirmButtonColor: '#ff6666',
        confirmButtonText: 'Reject Trade'
    });
    
    if (refundAmount !== null && !isNaN(refundAmount)) {
        const refund = parseFloat(refundAmount);
        
        if (refund > 0) {
            // Add refund to user balance
            const currentBalance = parseFloat(user.balance || 0);
            const newBalance = (currentBalance + refund).toFixed(2);
            
            await database.ref('users/' + trade.userId).update({ balance: newBalance });
        }
        
        // Update trade status to rejected
        await database.ref('tradingOrders/' + tradeId).update({
            status: 'rejected',
            refund: refund,
            rejectedAt: new Date().toISOString()
        });
        
        Swal.fire('Rejected', `Trade rejected. Refunded ${refund} USDT to ${username}.`, 'info');
        loadOpenTradesTable();
        loadDashboardStats();
    }
};

async function loadDepositsTable() {
    const tbody = document.getElementById('depositsTableBody');
    if (!tbody) return;
    
    try {
        const depositsSnap = await database.ref('deposits').once('value');
        const deposits = depositsSnap.val() || {};
        let html = '';
        for (let id in deposits) {
            html += `<tr>
                <td>${deposits[id].id}<\/td>
                <td>${deposits[id].username}<\/td>
                <td>${deposits[id].amount} USDT<\/td>
                <td>${deposits[id].date}<\/td>
            <\/tr>`;
        }
        tbody.innerHTML = html || '<td><td colspan="4">No deposits<\/td><\/tr>';
    } catch(e) { console.error(e); }
}

async function manualDeposit() {
    const { value: username } = await Swal.fire({ title: 'Manual Deposit', input: 'text', inputLabel: 'Username', showCancelButton: true });
    if (!username) return;
    const { value: amount } = await Swal.fire({ title: 'Amount', input: 'number', inputLabel: 'Amount in USDT', showCancelButton: true });
    if (!amount || isNaN(amount)) return;
    
    const usersSnap = await database.ref('users').once('value');
    const users = usersSnap.val() || {};
    let userId = null;
    for (let id in users) {
        if (users[id].username === username) { userId = id; break; }
    }
    if (!userId) { Swal.fire('Error', 'User not found', 'error'); return; }
    
    const user = users[userId];
    const newBalance = (parseFloat(user.balance || 0) + parseFloat(amount)).toFixed(2);
    await database.ref('users/' + userId).update({ balance: newBalance });
    await database.ref('deposits/' + Date.now()).set({
        id: 'DEP' + Date.now(), userId: userId, username: username, amount: parseFloat(amount), date: new Date().toLocaleString()
    });
    Swal.fire('Success', `Deposited ${amount} USDT to ${username}`, 'success');
    loadDepositsTable();
    loadDashboardStats();
}

async function loadContentManagement() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    const termsSnap = await database.ref('settings/terms').once('value');
    const noticeSnap = await database.ref('settings/taskNotice').once('value');
    
    content.innerHTML = `
        <div class="form-group"><label>📋 Terms & Conditions</label><textarea id="termsEditor" rows="8" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${termsSnap.val() || ''}</textarea><button class="save-btn" id="saveTermsBtn">Save Terms</button></div>
        <div class="form-group" style="margin-top:20px;"><label>📝 Task Notice</label><textarea id="noticeEditor" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${noticeSnap.val() || ''}</textarea><button class="save-btn" id="saveNoticeBtn">Save Notice</button></div>
        <div class="form-group" style="margin-top:20px;"><label>📜 Certificate Image</label><input type="file" id="certImage" accept="image/*"><button class="save-btn" id="saveCertBtn" style="margin-top:10px;">Upload</button></div>
        <div class="form-group" style="margin-top:20px;"><label>📄 About Us PDF URL</label><input type="text" id="aboutPDF" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;"><button class="save-btn" id="saveAboutBtn">Save</button></div>
        <div class="form-group" style="margin-top:20px;"><label>❓ FAQS PDF URL</label><input type="text" id="faqsPDF" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;"><button class="save-btn" id="saveFaqsBtn">Save</button></div>`;
    
    const termsBtn = document.getElementById('saveTermsBtn');
    if (termsBtn) termsBtn.addEventListener('click', async () => { await database.ref('settings/terms').set(document.getElementById('termsEditor').value); Swal.fire('Saved', 'Terms saved!', 'success'); });
    
    const noticeBtn = document.getElementById('saveNoticeBtn');
    if (noticeBtn) noticeBtn.addEventListener('click', async () => { await database.ref('settings/taskNotice').set(document.getElementById('noticeEditor').value); Swal.fire('Saved', 'Notice saved!', 'success'); });
    
    const certBtn = document.getElementById('saveCertBtn');
    if (certBtn) certBtn.addEventListener('click', async () => {
        const file = document.getElementById('certImage').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => { await database.ref('settings/certificateImage').set(e.target.result); Swal.fire('Saved', 'Certificate uploaded!', 'success'); };
            reader.readAsDataURL(file);
        } else { Swal.fire('Error', 'Select a file', 'error'); }
    });
    
    const aboutBtn = document.getElementById('saveAboutBtn');
    if (aboutBtn) aboutBtn.addEventListener('click', async () => { await database.ref('settings/aboutPDF').set(document.getElementById('aboutPDF').value); Swal.fire('Saved', 'About PDF saved!', 'success'); });
    
    const faqsBtn = document.getElementById('saveFaqsBtn');
    if (faqsBtn) faqsBtn.addEventListener('click', async () => { await database.ref('settings/faqsPDF').set(document.getElementById('faqsPDF').value); Swal.fire('Saved', 'FAQS saved!', 'success'); });
}

async function loadEmailManagement() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    const emailTemplateSnap = await database.ref('settings/emailTemplates/welcome').once('value');
    const emailTemplate = emailTemplateSnap.val() || { body: 'Welcome to Clutch Incorporated! Your account has been successfully created.' };

    content.innerHTML = `
        <h3 style="color:#ffd700; margin-bottom:20px;">📧 Email Management</h3>
        
        <div class="form-group" style="margin-bottom:30px;">
            <label>📝 Welcome Email Template</label>
            <p style="color:#888; font-size:12px; margin-bottom:10px;">Use {name}, {invitationCode}, and {userId} as placeholders</p>
            <textarea id="welcomeEmailTemplate" rows="5" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${emailTemplate.body}</textarea>
            <button class="save-btn" id="saveWelcomeTemplateBtn" style="margin-top:10px;">Save Template</button>
        </div>

        <div class="form-group" style="margin-bottom:30px;">
            <label>📤 Send Individual Email</label>
            <select id="emailUserSelect" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px; margin-bottom:10px;">
                <option value="">Select User</option>
            </select>
            <input type="text" id="emailSubject" placeholder="Subject" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px; margin-bottom:10px;">
            <textarea id="emailMessage" rows="4" placeholder="Message" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px; margin-bottom:10px;"></textarea>
            <button class="save-btn" id="sendIndividualEmailBtn">Send Email</button>
        </div>

        <div class="form-group">
            <label>📢 Send Bulk Email to All Users</label>
            <input type="text" id="bulkEmailSubject" placeholder="Subject" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px; margin-bottom:10px;">
            <textarea id="bulkEmailMessage" rows="4" placeholder="Message" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px; margin-bottom:10px;"></textarea>
            <button class="save-btn" id="sendBulkEmailBtn">Send to All Users</button>
        </div>
    `;

    // Load users for individual email
    const usersSnap = await database.ref('users').once('value');
    const users = usersSnap.val() || {};
    const userSelect = document.getElementById('emailUserSelect');
    if (userSelect) {
        for (let id in users) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${users[id].username} (${users[id].email})`;
            userSelect.appendChild(option);
        }
    }

    // Save welcome template
    const saveTemplateBtn = document.getElementById('saveWelcomeTemplateBtn');
    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', async () => {
            const body = document.getElementById('welcomeEmailTemplate').value;
            await database.ref('settings/emailTemplates/welcome').set({ body });
            Swal.fire('Saved', 'Welcome email template saved!', 'success');
        });
    }

    // Send individual email
    const sendIndividualBtn = document.getElementById('sendIndividualEmailBtn');
    if (sendIndividualBtn) {
        sendIndividualBtn.addEventListener('click', async () => {
            const userId = document.getElementById('emailUserSelect').value;
            const subject = document.getElementById('emailSubject').value;
            const message = document.getElementById('emailMessage').value;

            if (!userId || !subject || !message) {
                Swal.fire('Error', 'Please fill all fields', 'error');
                return;
            }

            const user = users[userId];
            if (!user || !user.email) {
                Swal.fire('Error', 'User not found or no email', 'error');
                return;
            }

            try {
                const result = await sendCustomEmail(user.email, user.username, subject, message);
                if (result) {
                    Swal.fire('Success', 'Email sent successfully!', 'success');
                    document.getElementById('emailSubject').value = '';
                    document.getElementById('emailMessage').value = '';
                } else {
                    Swal.fire('Error', 'Failed to send email. Check console for details.', 'error');
                }
            } catch (error) {
                console.error('Error sending email:', error);
                Swal.fire('Error', 'Failed to send email: ' + error.message, 'error');
            }
        });
    }

    // Send bulk email
    const sendBulkBtn = document.getElementById('sendBulkEmailBtn');
    if (sendBulkBtn) {
        sendBulkBtn.addEventListener('click', async () => {
            const subject = document.getElementById('bulkEmailSubject').value;
            const message = document.getElementById('bulkEmailMessage').value;

            if (!subject || !message) {
                Swal.fire('Error', 'Please fill subject and message', 'error');
                return;
            }

            const result = await Swal.fire({
                title: 'Send Bulk Email?',
                text: `This will send an email to ${Object.keys(users).length} users. Continue?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Send',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) return;

            try {
                const usersArray = Object.values(users).filter(u => u.email);
                const result = await sendBulkEmail(usersArray, subject, message);
                
                Swal.fire(
                    'Bulk Email Sent',
                    `Success: ${result.successCount}, Failed: ${result.failureCount}, Total: ${result.total}`,
                    result.failureCount === 0 ? 'success' : 'warning'
                );
                
                document.getElementById('bulkEmailSubject').value = '';
                document.getElementById('bulkEmailMessage').value = '';
            } catch (error) {
                console.error('Error sending bulk email:', error);
                Swal.fire('Error', 'Failed to send bulk email: ' + error.message, 'error');
            }
        });
    }
}

function loadVIPSettings() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = `<div class="form-group"><label>VIP 1 (%)</label><input type="number" id="vip1" value="0.5"></div>
        <div class="form-group"><label>VIP 2 (%)</label><input type="number" id="vip2" value="1"></div>
        <div class="form-group"><label>VIP 3 (%)</label><input type="number" id="vip3" value="1.5"></div>
        <div class="form-group"><label>VIP 4 (%)</label><input type="number" id="vip4" value="2"></div>
        <button class="save-btn" id="saveVipBtn">Save</button>`;
    
    const saveBtn = document.getElementById('saveVipBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => Swal.fire('Saved', 'VIP settings saved!', 'success'));
}

async function loadServiceSettings() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    const snap = await database.ref('settings/serviceContacts').once('value');
    const contacts = snap.val() || { whatsapp: '+1 234 567 8900', telegram: '@ClutchSupport' };
    content.innerHTML = `<div class="form-group"><label>📱 WhatsApp</label><input type="text" id="whatsapp" value="${contacts.whatsapp}"></div>
        <div class="form-group"><label>✈️ Telegram</label><input type="text" id="telegram" value="${contacts.telegram}"></div>
        <button class="save-btn" id="saveServiceBtn">Save</button>`;
    
    const saveBtn = document.getElementById('saveServiceBtn');
    if (saveBtn) saveBtn.addEventListener('click', async () => {
        await database.ref('settings/serviceContacts').set({ whatsapp: document.getElementById('whatsapp').value, telegram: document.getElementById('telegram').value });
        Swal.fire('Saved', 'Service settings saved!', 'success');
    });
}

async function loadWalletSettings() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    const snap = await database.ref('settings/merchantWallet').once('value');
    content.innerHTML = `<div class="form-group"><label>🏦 Merchant Wallet Address</label><textarea id="merchantAddress" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${snap.val() || ''}</textarea>
        <button class="save-btn" id="saveWalletBtn">Save</button>`;
    
    const saveBtn = document.getElementById('saveWalletBtn');
    if (saveBtn) saveBtn.addEventListener('click', async () => {
        await database.ref('settings/merchantWallet').set(document.getElementById('merchantAddress').value);
        Swal.fire('Saved', 'Wallet saved!', 'success');
    });
}

async function loadInvitationCodes() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    const today = new Date().toISOString().split('T')[0];
    const codesSnap = await database.ref('invitationCodes').once('value');
    const codes = codesSnap.val() || {};
    
    let todaysCode = null;
    let historyHtml = '';
    for (let id in codes) {
        const code = codes[id];
        // Sub admins only see their own codes
        if (adminType === 'sub' && code.adminId !== adminId) continue;
        
        if (code.date === today && code.active === true) todaysCode = code;
        historyHtml += `<tr>
            <td>${code.date}<\/td>
            <td style="color:#ffd700;">${code.code}<\/td>
            <td>${code.adminName}<\/td>
            <td>${code.active ? 'Active' : 'Expired'}<\/td>
            <td><button class="delete-btn" onclick="deactivateCode('${id}')">Deactivate<\/button><\/td>
        <\/tr>`;
    }
    
    content.innerHTML = `<div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">
            <h3 style="color:#ffd700;">Today's Code</h3>
            <p style="font-size:36px; font-weight:bold; color:#ffd700;">${todaysCode ? todaysCode.code : 'No code'}</p>
            <button class="save-btn" id="generateCodeBtn">Generate New Code</button>
        </div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${historyHtml || '<td><td colspan="5">No codes<\/td><\/tr>'}<\/tbody><\/table><\/div>`;
    
    const generateBtn = document.getElementById('generateCodeBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateInvitationCode);
}

window.deactivateCode = async function(id) {
    await database.ref('invitationCodes/' + id).update({ active: false });
    Swal.fire('Deactivated', 'Code deactivated', 'success');
    loadInvitationCodes();
};

async function generateInvitationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    const today = new Date().toISOString().split('T')[0];
    await database.ref('invitationCodes/CODE_' + Date.now()).set({
        code: code, date: today, adminId: adminId || 'master', adminName: adminName || 'master', active: true
    });
    Swal.fire('Generated', `Code: ${code}\nValid until midnight`, 'success');
    loadInvitationCodes();
}

function loadAdminManagement() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    if (adminType !== 'master') {
        content.innerHTML = '<div style="text-align:center; padding:50px; color:#ff6666;">Access Denied</div>';
        return;
    }
    
    content.innerHTML = `<button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <div class="table-container"><table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody id="adminsTableBody"><tr><td colspan="4">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    const createBtn = document.getElementById('createAdminBtn');
    if (createBtn) createBtn.addEventListener('click', createSubAdmin);
    loadAdminsTable();
}

async function loadAdminsTable() {
    const tbody = document.getElementById('adminsTableBody');
    if (!tbody) return;
    
    const snap = await database.ref('admins/sub').once('value');
    const admins = snap.val() || {};
    let html = '';
    for (let id in admins) {
        html += `<td>
            <td>${admins[id].username}<\/td>
            <td>${admins[id].email}<\/td>
            <td>${admins[id].created ? new Date(admins[id].created).toLocaleDateString() : 'Unknown'}<\/td>
            <td>
                <button class="edit-btn" onclick="resetAdminPass('${id}')">Reset Password<\/button>
                <button class="delete-btn" onclick="deleteAdmin('${id}')">Delete<\/button>
            <\/td>
        <\/tr>`;
    }
    tbody.innerHTML = html || '<td><td colspan="4">No sub admins<\/td><\/tr>';
}

window.resetAdminPass = async function(id) {
    const { value: newPass } = await Swal.fire({ title: 'Reset Password', input: 'password', inputLabel: 'New password (min 4)', showCancelButton: true });
    if (newPass && newPass.length >= 4) {
        await database.ref('admins/sub/' + id).update({ password: newPass });
        Swal.fire('Success', 'Password reset!', 'success');
    }
};

window.deleteAdmin = async function(id) {
    const result = await Swal.fire({ title: 'Delete Admin?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff6666', confirmButtonText: 'Delete' });
    if (result.isConfirmed) {
        await database.ref('admins/sub/' + id).remove();
        Swal.fire('Deleted', 'Admin deleted', 'success');
        loadAdminsTable();
    }
};

async function createSubAdmin() {
    const { value: username } = await Swal.fire({ title: 'Username', input: 'text', showCancelButton: true });
    if (!username) return;
    const { value: email } = await Swal.fire({ title: 'Email', input: 'email', showCancelButton: true });
    if (!email) return;
    const { value: password } = await Swal.fire({ title: 'Password', input: 'password', inputLabel: 'Minimum 4 characters', showCancelButton: true });
    if (!password || password.length < 4) return;
    
    await database.ref('admins/sub/ADMIN' + Date.now()).set({
        username: username, email: email, password: password, role: 'sub', created: new Date().toISOString()
    });
    Swal.fire('Success', `Sub admin created!\nUsername: ${username}\nPassword: ${password}`, 'success');
    loadAdminsTable();
}

// ============ BASE SALARY MANAGEMENT ============

window.viewBaseSalary = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    const baseSalary = user.baseSalary || 0;
    const signInStreak = user.signInStreak || 0;
    
    Swal.fire({
        title: `Base Salary: ${user.username}`,
        html: `
            <div style="text-align:left;">
                <p><strong>Current Base Salary:</strong> <span style="color:#ffd700;">${baseSalary.toFixed(2)} USDT</span></p>
                <p><strong>Sign-in Streak:</strong> ${signInStreak} days</p>
                <p><strong>Next Reward at ${signInStreak + 1} days:</strong> ${getRewardForDay(signInStreak + 1)} USDT</p>
                <hr style="margin:15px 0; border-color:#333;">
                <p><strong>Add to Base Salary:</strong></p>
                <input type="number" id="addBaseAmount" class="swal2-input" placeholder="Amount to add" step="0.01">
                <p><strong>Subtract from Base Salary:</strong></p>
                <input type="number" id="subBaseAmount" class="swal2-input" placeholder="Amount to subtract" step="0.01">
                <p><strong>Set Base Salary to:</strong></p>
                <input type="number" id="setBaseAmount" class="swal2-input" placeholder="New amount" step="0.01">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Apply Changes',
        confirmButtonColor: '#ffd700',
        width: '450px',
        preConfirm: () => {
            return {
                add: document.getElementById('addBaseAmount').value,
                sub: document.getElementById('subBaseAmount').value,
                set: document.getElementById('setBaseAmount').value
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            let newBaseSalary = baseSalary;
            
            if (result.value.add && !isNaN(result.value.add) && parseFloat(result.value.add) > 0) {
                newBaseSalary += parseFloat(result.value.add);
                Swal.fire('Added', `Added ${result.value.add} USDT to base salary`, 'success');
            }
            
            if (result.value.sub && !isNaN(result.value.sub) && parseFloat(result.value.sub) > 0) {
                if (parseFloat(result.value.sub) > newBaseSalary) {
                    Swal.fire('Error', 'Cannot subtract more than current base salary', 'error');
                    return;
                }
                newBaseSalary -= parseFloat(result.value.sub);
                Swal.fire('Subtracted', `Subtracted ${result.value.sub} USDT from base salary`, 'success');
            }
            
            if (result.value.set && !isNaN(result.value.set) && parseFloat(result.value.set) >= 0) {
                newBaseSalary = parseFloat(result.value.set);
                Swal.fire('Set', `Base salary set to ${newBaseSalary.toFixed(2)} USDT`, 'success');
            }
            
            if (newBaseSalary !== baseSalary) {
                await database.ref('users/' + userId).update({ baseSalary: newBaseSalary });
                loadUsersTable();
            }
        }
    });
};

function getRewardForDay(day) {
    const rewards = {1: 300, 2: 150, 3: 500, 4: 1000, 5: 150, 6: 300, 7: 300, 8: 400, 9: 500, 10: 600, 11: 700, 12: 800, 13: 900, 14: 1000, 15: 1500};
    return rewards[day] || 0;
}
