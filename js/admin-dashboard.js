// Admin Dashboard - Complete with All Features

let adminType = '';
let adminId = '';
let adminName = '';

document.addEventListener('DOMContentLoaded', async function() {
    const isAdmin = localStorage.getItem('isAdminLoggedIn');
    adminType = localStorage.getItem('adminType') || 'sub';
    adminId = localStorage.getItem('adminId') || '';
    adminName = localStorage.getItem('adminUsername') || '';
    
    if (!isAdmin || isAdmin !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    loadSidebar();
    loadDashboard();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function logout() {
    localStorage.clear();
    window.location.href = 'admin-login.html';
}

function loadSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    const adminBadge = document.getElementById('adminTypeBadge');
    adminBadge.textContent = adminType === 'master' ? '👑 MASTER' : '📋 SUB ADMIN';
    
    let menuHtml = `
        <button class="nav-item active" data-page="dashboard">📊 Dashboard</button>
        <button class="nav-item" data-page="users">👥 User Management</button>
        <button class="nav-item" data-page="tasks">📋 Task Management</button>
        <button class="nav-item" data-page="withdrawals">💰 Withdrawal Requests</button>
        <button class="nav-item" data-page="deposits">💳 Deposit Records</button>
        <button class="nav-item" data-page="content">📝 Content Management</button>
        <button class="nav-item" data-page="vip">⭐ VIP Settings</button>
        <button class="nav-item" data-page="service">📞 Service Settings</button>
        <button class="nav-item" data-page="wallet">🏦 Wallet Settings</button>
        <button class="nav-item" data-page="invitecodes">🔑 Invitation Codes</button>
        <button class="nav-item" data-page="trades">📈 Trade Confirmations</button>
    `;
    
    if (adminType === 'master') {
        menuHtml += `<button class="nav-item" data-page="admins">👑 Admin Management</button>`;
    }
    
    sidebarNav.innerHTML = menuHtml;
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            document.getElementById('pageTitle').textContent = this.textContent.trim();
            
            if (page === 'dashboard') loadDashboard();
            else if (page === 'users') loadUserManagement();
            else if (page === 'tasks') loadTaskManagement();
            else if (page === 'withdrawals') loadWithdrawalRequests();
            else if (page === 'deposits') loadDepositRecords();
            else if (page === 'content') loadContentManagement();
            else if (page === 'vip') loadVIPSettings();
            else if (page === 'service') loadServiceSettings();
            else if (page === 'wallet') loadWalletSettings();
            else if (page === 'invitecodes') loadInvitationCodes();
            else if (page === 'trades') loadTradeConfirmations();
            else if (page === 'admins' && adminType === 'master') loadAdminManagement();
        });
    });
}

async function loadDashboard() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div class="stats-grid">
        <div class="stat-card"><h3>Total Users</h3><div class="stat-value" id="totalUsers">0</div></div>
        <div class="stat-card"><h3>Total Balance</h3><div class="stat-value" id="totalBalance">0 USDT</div></div>
        <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value" id="pendingWithdrawals">0</div></div>
        <div class="stat-card"><h3>Total Tasks</h3><div class="stat-value" id="totalTasks">0</div></div>
    </div>
    <div style="text-align:center; padding:40px; color:#888;"><p>Welcome to Admin Panel</p><p>Admin Type: ${adminType === 'master' ? 'Master Admin' : 'Sub Admin'}</p></div>`;
    
    await loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        let totalBalance = 0;
        let userCount = 0;
        
        for (let id in users) {
            if (adminType === 'sub') {
                if (users[id].assignedAdminId === adminId) {
                    userCount++;
                    totalBalance += parseFloat(users[id].balance || 0);
                }
            } else {
                userCount++;
                totalBalance += parseFloat(users[id].balance || 0);
            }
        }
        
        document.getElementById('totalUsers').textContent = userCount;
        document.getElementById('totalBalance').textContent = totalBalance.toFixed(2) + ' USDT';
        
        const withdrawalsSnap = await database.ref('withdrawals').once('value');
        const withdrawals = withdrawalsSnap.val() || {};
        let pending = 0;
        for (let id in withdrawals) if (withdrawals[id].status === 'pending') pending++;
        document.getElementById('pendingWithdrawals').textContent = pending;
        
        const tasksSnap = await database.ref('tasks').once('value');
        const tasks = tasksSnap.val() || {};
        document.getElementById('totalTasks').textContent = Object.keys(tasks).length;
    } catch(e) { console.error(e); }
}

async function loadUserManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="refreshUsersBtn">🔄 Refresh Users</button></div>
        <div class="table-container"><table class="data-table"><thead>
            <tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Frozen</th><th>Available</th><th>Invite Code</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody id="usersTableBody"><tr><td colspan="9">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    document.getElementById('refreshUsersBtn').addEventListener('click', () => loadUsersTable());
    await loadUsersTable();
}

async function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        let html = '';
        
        for (let id in users) {
            const user = users[id];
            
            if (adminType === 'sub' && user.assignedAdminId !== adminId) {
                continue;
            }
            
            const balance = parseFloat(user.balance || 0).toFixed(2);
            const frozen = parseFloat(user.frozenAmount || 0).toFixed(2);
            const available = (balance - frozen).toFixed(2);
            
            html += `<tr>
                <td>${id.substring(0, 15)}...<\/td>
                <td><strong>${user.username}<\/strong><\/td>
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
                 <\/td>
            <\/tr>`;
        }
        tbody.innerHTML = html || '<tr><td colspan="9">No users found<\/td><\/tr>';
    } catch(e) { console.error(e); }
}

window.viewUserDetails = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    const frozen = parseFloat(user.frozenAmount || 0).toFixed(2);
    const available = (parseFloat(user.balance || 0) - frozen).toFixed(2);
    
    Swal.fire({
        title: `User Details: ${user.username}`,
        html: `<div style="text-align:left;">
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email || 'Not set'}</p>
            <p><strong>Phone:</strong> ${user.phone || 'Not set'}</p>
            <p><strong>Wallet Address:</strong> ${user.walletAddress || 'Not bound'}</p>
            <p><strong>Invitation Code:</strong> ${user.inviteCode || 'N/A'}</p>
            <p><strong>Balance:</strong> ${user.balance || '0'} USDT</p>
            <p><strong>Frozen Amount:</strong> ${frozen} USDT</p>
            <p><strong>Available:</strong> ${available} USDT</p>
            <p><strong>Commission:</strong> ${user.commission || '0'} USDT</p>
            <p><strong>VIP Level:</strong> ${user.vip || 'VIP 1'}</p>
            <p><strong>Status:</strong> ${user.status || 'active'}</p>
            <p><strong>Joined:</strong> ${user.joinedDate || 'N/A'}</p>
            <p><strong>Assigned WhatsApp:</strong> ${user.assignedWhatsapp || 'Default'}</p>
            <p><strong>Assigned Telegram:</strong> ${user.assignedTelegram || 'Default'}</p>
        </div>`,
        icon: 'info',
        confirmButtonColor: '#ffd700'
    });
};

window.addFunds = async function(userId) {
    const { value: amount } = await Swal.fire({
        title: 'Add Funds',
        input: 'number',
        inputLabel: 'Amount in USDT',
        inputPlaceholder: '0.00',
        showCancelButton: true,
        confirmButtonColor: '#ffd700'
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
        title: 'Subtract Funds',
        input: 'number',
        inputLabel: 'Amount to subtract',
        inputPlaceholder: '0.00',
        showCancelButton: true,
        confirmButtonColor: '#ffd700'
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
        title: 'Freeze Amount',
        input: 'number',
        inputLabel: `Available to freeze: ${available.toFixed(2)} USDT`,
        inputPlaceholder: '0.00',
        showCancelButton: true,
        confirmButtonColor: '#ffd700'
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
        title: 'Unfreeze Amount',
        input: 'number',
        inputLabel: `Currently frozen: ${currentFrozen.toFixed(2)} USDT (0 = all)`,
        inputPlaceholder: '0',
        showCancelButton: true,
        confirmButtonColor: '#ffd700'
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
        html: `<input id="swalWhatsapp" class="swal2-input" placeholder="WhatsApp Number" value="${user.assignedWhatsapp || ''}">
               <input id="swalTelegram" class="swal2-input" placeholder="Telegram Username" value="${user.assignedTelegram || ''}">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#ffd700',
        preConfirm: () => {
            return {
                whatsapp: document.getElementById('swalWhatsapp').value,
                telegram: document.getElementById('swalTelegram').value
            };
        }
    });
    
    if (formValues) {
        await database.ref('users/' + userId).update({
            assignedWhatsapp: formValues.whatsapp,
            assignedTelegram: formValues.telegram
        });
        Swal.fire('Success', 'Customer service assigned!', 'success');
        loadUsersTable();
    }
};

async function loadTaskManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="addTaskBtn">+ Add New Task</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Task ID</th><th>Product Name</th><th>Price</th><th>Profit</th><th>Special</th><th>Images</th><th>Actions</th></tr></thead>
        <tbody id="tasksTableBody"><tr><td colspan="7">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    document.getElementById('addTaskBtn').addEventListener('click', addNewTask);
    await loadTasksTable();
}

async function loadTasksTable() {
    const tbody = document.getElementById('tasksTableBody');
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
        tbody.innerHTML = html || '<tr><td colspan="7">No tasks found<\/td><\/tr>';
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
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ffd700',
        width: '650px',
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
    const result = await Swal.fire({ title: 'Delete Task?', icon: 'warning', showCancelButton: true });
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
               <label style="display:flex; align-items:center; gap:10px; margin:10px 0;"><input type="checkbox" id="isSpecial"> <span style="color:#ffd700;">🔥 Special Task</span></label>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#ffd700',
        width: '550px',
        preConfirm: () => {
            return {
                taskId: document.getElementById('taskId').value,
                name: document.getElementById('productName').value,
                price: document.getElementById('price').value,
                commission: document.getElementById('commission').value,
                availableFrom: document.getElementById('availableFrom').value,
                isSpecial: document.getElementById('isSpecial').checked
            };
        }
    });
    
    if (formValues && formValues.name) {
        const newTask = {
            taskId: formValues.taskId || 'TSK' + Date.now(),
            productName: formValues.name,
            price: formValues.price || '0',
            commission: formValues.commission || '0',
            availableFrom: formValues.availableFrom || null,
            isSpecial: formValues.isSpecial || false,
            createdAt: new Date().toISOString()
        };
        
        await database.ref('tasks/' + newTask.taskId).set(newTask);
        Swal.fire('Success', 'Task created!', 'success');
        loadTasksTable();
    }
}

async function loadWithdrawalRequests() {
    const content = document.getElementById('adminContent');
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
                    <td>${new Date(w.requestDate).toLocaleString()}<\/td>
                    <td><button class="approve-btn" onclick="approveWithdrawal('${id}')">Approve<\/button><button class="reject-btn" onclick="rejectWithdrawal('${id}')">Reject<\/button><\/td>
                <\/tr>`;
            } else {
                history += `<tr>
                    <td>${w.id}<\/td>
                    <td>${w.username}<\/td>
                    <td>${w.amount} USDT<\/td>
                    <td>${w.status}<\/td>
                    <td>${new Date(w.requestDate).toLocaleString()}<\/td>
                <\/tr>`;
            }
        }
        content.innerHTML = `<h3 style="color:#ffd700;">💰 Pending Withdrawals</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>${pending || '<td><td colspan="5">None<\/td><\/tr>'}<\/tbody><\/table><\/div>
        <h3 style="color:#ffd700; margin-top:30px;">📜 Withdrawal History</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${history || '<td><td colspan="5">None<\/td><\/tr>'}<\/tbody><\/table><\/div>`;
    } catch(e) { console.error(e); }
}

window.approveWithdrawal = async function(id) {
    await database.ref('withdrawals/' + id).update({ status: 'confirmed', processedDate: new Date().toISOString() });
    Swal.fire('Approved', 'Withdrawal approved', 'success');
    loadWithdrawalRequests();
    loadDashboardStats();
};

window.rejectWithdrawal = async function(id) {
    const snap = await database.ref('withdrawals/' + id).once('value');
    const w = snap.val();
    const userSnap = await database.ref('users/' + w.userId).once('value');
    const user = userSnap.val();
    await database.ref('users/' + w.userId).update({ balance: (parseFloat(user.balance) + parseFloat(w.amount)).toFixed(2) });
    await database.ref('withdrawals/' + id).update({ status: 'rejected', processedDate: new Date().toISOString() });
    Swal.fire('Rejected', 'Withdrawal rejected. Funds returned.', 'info');
    loadWithdrawalRequests();
    loadDashboardStats();
};

async function loadDepositRecords() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody id="depositsTableBody"><tr><td colspan="4">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
    await loadDepositsTable();
}

async function loadDepositsTable() {
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
        document.getElementById('depositsTableBody').innerHTML = html || '<td><td colspan="4">No deposits<\/td><\/tr>';
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
    const termsSnap = await database.ref('settings/terms').once('value');
    const noticeSnap = await database.ref('settings/taskNotice').once('value');
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>📋 Terms & Conditions</label><textarea id="termsEditor" rows="8" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${termsSnap.val() || ''}</textarea><button class="save-btn" id="saveTermsBtn">Save Terms</button></div>
        <div class="form-group" style="margin-top:20px;"><label>📝 Task Notice</label><textarea id="noticeEditor" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${noticeSnap.val() || ''}</textarea><button class="save-btn" id="saveNoticeBtn">Save Notice</button></div>
        <div class="form-group" style="margin-top:20px;"><label>📜 Certificate Image</label><input type="file" id="certImage" accept="image/*"><button class="save-btn" id="saveCertBtn" style="margin-top:10px;">Upload Certificate</button></div>
        <div class="form-group" style="margin-top:20px;"><label>📄 About Us PDF URL</label><input type="text" id="aboutPDF" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;"><button class="save-btn" id="saveAboutBtn">Save About PDF</button></div>
        <div class="form-group" style="margin-top:20px;"><label>❓ FAQS PDF URL</label><input type="text" id="faqsPDF" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;"><button class="save-btn" id="saveFaqsBtn">Save FAQS PDF</button></div>`;
    
    document.getElementById('saveTermsBtn').addEventListener('click', async () => {
        await database.ref('settings/terms').set(document.getElementById('termsEditor').value);
        Swal.fire('Saved', 'Terms saved!', 'success');
    });
    document.getElementById('saveNoticeBtn').addEventListener('click', async () => {
        await database.ref('settings/taskNotice').set(document.getElementById('noticeEditor').value);
        Swal.fire('Saved', 'Notice saved!', 'success');
    });
    document.getElementById('saveCertBtn').addEventListener('click', async () => {
        const file = document.getElementById('certImage').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                await database.ref('settings/certificateImage').set(e.target.result);
                Swal.fire('Saved', 'Certificate uploaded!', 'success');
            };
            reader.readAsDataURL(file);
        } else { Swal.fire('Error', 'Select a file', 'error'); }
    });
    document.getElementById('saveAboutBtn').addEventListener('click', async () => {
        await database.ref('settings/aboutPDF').set(document.getElementById('aboutPDF').value);
        Swal.fire('Saved', 'About PDF saved!', 'success');
    });
    document.getElementById('saveFaqsBtn').addEventListener('click', async () => {
        await database.ref('settings/faqsPDF').set(document.getElementById('faqsPDF').value);
        Swal.fire('Saved', 'FAQS saved!', 'success');
    });
}

function loadVIPSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div class="form-group"><label>VIP 1 Commission (%)</label><input type="number" id="vip1" value="0.5" step="0.1"></div>
        <div class="form-group"><label>VIP 2 Commission (%)</label><input type="number" id="vip2" value="1" step="0.1"></div>
        <div class="form-group"><label>VIP 3 Commission (%)</label><input type="number" id="vip3" value="1.5" step="0.1"></div>
        <div class="form-group"><label>VIP 4 Commission (%)</label><input type="number" id="vip4" value="2" step="0.1"></div>
        <div class="form-group"><label>Orders Per Round</label><input type="number" id="orders" value="40"></div>
        <button class="save-btn" id="saveVipBtn">Save Settings</button>`;
    document.getElementById('saveVipBtn').addEventListener('click', () => Swal.fire('Saved', 'VIP settings saved!', 'success'));
}

async function loadServiceSettings() {
    const snap = await database.ref('settings/serviceContacts').once('value');
    const contacts = snap.val() || { whatsapp: '+1 234 567 8900', telegram: '@ClutchSupport' };
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div class="form-group"><label>📱 WhatsApp Number</label><input type="text" id="whatsapp" value="${contacts.whatsapp}"></div>
        <div class="form-group"><label>✈️ Telegram Username</label><input type="text" id="telegram" value="${contacts.telegram}"></div>
        <button class="save-btn" id="saveServiceBtn">Save Settings</button>`;
    document.getElementById('saveServiceBtn').addEventListener('click', async () => {
        await database.ref('settings/serviceContacts').set({
            whatsapp: document.getElementById('whatsapp').value,
            telegram: document.getElementById('telegram').value
        });
        Swal.fire('Saved', 'Service settings saved!', 'success');
    });
}

async function loadWalletSettings() {
    const snap = await database.ref('settings/merchantWallet').once('value');
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div class="form-group"><label>🏦 Merchant Wallet Address</label><textarea id="merchantAddress" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${snap.val() || ''}</textarea>
        <button class="save-btn" id="saveWalletBtn">Save Address</button>`;
    document.getElementById('saveWalletBtn').addEventListener('click', async () => {
        await database.ref('settings/merchantWallet').set(document.getElementById('merchantAddress').value);
        Swal.fire('Saved', 'Wallet saved!', 'success');
    });
}

async function loadInvitationCodes() {
    const content = document.getElementById('adminContent');
    const today = new Date().toISOString().split('T')[0];
    const codesSnap = await database.ref('invitationCodes').once('value');
    const codes = codesSnap.val() || {};
    
    let todaysCode = null;
    let historyHtml = '';
    for (let id in codes) {
        const code = codes[id];
        if (code.date === today && code.active === true) todaysCode = code;
        if (adminType === 'master' || code.adminId === adminId) {
            historyHtml += `<tr>
                <td>${code.date}<\/td>
                <td style="color:#ffd700;">${code.code}<\/td>
                <td>${code.adminName}<\/td>
                <td>${code.active ? '✅ Active' : '❌ Expired'}<\/td>
                <td>${code.active ? `<button class="delete-btn" onclick="deactivateCode('${id}')">Deactivate<\/button>` : '-'}<\/td>
            <\/tr>`;
        }
    }
    
    content.innerHTML = `<div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">
            <h3 style="color:#ffd700;">📋 Today's Invitation Code</h3>
            <p style="font-size:36px; font-weight:bold; color:#ffd700; margin:15px 0;">${todaysCode ? todaysCode.code : 'No code'}</p>
            <button class="save-btn" id="generateCodeBtn">🔑 Generate New Code</button>
        </div>
        <h3 style="color:#ffd700;">📜 Code History</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${historyHtml || '</td><td colspan="5">No codes found<\/td><\/tr>'}<\/tbody><\/table><\/div>`;
    
    document.getElementById('generateCodeBtn').addEventListener('click', generateInvitationCode);
}

window.deactivateCode = async function(id) {
    await database.ref('invitationCodes/' + id).update({ active: false });
    Swal.fire('Deactivated', 'Code deactivated', 'success');
    loadInvitationCodes();
};

async function generateInvitationCode() {
    const adminId = localStorage.getItem('adminId') || 'master';
    const adminName = localStorage.getItem('adminUsername') || 'master';
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    const today = new Date().toISOString().split('T')[0];
    
    await database.ref('invitationCodes/CODE_' + Date.now()).set({
        code: code, date: today, adminId: adminId, adminName: adminName, active: true
    });
    Swal.fire('Code Generated', `Code: ${code}\nValid until midnight today.`, 'success');
    loadInvitationCodes();
}

async function loadTradeConfirmations() {
    const content = document.getElementById('adminContent');
    const tradesSnap = await database.ref('trades').once('value');
    const trades = tradesSnap.val() || {};
    let html = '';
    for (let id in trades) {
        const t = trades[id];
        if (t.status === 'pending') {
            const suggestedProfit = (t.amount * 0.02).toFixed(2);
            html += `</tr>
                <td>${t.id}</td>
                <td>${t.username}</td>
                <td>${t.symbol}</td>
                <td>${t.amount} USDT</div>
                <td>${t.entryPrice}</td>
                <td><button class="approve-btn" onclick="confirmTrade('${id}', ${suggestedProfit})">Confirm</button>
                <button class="reject-btn" onclick="rejectTrade('${id}', ${t.amount})">Reject</button></td>
            </tr>`;
        }
    }
    content.innerHTML = `<h3 style="color:#ffd700;">📈 Pending Trades</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Symbol</th><th>Amount</th><th>Entry Price</th><th>Actions</th></tr></thead>
        <tbody>${html || '<tr><td colspan="6">No pending trades</td><\/tr>'}<\/tbody><\/table><\/div>`;
}

window.confirmTrade = async function(id, suggestedProfit) {
    const snap = await database.ref('trades/' + id).once('value');
    const trade = snap.val();
    
    const { value: profitAmount } = await Swal.fire({
        title: 'Confirm Trade',
        text: `User: ${trade.username}\nSymbol: ${trade.symbol}\nAmount: ${trade.amount} USDT`,
        input: 'number',
        inputLabel: 'Profit to add (USDT)',
        inputValue: suggestedProfit,
        showCancelButton: true,
        confirmButtonText: 'Confirm & Add Profit',
        confirmButtonColor: '#ffd700'
    });
    
    if (profitAmount === undefined) return;
    
    if (profitAmount === null || isNaN(profitAmount) || profitAmount < 0) {
        Swal.fire('Error', 'Please enter a valid profit amount', 'error');
        return;
    }
    
    const userSnap = await database.ref('users/' + trade.userId).once('value');
    const user = userSnap.val();
    const newBalance = (parseFloat(user.balance || 0) + parseFloat(profitAmount)).toFixed(2);
    
    await database.ref('users/' + trade.userId).update({ balance: newBalance });
    await database.ref('trades/' + id).update({ 
        status: 'confirmed', 
        profit: profitAmount,
        confirmedAt: Date.now()
    });
    
    Swal.fire('Confirmed', `Added ${profitAmount} USDT to user balance. New balance: ${newBalance} USDT`, 'success');
    loadTradeConfirmations();
    loadDashboardStats();
};

window.rejectTrade = async function(id, amount) {
    const snap = await database.ref('trades/' + id).once('value');
    const trade = snap.val();
    const userSnap = await database.ref('users/' + trade.userId).once('value');
    const user = userSnap.val();
    await database.ref('users/' + trade.userId).update({ balance: (parseFloat(user.balance) + parseFloat(amount)).toFixed(2) });
    await database.ref('trades/' + id).update({ status: 'rejected', rejectedAt: Date.now() });
    Swal.fire('Rejected', `Trade rejected. ${amount} USDT returned to user.`, 'info');
    loadTradeConfirmations();
    loadDashboardStats();
};

// ============ ADMIN MANAGEMENT (Master Only) ============

function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center; padding:50px; color:#ff6666;">⛔ Access Denied. Only Master Admin can manage admins.</div>';
        return;
    }
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <div class="table-container"><table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody id="adminsTableBody"></td><td colspan="4">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    loadAdminsTable();
}

async function loadAdminsTable() {
    const snap = await database.ref('admins/sub').once('value');
    const admins = snap.val() || {};
    let html = '';
    for (let id in admins) {
        html += `<tr>
            <td>${admins[id].username}</td>
            <td>${admins[id].email}</td>
            <td>${admins[id].created ? new Date(admins[id].created).toLocaleDateString() : 'Unknown'}</td>
            <td>
                <button class="edit-btn" onclick="resetAdminPass('${id}')">Reset Password</button>
                <button class="delete-btn" onclick="deleteAdmin('${id}')">Delete</button>
            </td>
        </tr>`;
    }
    document.getElementById('adminsTableBody').innerHTML = html || '<tr><td colspan="4">No sub admins</td><\/tr>';
}

window.resetAdminPass = async function(id) {
    const { value: newPass } = await Swal.fire({ title: 'Reset Password', input: 'password', inputLabel: 'New password (min 4 characters)', showCancelButton: true });
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
        username: username,
        email: email,
        password: password,
        role: 'sub',
        created: new Date().toISOString()
    });
    Swal.fire('Success', `Sub admin created!\nUsername: ${username}\nPassword: ${password}`, 'success');
    loadAdminsTable();
}