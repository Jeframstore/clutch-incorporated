// Admin Dashboard - Original Working Version

let adminType = '';
let currentUserData = [];
let currentTasks = [];

document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = localStorage.getItem('isAdminLoggedIn');
    adminType = localStorage.getItem('adminType') || 'sub';
    
    if (!isAdmin || isAdmin !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    loadSidebar();
    loadDashboard();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    const logoutMobile = document.getElementById('logoutMobileBtn');
    if (logoutMobile) logoutMobile.addEventListener('click', logout);
});

function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminType');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminId');
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
    `;
    
    if (adminType === 'master') {
        menuHtml += `<button class="nav-item" data-page="admins">👑 Admin Management</button>`;
    }
    
    sidebarNav.innerHTML = menuHtml;
    
    document.querySelectorAll('.nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(function(b) {
                b.classList.remove('active');
            });
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
            else if (page === 'admins' && adminType === 'master') loadAdminManagement();
        });
    });
}

function loadDashboard() {
    const content = document.getElementById('adminContent');
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    let withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    let totalBalance = 0;
    users.forEach(function(user) {
        totalBalance += parseFloat(user.balance || 0);
    });
    
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>Total Users</h3><div class="stat-value">${users.length}</div></div>
            <div class="stat-card"><h3>Total Balance</h3><div class="stat-value">${totalBalance.toFixed(2)} USDT</div></div>
            <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value">${withdrawals.length}</div></div>
            <div class="stat-card"><h3>Total Tasks</h3><div class="stat-value">${currentTasks.length || 5}</div></div>
        </div>
        <div style="text-align: center; padding: 40px; color: #888;">
            <p>Welcome to Admin Panel</p>
            <p>Admin Type: ${adminType === 'master' ? 'Master Admin (Full Access)' : 'Sub Admin'}</p>
        </div>
    `;
}

function loadUserManagement() {
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    currentUserData = users;
    
    const content = document.getElementById('adminContent');
    let usersHtml = `
        <div style="margin-bottom:20px;"><button class="save-btn" id="addUserBtn">+ Add New User</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Invite Code</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
    
    users.forEach(function(user) {
        usersHtml += `<tr><td>${user.id}</td><td>${user.username}</td><td>${user.email}</td><td>${user.balance} USDT</td><td style="color:#ffd700;">${user.inviteCode}</td><td>${user.status}</td>
        <td><button class="edit-btn" onclick="editUserBalance('${user.id}')">Edit Balance</button>
        <button class="edit-btn" onclick="viewUserDetails('${user.id}')">View</button></td></tr>`;
    });
    
    usersHtml += `</tbody></table></div>`;
    content.innerHTML = usersHtml;
    
    window.editUserBalance = editUserBalance;
    window.viewUserDetails = viewUserDetails;
    document.getElementById('addUserBtn').addEventListener('click', addNewUser);
}

function editUserBalance(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    const amount = prompt('Enter new balance for ' + user.username + ':', user.balance);
    if (amount && !isNaN(amount)) {
        user.balance = parseFloat(amount).toFixed(2);
        localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
        localStorage.setItem('walletBalance', user.balance);
        loadUserManagement();
        alert('Balance updated!');
    }
}

function viewUserDetails(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    alert(`Username: ${user.username}\nEmail: ${user.email}\nBalance: ${user.balance} USDT\nInvite Code: ${user.inviteCode}\nStatus: ${user.status}`);
}

function addNewUser() {
    const username = prompt('Enter username:');
    if (!username) return;
    const email = prompt('Enter email:');
    if (!email) return;
    const password = prompt('Enter password:');
    if (!password) return;
    
    const newUser = {
        id: 'UID' + Date.now(),
        username: username,
        email: email,
        password: password,
        balance: '0.00',
        commission: '0.00',
        inviteCode: 'MANUAL',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
    };
    
    currentUserData.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
    loadUserManagement();
    alert('User added!');
}

function loadTaskManagement() {
    let tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
    currentTasks = tasks;
    
    const content = document.getElementById('adminContent');
    let tasksHtml = `
        <div style="margin-bottom:20px;"><button class="save-btn" id="addTaskBtn">+ Add Task</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Task ID</th><th>Product</th><th>Price</th><th>Profit</th><th>Actions</th></tr></thead><tbody>`;
    
    tasks.forEach(function(task) {
        tasksHtml += `<tr><td>${task.taskId}</td><td>${task.productName}</td><td>$${task.price}</td><td>+${task.profit} USDT</td>
        <td><button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button></td></tr>`;
    });
    
    tasksHtml += `</tbody></table></div>`;
    content.innerHTML = tasksHtml;
    
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    document.getElementById('addTaskBtn').addEventListener('click', addNewTask);
}

function editTask(taskId) {
    const task = currentTasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    const name = prompt('Product name:', task.productName);
    const price = prompt('Price:', task.price);
    const profit = prompt('Profit:', task.profit);
    if (name) task.productName = name;
    if (price) task.price = price;
    if (profit) task.profit = profit;
    localStorage.setItem('allTasks', JSON.stringify(currentTasks));
    loadTaskManagement();
    alert('Task updated!');
}

function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        currentTasks = currentTasks.filter(function(t) { return t.id !== taskId; });
        localStorage.setItem('allTasks', JSON.stringify(currentTasks));
        loadTaskManagement();
        alert('Task deleted!');
    }
}

function addNewTask() {
    const newTask = {
        id: 'TSK' + Date.now(),
        taskId: 'TSK' + Date.now(),
        productName: 'New Product',
        price: '0.00',
        profit: '0.10'
    };
    currentTasks.push(newTask);
    localStorage.setItem('allTasks', JSON.stringify(currentTasks));
    loadTaskManagement();
    alert('Task added! Click Edit to configure.');
}

function loadWithdrawalRequests() {
    let withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    let withdrawalRecords = JSON.parse(localStorage.getItem('withdrawalRecords') || '[]');
    
    const content = document.getElementById('adminContent');
    let pendingHtml = '';
    let historyHtml = '';
    
    withdrawals.forEach(function(w) {
        pendingHtml += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${new Date(w.requestDate).toLocaleString()}</td>
        <td><button class="approve-btn" onclick="approveWithdrawal('${w.id}')">Approve</button>
        <button class="reject-btn" onclick="rejectWithdrawal('${w.id}')">Reject</button></td></tr>`;
    });
    
    withdrawalRecords.forEach(function(w) {
        historyHtml += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${w.status}</td><td>${new Date(w.requestDate).toLocaleString()}</td></tr>`;
    });
    
    content.innerHTML = `
        <h3 style="color:#ffd700;">Pending Withdrawals</h3>
        <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>${pendingHtml || '<tr><td colspan="5">None</td></tr>'}</tbody></table>
        <h3 style="color:#ffd700; margin-top:30px;">History</h3>
        <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${historyHtml || '<tr><td colspan="5">None</td></tr>'}</tbody></table>
    `;
    
    window.approveWithdrawal = approveWithdrawal;
    window.rejectWithdrawal = rejectWithdrawal;
}

function approveWithdrawal(id) {
    let withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    let withdrawalRecords = JSON.parse(localStorage.getItem('withdrawalRecords') || '[]');
    const withdrawal = withdrawals.find(function(w) { return w.id === id; });
    if (withdrawal) {
        withdrawal.status = 'confirmed';
        withdrawalRecords.push(withdrawal);
        withdrawals = withdrawals.filter(function(w) { return w.id !== id; });
        localStorage.setItem('pendingWithdrawals', JSON.stringify(withdrawals));
        localStorage.setItem('withdrawalRecords', JSON.stringify(withdrawalRecords));
        alert('Withdrawal approved!');
        loadWithdrawalRequests();
    }
}

function rejectWithdrawal(id) {
    let withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    withdrawals = withdrawals.filter(function(w) { return w.id !== id; });
    localStorage.setItem('pendingWithdrawals', JSON.stringify(withdrawals));
    alert('Withdrawal rejected!');
    loadWithdrawalRequests();
}

function loadDepositRecords() {
    let deposits = JSON.parse(localStorage.getItem('depositRecords') || '[]');
    const content = document.getElementById('adminContent');
    let html = '';
    deposits.forEach(function(d) {
        html += `<tr><td>${d.id}</td><td>${d.username}</td><td>${d.amount} USDT</td><td>${d.status}</td><td>${d.date}</td></tr>`;
    });
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button></div>
        <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${html || '<tr><td colspan="5">No deposits</td></tr>'}</tbody></table>`;
    document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
}

function manualDeposit() {
    const username = prompt('Username:');
    if (!username) return;
    const amount = prompt('Amount:');
    if (!amount || isNaN(amount)) return;
    
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(function(u) { return u.username === username; });
    if (user) {
        user.balance = (parseFloat(user.balance) + parseFloat(amount)).toFixed(2);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        let deposits = JSON.parse(localStorage.getItem('depositRecords') || '[]');
        deposits.unshift({ id: 'DEP' + Date.now(), username: username, amount: amount, status: 'confirmed', date: new Date().toLocaleString() });
        localStorage.setItem('depositRecords', JSON.stringify(deposits));
        alert(`Deposited ${amount} USDT to ${username}`);
        loadDepositRecords();
        loadDashboard();
    } else {
        alert('User not found');
    }
}

function loadContentManagement() {
    let terms = localStorage.getItem('termsContent') || '';
    let notice = localStorage.getItem('taskNotice') || 'Online Support Hours: 10:00 - 22:00';
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>Terms & Conditions</label><textarea id="termsEditor" rows="8" style="width:100%; background:#333; color:white; padding:10px;">${terms.replace(/</g, '&lt;')}</textarea><button class="save-btn" id="saveTermsBtn">Save Terms</button></div>
        <div class="form-group" style="margin-top:20px;"><label>Task Notice</label><textarea id="noticeEditor" rows="3" style="width:100%; background:#333; color:white; padding:10px;">${notice}</textarea><button class="save-btn" id="saveNoticeBtn">Save Notice</button></div>
    `;
    document.getElementById('saveTermsBtn').addEventListener('click', function() {
        localStorage.setItem('termsContent', document.getElementById('termsEditor').value);
        alert('Terms saved!');
    });
    document.getElementById('saveNoticeBtn').addEventListener('click', function() {
        localStorage.setItem('taskNotice', document.getElementById('noticeEditor').value);
        alert('Notice saved!');
    });
}

function loadVIPSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>VIP 1 Commission (%)</label><input type="number" id="vip1" value="0.5"></div>
        <div class="form-group"><label>VIP 2 Commission (%)</label><input type="number" id="vip2" value="1"></div>
        <div class="form-group"><label>VIP 3 Commission (%)</label><input type="number" id="vip3" value="1.5"></div>
        <div class="form-group"><label>VIP 4 Commission (%)</label><input type="number" id="vip4" value="2"></div>
        <button class="save-btn" id="saveVipBtn">Save</button>
    `;
    document.getElementById('saveVipBtn').addEventListener('click', function() { alert('VIP settings saved!'); });
}

function loadServiceSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>WhatsApp</label><input type="text" id="whatsapp" value="${localStorage.getItem('depositWhatsapp') || '+1 234 567 8900'}"></div>
        <div class="form-group"><label>Telegram</label><input type="text" id="telegram" value="${localStorage.getItem('depositTelegram') || '@ClutchSupport'}"></div>
        <button class="save-btn" id="saveServiceBtn">Save</button>
    `;
    document.getElementById('saveServiceBtn').addEventListener('click', function() {
        localStorage.setItem('depositWhatsapp', document.getElementById('whatsapp').value);
        localStorage.setItem('depositTelegram', document.getElementById('telegram').value);
        alert('Service settings saved!');
    });
}

function loadWalletSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>Merchant Wallet Address</label><textarea id="merchantAddress" rows="3" style="width:100%; background:#333; color:white; padding:10px;">${localStorage.getItem('merchantWalletAddress') || ''}</textarea>
        <button class="save-btn" id="saveWalletBtn">Save</button></div>
    `;
    document.getElementById('saveWalletBtn').addEventListener('click', function() {
        localStorage.setItem('merchantWalletAddress', document.getElementById('merchantAddress').value);
        alert('Wallet address saved!');
    });
}

function loadInvitationCodes() {
    const today = new Date().toISOString().split('T')[0];
    let codes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    let todaysCode = codes.find(function(c) { return c.date === today && c.active === true; });
    let historyHtml = '';
    codes.forEach(function(code) {
        historyHtml += `<tr><td>${code.date}</td><td style="color:#ffd700;">${code.code}</td><td>${code.adminName}</td><td>${code.active ? 'Active' : 'Expired'}</td>
        <td>${code.active ? `<button class="delete-btn" onclick="deactivateCode('${code.id}')">Deactivate</button>` : '-'}</td></tr>`;
    });
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">
            <h3 style="color:#ffd700;">Today's Code</h3>
            <p style="font-size:36px; font-weight:bold; color:#ffd700;">${todaysCode ? todaysCode.code : 'No code'}</p>
            <button class="save-btn" id="generateCodeBtn">Generate New Code</button>
        </div>
        <table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead><tbody>${historyHtml || '<tr><td colspan="5">No codes</td></tr>'}</tbody></table>
    `;
    document.getElementById('generateCodeBtn').addEventListener('click', generateInvitationCode);
    window.deactivateCode = deactivateCode;
}

function generateInvitationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    const today = new Date().toISOString().split('T')[0];
    let codes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    const existing = codes.find(function(c) { return c.date === today; });
    if (existing) {
        alert('Code already exists for today: ' + existing.code);
        return;
    }
    const newCode = {
        id: 'CODE' + Date.now(),
        code: code,
        date: today,
        adminId: 'master',
        adminName: 'master',
        active: true
    };
    codes.push(newCode);
    localStorage.setItem('dailyInvitationCodes', JSON.stringify(codes));
    alert(`Code generated: ${code}\nValid until midnight.`);
    loadInvitationCodes();
}

function deactivateCode(codeId) {
    let codes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    codes = codes.map(function(c) {
        if (c.id === codeId) c.active = false;
        return c;
    });
    localStorage.setItem('dailyInvitationCodes', JSON.stringify(codes));
    alert('Code deactivated');
    loadInvitationCodes();
}

function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center; padding:50px; color:#ff6666;">Access Denied</div>';
        return;
    }
    
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    let html = '';
    subAdmins.forEach(function(admin) {
        html += `<tr><td>${admin.username}</td><td>${admin.email}</td><td>${admin.created ? new Date(admin.created).toLocaleDateString() : 'Unknown'}</td>
        <td><button class="edit-btn" onclick="resetAdminPass('${admin.id}')">Reset Password</button>
        <button class="delete-btn" onclick="deleteAdmin('${admin.id}')">Delete</button></tr>`;
    });
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead><tbody>${html || '<td><td colspan="4">No sub admins</td></tr>'}</tbody></table>`;
    
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    window.resetAdminPass = resetAdminPass;
    window.deleteAdmin = deleteAdmin;
}

function createSubAdmin() {
    const username = prompt('Username:');
    if (!username) return;
    const email = prompt('Email:');
    if (!email) return;
    const password = prompt('Password:');
    if (!password) return;
    
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const newAdmin = {
        id: 'ADMIN' + Date.now(),
        username: username,
        email: email,
        password: password,
        created: new Date().toISOString()
    };
    subAdmins.push(newAdmin);
    localStorage.setItem('adminUsers', JSON.stringify(subAdmins));
    alert(`Sub admin created! Username: ${username}, Password: ${password}`);
    loadAdminManagement();
}

function resetAdminPass(adminId) {
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const admin = subAdmins.find(function(a) { return a.id === adminId; });
    if (!admin) return;
    const newPass = prompt('New password for ' + admin.username + ':');
    if (newPass) {
        admin.password = newPass;
        localStorage.setItem('adminUsers', JSON.stringify(subAdmins));
        alert('Password reset!');
        loadAdminManagement();
    }
}

function deleteAdmin(adminId) {
    if (!confirm('Delete this admin?')) return;
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    subAdmins = subAdmins.filter(function(a) { return a.id !== adminId; });
    localStorage.setItem('adminUsers', JSON.stringify(subAdmins));
    alert('Admin deleted');
    loadAdminManagement();
}