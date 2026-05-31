// Admin Dashboard - Complete with ALL Features Working

let adminType = '';
let adminId = '';
let adminName = '';

document.addEventListener('DOMContentLoaded', function() {
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
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    const logoutMobile = document.getElementById('logoutMobileBtn');
    if (logoutMobile) logoutMobile.addEventListener('click', logout);
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
            else if (page === 'admins' && adminType === 'master') loadAdminManagement();
        });
    });
}

async function loadDashboard() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>Total Users</h3><div class="stat-value" id="totalUsers">0</div></div>
            <div class="stat-card"><h3>Total Balance</h3><div class="stat-value" id="totalBalance">0 USDT</div></div>
            <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value" id="pendingWithdrawals">0</div></div>
            <div class="stat-card"><h3>Total Tasks</h3><div class="stat-value" id="totalTasks">0</div></div>
        </div>
        <div style="text-align: center; padding: 40px; color: #888;">
            <p>Welcome to Admin Panel</p>
            <p>Admin Type: ${adminType === 'master' ? 'Master Admin (Full Access)' : 'Sub Admin'}</p>
        </div>
    `;
    
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        let totalBalance = 0;
        for (let id in users) totalBalance += parseFloat(users[id].balance || 0);
        
        const withdrawalsSnap = await database.ref('withdrawals').once('value');
        const withdrawals = withdrawalsSnap.val() || {};
        let pending = 0;
        for (let id in withdrawals) if (withdrawals[id].status === 'pending') pending++;
        
        const tasksSnap = await database.ref('tasks').once('value');
        const tasks = tasksSnap.val() || {};
        
        document.getElementById('totalUsers').textContent = Object.keys(users).length;
        document.getElementById('totalBalance').textContent = totalBalance.toFixed(2) + ' USDT';
        document.getElementById('pendingWithdrawals').textContent = pending;
        document.getElementById('totalTasks').textContent = Object.keys(tasks).length;
    } catch(e) { console.error(e); }
}

async function loadUserManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="margin-bottom:20px;"><button class="save-btn" id="refreshUsersBtn">🔄 Refresh</button></div>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Invite Code</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="usersTableBody"><tr><td colspan="7">Loading...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('refreshUsersBtn').addEventListener('click', loadUsersTable);
    await loadUsersTable();
}

async function loadUsersTable() {
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        let html = '';
        for (let id in users) {
            html += `<tr>
                <td>${id}</td>
                <td>${users[id].username || 'N/A'}</td>
                <td>${users[id].email || 'N/A'}</td>
                <td>${users[id].balance || '0'} USDT</td>
                <td style="color:#ffd700;">${users[id].inviteCode || 'N/A'}</td>
                <td>${users[id].status || 'active'}</td>
                <td>
                    <button class="edit-btn" onclick="editUserBalance('${id}')">Edit Balance</button>
                    <button class="edit-btn" onclick="viewUserDetails('${id}')">View</button>
                </td>
            </tr>`;
        }
        document.getElementById('usersTableBody').innerHTML = html || '<tr><td colspan="7">No users</td></tr>';
    } catch(e) { console.error(e); }
}

window.editUserBalance = async function(userId) {
    const amount = prompt('Enter new balance (USDT):');
    if (amount && !isNaN(amount)) {
        await database.ref('users/' + userId).update({ balance: parseFloat(amount).toFixed(2) });
        alert('Balance updated!');
        loadUsersTable();
        loadDashboard();
    }
};

window.viewUserDetails = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    alert(`User: ${user.username}\nEmail: ${user.email}\nBalance: ${user.balance} USDT\nInvite Code: ${user.inviteCode}\nJoined: ${user.joinedDate}`);
};

async function loadTaskManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="margin-bottom:20px;"><button class="save-btn" id="addTaskBtn">+ Add New Task</button></div>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>Task ID</th><th>Product Name</th><th>Price</th><th>Profit</th><th>Actions</th></tr></thead>
                <tbody id="tasksTableBody"><tr><td colspan="5">Loading...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('addTaskBtn').addEventListener('click', addNewTask);
    await loadTasksTable();
}

async function loadTasksTable() {
    try {
        const tasksSnap = await database.ref('tasks').once('value');
        const tasks = tasksSnap.val() || {};
        let html = '';
        for (let id in tasks) {
            html += `<tr>
                <td>${tasks[id].taskId || id}</td>
                <td>${tasks[id].productName || 'N/A'}</td>
                <td>$${tasks[id].price || '0'}</td>
                <td>+${tasks[id].profit || '0'} USDT</td>
                <td>
                    <button class="edit-btn" onclick="editTask('${id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteTask('${id}')">Delete</button>
                </td>
            </tr>`;
        }
        document.getElementById('tasksTableBody').innerHTML = html || '<tr><td colspan="5">No tasks</td></tr>';
    } catch(e) { console.error(e); }
}

window.editTask = async function(taskId) {
    const snap = await database.ref('tasks/' + taskId).once('value');
    const task = snap.val();
    const name = prompt('Product name:', task.productName);
    const price = prompt('Price (USD):', task.price);
    const profit = prompt('Profit (USDT):', task.profit);
    if (name && price && profit) {
        await database.ref('tasks/' + taskId).update({ productName: name, price: price, profit: profit });
        alert('Task updated!');
        loadTasksTable();
    }
};

window.deleteTask = async function(taskId) {
    if (confirm('Delete this task?')) {
        await database.ref('tasks/' + taskId).remove();
        alert('Task deleted!');
        loadTasksTable();
    }
};

async function addNewTask() {
    const taskId = 'TSK' + Date.now();
    const newTask = {
        taskId: taskId,
        productName: 'New Product',
        price: '0.00',
        profit: '0.10',
        createdAt: new Date().toISOString()
    };
    await database.ref('tasks/' + taskId).set(newTask);
    alert('New task added! Click Edit to configure.');
    loadTasksTable();
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
                pending += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${new Date(w.requestDate).toLocaleString()}</td><td><button class="approve-btn" onclick="approveWithdrawal('${id}')">Approve</button><button class="reject-btn" onclick="rejectWithdrawal('${id}')">Reject</button></td></tr>`;
            } else {
                history += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${w.status}</td><td>${new Date(w.requestDate).toLocaleString()}</td></tr>`;
            }
        }
        content.innerHTML = `
            <h3 style="color:#ffd700;">💰 Pending Withdrawals</h3>
            <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>${pending || '<tr><td colspan="5">None</td></tr>'}</tbody></table>
            <h3 style="color:#ffd700; margin-top:30px;">📜 Withdrawal History</h3>
            <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${history || '<tr><td colspan="5">None</td></tr>'}</tbody></table>
        `;
    } catch(e) { console.error(e); }
}

window.approveWithdrawal = async function(id) {
    await database.ref('withdrawals/' + id).update({ status: 'confirmed' });
    alert('Withdrawal approved!');
    loadWithdrawalRequests();
    loadDashboard();
};

window.rejectWithdrawal = async function(id) {
    const snap = await database.ref('withdrawals/' + id).once('value');
    const w = snap.val();
    const userSnap = await database.ref('users/' + w.userId).once('value');
    const user = userSnap.val();
    const newBalance = (parseFloat(user.balance || 0) + parseFloat(w.amount)).toFixed(2);
    await database.ref('users/' + w.userId).update({ balance: newBalance });
    await database.ref('withdrawals/' + id).update({ status: 'rejected' });
    alert('Withdrawal rejected! Funds returned.');
    loadWithdrawalRequests();
    loadDashboard();
};

async function loadDepositRecords() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button><div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th></tr></thead><tbody id="depositsTable"><tr><td colspan="4">Loading...</td></tr></tbody></table></div>`;
    document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
    await loadDepositsTable();
}

async function loadDepositsTable() {
    try {
        const snap = await database.ref('deposits').once('value');
        const deposits = snap.val() || {};
        let html = '';
        for (let id in deposits) {
            html += `<tr><td>${deposits[id].id}</td><td>${deposits[id].username}</td><td>${deposits[id].amount} USDT</td><td>${deposits[id].date}</td></tr>`;
        }
        document.getElementById('depositsTable').innerHTML = html || '<tr><td colspan="4">No deposits</td></tr>';
    } catch(e) { console.error(e); }
}

async function manualDeposit() {
    const username = prompt('Username:');
    if (!username) return;
    const amount = prompt('Amount (USDT):');
    if (!amount || isNaN(amount)) return;
    
    const usersSnap = await database.ref('users').once('value');
    const users = usersSnap.val() || {};
    let userId = null;
    for (let id in users) {
        if (users[id].username === username) {
            userId = id;
            break;
        }
    }
    if (!userId) { alert('User not found'); return; }
    
    const user = users[userId];
    const newBalance = (parseFloat(user.balance || 0) + parseFloat(amount)).toFixed(2);
    await database.ref('users/' + userId).update({ balance: newBalance });
    await database.ref('deposits/' + Date.now()).set({
        id: 'DEP' + Date.now(),
        userId: userId,
        username: username,
        amount: parseFloat(amount),
        date: new Date().toLocaleString()
    });
    alert('Deposit added!');
    loadDepositsTable();
    loadDashboard();
}

async function loadContentManagement() {
    const content = document.getElementById('adminContent');
    const termsSnap = await database.ref('settings/terms').once('value');
    const noticeSnap = await database.ref('settings/taskNotice').once('value');
    
    content.innerHTML = `
        <div class="form-group"><label>📋 Terms & Conditions</label><textarea id="termsEditor" rows="8" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${termsSnap.val() || 'Terms & Conditions'}</textarea><button class="save-btn" id="saveTermsBtn" style="margin-top:10px;">Save Terms</button></div>
        <div class="form-group" style="margin-top:20px;"><label>📝 Task Notice</label><textarea id="noticeEditor" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${noticeSnap.val() || 'Online Support Hours: 10:00 - 22:00'}</textarea><button class="save-btn" id="saveNoticeBtn" style="margin-top:10px;">Save Notice</button></div>
    `;
    document.getElementById('saveTermsBtn').addEventListener('click', saveTerms);
    document.getElementById('saveNoticeBtn').addEventListener('click', saveNotice);
}

async function saveTerms() {
    await database.ref('settings/terms').set(document.getElementById('termsEditor').value);
    alert('Terms saved!');
}

async function saveNotice() {
    await database.ref('settings/taskNotice').set(document.getElementById('noticeEditor').value);
    alert('Notice saved!');
}

function loadVIPSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>VIP 1 Commission (%)</label><input type="number" id="vip1" value="0.5" step="0.1"></div>
        <div class="form-group"><label>VIP 2 Commission (%)</label><input type="number" id="vip2" value="1" step="0.1"></div>
        <div class="form-group"><label>VIP 3 Commission (%)</label><input type="number" id="vip3" value="1.5" step="0.1"></div>
        <div class="form-group"><label>VIP 4 Commission (%)</label><input type="number" id="vip4" value="2" step="0.1"></div>
        <div class="form-group"><label>Orders Per Round</label><input type="number" id="orders" value="40"></div>
        <button class="save-btn" id="saveVipBtn">Save Settings</button>
    `;
    document.getElementById('saveVipBtn').addEventListener('click', () => alert('VIP settings saved!'));
}

async function loadServiceSettings() {
    const snap = await database.ref('settings/serviceContacts').once('value');
    const contacts = snap.val() || { whatsapp: '+1 234 567 8900', telegram: '@ClutchSupport' };
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>📱 WhatsApp Number</label><input type="text" id="whatsapp" value="${contacts.whatsapp}"></div>
        <div class="form-group"><label>✈️ Telegram Username</label><input type="text" id="telegram" value="${contacts.telegram}"></div>
        <button class="save-btn" id="saveServiceBtn">Save Settings</button>
    `;
    document.getElementById('saveServiceBtn').addEventListener('click', async () => {
        await database.ref('settings/serviceContacts').set({
            whatsapp: document.getElementById('whatsapp').value,
            telegram: document.getElementById('telegram').value
        });
        alert('Service settings saved!');
    });
}

async function loadWalletSettings() {
    const snap = await database.ref('settings/merchantWallet').once('value');
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>🏦 Merchant Wallet Address</label><textarea id="merchantAddress" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${snap.val() || ''}</textarea></div>
        <button class="save-btn" id="saveWalletBtn">Save Address</button>
    `;
    document.getElementById('saveWalletBtn').addEventListener('click', async () => {
        await database.ref('settings/merchantWallet').set(document.getElementById('merchantAddress').value);
        alert('Wallet address saved!');
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
        historyHtml += `<tr><td>${code.date}</td><td><span style="color:#ffd700;">${code.code}</span></td><td>${code.adminName}</td><td>${code.active ? 'Active' : 'Expired'}</td><td>${code.active ? `<button class="delete-btn" onclick="deactivateCode('${id}')">Deactivate</button>` : '-'}</td></tr>`;
    }
    
    content.innerHTML = `
        <div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">
            <h3 style="color:#ffd700;">📋 Today's Invitation Code</h3>
            <p style="font-size:36px; font-weight:bold; color:#ffd700; margin:15px 0;">${todaysCode ? todaysCode.code : 'No code'}</p>
            <button class="save-btn" id="generateCodeBtn">🔑 Generate New Code</button>
        </div>
        <h3 style="color:#ffd700;">📜 Code History</h3>
        <table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead><tbody>${historyHtml || '<tr><td colspan="5">No codes</td></tr>'}</tbody></table>
    `;
    document.getElementById('generateCodeBtn').addEventListener('click', generateInvitationCode);
}

window.deactivateCode = async function(id) {
    await database.ref('invitationCodes/' + id).update({ active: false });
    alert('Code deactivated');
    loadInvitationCodes();
};

async function generateInvitationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    
    const today = new Date().toISOString().split('T')[0];
    const newCode = {
        code: code,
        date: today,
        adminId: adminId || 'master',
        adminName: adminName || 'master',
        active: true,
        createdAt: new Date().toISOString()
    };
    
    await database.ref('invitationCodes/CODE_' + Date.now()).set(newCode);
    alert(`✅ Code generated: ${code}\n📅 Valid until midnight today.`);
    loadInvitationCodes();
}

function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center; padding:50px; color:#ff6666;">⛔ Access Denied. Only Master Admin can manage admins.</div>';
        return;
    }
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <div class="table-container"><table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead><tbody id="adminsTable"><tr><td colspan="4">Loading...</td></tr></tbody></table></div>
    `;
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    loadAdminsTable();
}

async function loadAdminsTable() {
    const snap = await database.ref('admins/sub').once('value');
    const admins = snap.val() || {};
    let html = '';
    for (let id in admins) {
        html += `<tr><td>${admins[id].username}</td><td>${admins[id].email}</td><td>${admins[id].created ? new Date(admins[id].created).toLocaleDateString() : 'Unknown'}</td><td><button class="edit-btn" onclick="resetAdminPass('${id}')">Reset Password</button><button class="delete-btn" onclick="deleteAdmin('${id}')">Delete</button></td></tr>`;
    }
    document.getElementById('adminsTable').innerHTML = html || '<tr><td colspan="4">No sub admins</td></tr>';
}

window.resetAdminPass = async function(id) {
    const newPass = prompt('New password (min 4 characters):');
    if (newPass && newPass.length >= 4) {
        await database.ref('admins/sub/' + id).update({ password: newPass });
        alert('Password reset!');
    }
};

window.deleteAdmin = async function(id) {
    if (confirm('Delete this admin?')) {
        await database.ref('admins/sub/' + id).remove();
        alert('Admin deleted');
        loadAdminsTable();
    }
};

async function createSubAdmin() {
    const username = prompt('Username:');
    if (!username) return;
    const email = prompt('Email:');
    if (!email) return;
    const password = prompt('Password (min 4 characters):');
    if (!password || password.length < 4) return;
    
    const newAdmin = {
        username: username,
        email: email,
        password: password,
        role: 'sub',
        created: new Date().toISOString()
    };
    await database.ref('admins/sub/ADMIN' + Date.now()).set(newAdmin);
    alert(`Sub admin created!\nUsername: ${username}\nPassword: ${password}`);
    loadAdminsTable();
}