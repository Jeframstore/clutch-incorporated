// Admin Dashboard - Simplified Working Version

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
            userCount++;
            totalBalance += parseFloat(users[id].balance || 0);
        }
        document.getElementById('totalUsers').textContent = userCount;
        document.getElementById('totalBalance').textContent = totalBalance.toFixed(2) + ' USDT';
    } catch(e) { console.error(e); }
}

async function loadUserManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="refreshUsersBtn">🔄 Refresh Users</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="usersTableBody"></td><td colspan="6">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    document.getElementById('refreshUsersBtn').addEventListener('click', () => loadUsersTable());
    await loadUsersTable();
}

async function loadUsersTable() {
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        let html = '';
        
        for (let id in users) {
            const user = users[id];
            html += `<tr>
                <td>${id.substring(0, 15)}...<\/td>
                <td>${user.username || 'Unknown'}<\/td>
                <td>${user.email || 'N/A'}<\/td>
                <td style="color:#ffd700;">${user.balance || '0'} USDT<\/td>
                <td>${user.status || 'active'}<\/td>
                <td>
                    <button class="edit-btn" onclick="viewUser('${id}')">👁️ View<\/button>
                    <button class="edit-btn" onclick="editBalance('${id}')">💰 Edit Balance<\/button>
                <\/td>
            <\/tr>`;
        }
        
        if (Object.keys(users).length === 0) {
            document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center">No users found<\/td><\/tr>';
        } else {
            document.getElementById('usersTableBody').innerHTML = html;
        }
    } catch(e) { 
        console.error('Error:', e);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center">Error loading users<\/td><\/tr>';
    }
}

window.viewUser = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    Swal.fire({
        title: `User: ${user.username}`,
        html: `<div style="text-align:left;">
            <p><strong>ID:</strong> ${userId}</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email || 'Not set'}</p>
            <p><strong>Balance:</strong> ${user.balance || '0'} USDT</p>
            <p><strong>Status:</strong> ${user.status || 'active'}</p>
        </div>`,
        icon: 'info',
        confirmButtonColor: '#ffd700'
    });
};

window.editBalance = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    const { value: amount } = await Swal.fire({
        title: 'Edit Balance',
        input: 'number',
        inputLabel: `Current balance: ${user.balance || '0'} USDT`,
        inputPlaceholder: 'Enter new balance',
        showCancelButton: true,
        confirmButtonColor: '#ffd700'
    });
    if (amount !== null && !isNaN(amount)) {
        await database.ref('users/' + userId).update({ balance: parseFloat(amount).toFixed(2) });
        Swal.fire('Success', 'Balance updated!', 'success');
        loadUsersTable();
        loadDashboardStats();
    }
};

async function loadTaskManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="addTaskBtn">+ Add New Task</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Task ID</th><th>Product Name</th><th>Price</th><th>Commission</th><th>Actions</th></tr></thead>
        <tbody id="tasksTableBody"><tr><td colspan="5">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    document.getElementById('addTaskBtn').addEventListener('click', addNewTask);
    await loadTasksTable();
}

async function loadTasksTable() {
    try {
        const tasksSnap = await database.ref('tasks').once('value');
        const tasks = tasksSnap.val() || {};
        let html = '';
        for (let id in tasks) {
            const task = tasks[id];
            html += `<tr>
                <td>${task.taskId || id}<\/td>
                <td>${task.productName || 'N/A'}<\/td>
                <td>$${task.price || '0'}<\/td>
                <td>+${task.commission || '0'} USDT<\/td>
                <td>
                    <button class="edit-btn" onclick="editTask('${id}')">✏️ Edit<\/button>
                    <button class="delete-btn" onclick="deleteTask('${id}')">🗑️ Delete<\/button>
                <\/td>
            <\/tr>`;
        }
        document.getElementById('tasksTableBody').innerHTML = html || '<tr><td colspan="5">No tasks found<\/td><\/tr>';
    } catch(e) { console.error(e); }
}

window.editTask = async function(taskId) {
    const snap = await database.ref('tasks/' + taskId).once('value');
    const task = snap.val();
    
    const { value: formValues } = await Swal.fire({
        title: 'Edit Task',
        html: `
            <input id="taskName" class="swal2-input" placeholder="Product Name" value="${task.productName || ''}">
            <input id="taskPrice" class="swal2-input" placeholder="Price (USD)" value="${task.price || ''}">
            <input id="taskCommission" class="swal2-input" placeholder="Commission (USDT)" value="${task.commission || ''}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#ffd700',
        preConfirm: () => {
            return {
                name: document.getElementById('taskName').value,
                price: document.getElementById('taskPrice').value,
                commission: document.getElementById('taskCommission').value
            };
        }
    });
    
    if (formValues) {
        await database.ref('tasks/' + taskId).update({
            productName: formValues.name,
            price: formValues.price,
            commission: formValues.commission
        });
        Swal.fire('Success', 'Task updated!', 'success');
        loadTasksTable();
    }
};

window.deleteTask = async function(taskId) {
    const result = await Swal.fire({
        title: 'Delete Task?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff6666',
        confirmButtonText: 'Delete'
    });
    if (result.isConfirmed) {
        await database.ref('tasks/' + taskId).remove();
        Swal.fire('Deleted!', 'Task deleted.', 'success');
        loadTasksTable();
    }
};

async function addNewTask() {
    const { value: formValues } = await Swal.fire({
        title: 'Create New Task',
        html: `
            <input id="taskId" class="swal2-input" placeholder="Task ID">
            <input id="taskName" class="swal2-input" placeholder="Product Name">
            <input id="taskPrice" class="swal2-input" placeholder="Price (USD)">
            <input id="taskCommission" class="swal2-input" placeholder="Commission (USDT)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#ffd700',
        preConfirm: () => {
            return {
                taskId: document.getElementById('taskId').value,
                name: document.getElementById('taskName').value,
                price: document.getElementById('taskPrice').value,
                commission: document.getElementById('taskCommission').value
            };
        }
    });
    
    if (formValues && formValues.name) {
        const newTask = {
            taskId: formValues.taskId || 'TSK' + Date.now(),
            productName: formValues.name,
            price: formValues.price || '0',
            commission: formValues.commission || '0',
            createdAt: new Date().toISOString()
        };
        await database.ref('tasks/' + newTask.taskId).set(newTask);
        Swal.fire('Success', 'Task created!', 'success');
        loadTasksTable();
    }
}

async function loadWithdrawalRequests() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<h3 style="color:#ffd700;">💰 Withdrawal Requests</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody id="withdrawalsTableBody"><tr><td colspan="6">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    
    try {
        const snap = await database.ref('withdrawals').once('value');
        const withdrawals = snap.val() || {};
        let html = '';
        for (let id in withdrawals) {
            const w = withdrawals[id];
            html += `<tr>
                <td>${w.id}<\/td>
                <td>${w.username}<\/td>
                <td>${w.amount} USDT<\/td>
                <td>${w.status}<\/td>
                <td>${new Date(w.requestDate).toLocaleString()}<\/td>
                <td>
                    ${w.status === 'pending' ? `<button class="approve-btn" onclick="approveWithdrawal('${id}')">Approve<\/button><button class="reject-btn" onclick="rejectWithdrawal('${id}')">Reject<\/button>` : '-'}
                <\/td>
            <\/tr>`;
        }
        document.getElementById('withdrawalsTableBody').innerHTML = html || '<tr><td colspan="6">No withdrawals<\/td><\/tr>';
    } catch(e) { console.error(e); }
}

window.approveWithdrawal = async function(id) {
    const snap = await database.ref('withdrawals/' + id).once('value');
    const w = snap.val();
    await database.ref('withdrawals/' + id).update({ status: 'confirmed' });
    Swal.fire('Approved', `Withdrawal of ${w.amount} USDT approved`, 'success');
    loadWithdrawalRequests();
};

window.rejectWithdrawal = async function(id) {
    const snap = await database.ref('withdrawals/' + id).once('value');
    const w = snap.val();
    await database.ref('withdrawals/' + id).update({ status: 'rejected' });
    Swal.fire('Rejected', `Withdrawal of ${w.amount} USDT rejected`, 'info');
    loadWithdrawalRequests();
};

async function loadDepositRecords() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button></div>
        <div class="table-container"><table class="data-table"><thead><td><th>ID</th><th>User</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody id="depositsTableBody"><table><td colspan="4">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
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
        document.getElementById('depositsTableBody').innerHTML = html || '<tr><td colspan="4">No deposits<\/td><\/tr>';
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
        if (users[id].username === username) {
            userId = id;
            break;
        }
    }
    if (!userId) { Swal.fire('Error', 'User not found', 'error'); return; }
    
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
    `;
    
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
}

function loadVIPSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div class="form-group"><label>VIP 1 Commission (%)</label><input type="number" id="vip1" value="0.5" step="0.1"></div>
        <div class="form-group"><label>VIP 2 Commission (%)</label><input type="number" id="vip2" value="1" step="0.1"></div>
        <div class="form-group"><label>VIP 3 Commission (%)</label><input type="number" id="vip3" value="1.5" step="0.1"></div>
        <div class="form-group"><label>VIP 4 Commission (%)</label><input type="number" id="vip4" value="2" step="0.1"></div>
        <button class="save-btn" id="saveVipBtn">Save</button>`;
    document.getElementById('saveVipBtn').addEventListener('click', () => Swal.fire('Saved', 'VIP settings saved!', 'success'));
}

async function loadServiceSettings() {
    const snap = await database.ref('settings/serviceContacts').once('value');
    const contacts = snap.val() || { whatsapp: '+1 234 567 8900', telegram: '@ClutchSupport' };
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div class="form-group"><label>📱 WhatsApp</label><input type="text" id="whatsapp" value="${contacts.whatsapp}"></div>
        <div class="form-group"><label>✈️ Telegram</label><input type="text" id="telegram" value="${contacts.telegram}"></div>
        <button class="save-btn" id="saveServiceBtn">Save</button>`;
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
        <button class="save-btn" id="saveWalletBtn">Save</button>`;
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
        <table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${historyHtml || '<td><td colspan="5">No codes</td><\/tr>'}</tbody><\/table>`;
    
    document.getElementById('generateCodeBtn').addEventListener('click', generateInvitationCode);
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
    Swal.fire('Generated', `Code: ${code}`, 'success');
    loadInvitationCodes();
}

function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center; padding:50px; color:#ff6666;">Access Denied</div>';
        return;
    }
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <div class="table-container"><table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody id="adminsTableBody"><tr><td colspan="4">Loading...<\/td><\/tr><\/tbody><\/table><\/div>`;
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    loadAdminsTable();
}

async function loadAdminsTable() {
    const snap = await database.ref('admins/sub').once('value');
    const admins = snap.val() || {};
    let html = '';
    for (let id in admins) {
        html += `<tr>
            <td>${admins[id].username}<\/td>
            <td>${admins[id].email}<\/td>
            <td>${admins[id].created ? new Date(admins[id].created).toLocaleDateString() : 'Unknown'}<\/td>
            <td>
                <button class="edit-btn" onclick="resetAdminPass('${id}')">Reset Password<\/button>
                <button class="delete-btn" onclick="deleteAdmin('${id}')">Delete<\/button>
            <\/td>
        <\/tr>`;
    }
    document.getElementById('adminsTableBody').innerHTML = html || '<tr><td colspan="4">No sub admins<\/td><\/tr>';
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