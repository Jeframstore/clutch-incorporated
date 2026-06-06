// Admin Dashboard - Complete

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
            userCount++;
            totalBalance += parseFloat(users[id].balance || 0);
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
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Invite Code</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="usersTableBody"><tr><td colspan="7">Loading...</td></tr></tbody></table></div>`;
    
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
            html += `<tr>
                <td>${id.substring(0, 15)}...</td>
                <td><strong>${user.username}</strong></td>
                <td>${user.email || 'N/A'}</td>
                <td style="color:#9b59b6;">${user.balance || '0'} USDT</td>
                <td style="color:#9b59b6;">${user.inviteCode || 'N/A'}</td>
                <td>${user.status || 'active'}</td>
                <td>
                    <button class="edit-btn" onclick="editUserBalance('${id}')">Edit Balance</button>
                    <button class="edit-btn" onclick="viewUserDetails('${id}')">View</button>
                </td>
            </tr>`;
        }
        tbody.innerHTML = html || '<tr><td colspan="7">No users found</td></tr>';
    } catch(e) { console.error(e); }
}

window.editUserBalance = async function(userId) {
    const { value: amount } = await Swal.fire({ title: 'Edit Balance', input: 'number', inputLabel: 'New balance (USDT)', showCancelButton: true });
    if (amount && !isNaN(amount)) {
        await database.ref('users/' + userId).update({ balance: parseFloat(amount).toFixed(2) });
        Swal.fire('Success', 'Balance updated!', 'success');
        loadUsersTable();
        loadDashboardStats();
    }
};

window.viewUserDetails = async function(userId) {
    const snap = await database.ref('users/' + userId).once('value');
    const user = snap.val();
    Swal.fire({
        title: `User: ${user.username}`,
        html: `<div style="text-align:left;">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Balance:</strong> ${user.balance || '0'} USDT</p>
            <p><strong>Invite Code:</strong> ${user.inviteCode || 'N/A'}</p>
            <p><strong>Joined:</strong> ${user.joinedDate || 'N/A'}</p>
            <p><strong>Status:</strong> ${user.status || 'active'}</p>
        </div>`,
        icon: 'info'
    });
};

async function loadTaskManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div style="margin-bottom:20px;"><button class="save-btn" id="addTaskBtn">+ Add New Task</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Task ID</th><th>Product</th><th>Price</th><th>Profit</th><th>Special</th><th>Actions</th></tr></thead>
        <tbody id="tasksTableBody"><tr><td colspan="6">Loading...</td></tr></tbody></table></div>`;
    
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
            html += `<tr>
                <td>${task.taskId || id}</td>
                <td>${task.productName || 'N/A'}</td>
                <td>$${task.price || '0'}</td>
                <td>+${task.commission || '0'} USDT</td>
                <td>${task.isPremium ? '🔥 PREMIUM' : '-'}</td>
                <td>
                    <button class="edit-btn" onclick="editTask('${id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteTask('${id}')">Delete</button>
                </td>
            </tr>`;
        }
        tbody.innerHTML = html || '<tr><td colspan="6">No tasks found</td></tr>';
    } catch(e) { console.error(e); }
}

window.editTask = async function(taskId) {
    const snap = await database.ref('tasks/' + taskId).once('value');
    const task = snap.val();
    
    const { value: formValues } = await Swal.fire({
        title: 'Edit Task',
        html: `<input id="taskName" class="swal2-input" placeholder="Product Name" value="${task.productName || ''}">
               <input id="taskPrice" class="swal2-input" placeholder="Price (USD)" value="${task.price || ''}">
               <input id="taskProfit" class="swal2-input" placeholder="Profit (USDT)" value="${task.commission || ''}">
               <input id="assignedTime" class="swal2-input" placeholder="Assigned Time (e.g., 10:00)" value="${task.assignedTime || ''}">
               <input id="nextScheduledTime" class="swal2-input" placeholder="Next Scheduled Time (e.g., 14:00)" value="${task.nextScheduledTime || ''}">
               <input id="timeLimit" class="swal2-input" placeholder="Time Limit (minutes)" value="${task.timeLimit || '60'}">
               <label><input type="checkbox" id="taskPremium" ${task.isPremium ? 'checked' : ''}> Premium Task</label>
               <div id="commissionSection" style="display:${task.isPremium ? 'block' : 'none'}; margin-top:10px;">
                   <input id="commissionPercent" class="swal2-input" placeholder="Commission % for Premium Task" value="${task.commissionPercent || ''}">
               </div>
               <div><label>Images (Max 3):</label></div>
               <input type="file" id="image1" accept="image/*">
               <input type="file" id="image2" accept="image/*">
               <input type="file" id="image3" accept="image/*">`,
        showCancelButton: true,
        preConfirm: () => ({
            name: document.getElementById('taskName').value,
            price: document.getElementById('taskPrice').value,
            profit: document.getElementById('taskProfit').value,
            assignedTime: document.getElementById('assignedTime').value,
            nextScheduledTime: document.getElementById('nextScheduledTime').value,
            timeLimit: document.getElementById('timeLimit').value,
            premium: document.getElementById('taskPremium').checked,
            commissionPercent: document.getElementById('commissionPercent').value
        }),
        didOpen: () => {
            document.getElementById('taskPremium').addEventListener('change', function() {
                document.getElementById('commissionSection').style.display = this.checked ? 'block' : 'none';
            });
        }
    });
    
    if (formValues) {
        const updates = {
            productName: formValues.name,
            price: formValues.price,
            commission: formValues.profit,
            assignedTime: formValues.assignedTime,
            nextScheduledTime: formValues.nextScheduledTime,
            timeLimit: formValues.timeLimit,
            isPremium: formValues.premium,
            commissionPercent: formValues.commissionPercent
        };
        
        for (let i = 1; i <= 3; i++) {
            const file = document.getElementById(`image${i}`).files[0];
            if (file) {
                const reader = new FileReader();
                const imageData = await new Promise((resolve) => {
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
        title: 'Create Task',
        html: `<input id="taskId" class="swal2-input" placeholder="Task ID">
               <input id="taskName" class="swal2-input" placeholder="Product Name">
               <input id="taskPrice" class="swal2-input" placeholder="Price (USD)">
               <input id="taskProfit" class="swal2-input" placeholder="Profit (USDT)">
               <input id="assignedTime" class="swal2-input" placeholder="Assigned Time (e.g., 10:00)">
               <input id="nextScheduledTime" class="swal2-input" placeholder="Next Scheduled Time (e.g., 14:00)">
               <input id="timeLimit" class="swal2-input" placeholder="Time Limit (minutes)">
               <label><input type="checkbox" id="taskPremium"> Premium Task</label>
               <div id="commissionSection" style="display:none; margin-top:10px;">
                   <input id="commissionPercent" class="swal2-input" placeholder="Commission % for Premium Task">
               </div>`,
        showCancelButton: true,
        preConfirm: () => ({
            taskId: document.getElementById('taskId').value,
            name: document.getElementById('taskName').value,
            price: document.getElementById('taskPrice').value,
            profit: document.getElementById('taskProfit').value,
            assignedTime: document.getElementById('assignedTime').value,
            nextScheduledTime: document.getElementById('nextScheduledTime').value,
            timeLimit: document.getElementById('timeLimit').value,
            premium: document.getElementById('taskPremium').checked,
            commissionPercent: document.getElementById('commissionPercent').value
        }),
        didOpen: () => {
            document.getElementById('taskPremium').addEventListener('change', function() {
                document.getElementById('commissionSection').style.display = this.checked ? 'block' : 'none';
            });
        }
    });
    
    if (formValues && formValues.name) {
        await database.ref('tasks/' + (formValues.taskId || 'TSK' + Date.now())).set({
            taskId: formValues.taskId || 'TSK' + Date.now(),
            productName: formValues.name,
            price: formValues.price || '0',
            commission: formValues.profit || '0',
            assignedTime: formValues.assignedTime || '',
            nextScheduledTime: formValues.nextScheduledTime || '',
            timeLimit: formValues.timeLimit || '60',
            isPremium: formValues.premium || false,
            commissionPercent: formValues.commissionPercent || '0'
        });
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
                pending += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${new Date(w.requestDate).toLocaleString()}</td>
                <td><button class="approve-btn" onclick="approveWithdrawal('${id}')">Approve</button><button class="reject-btn" onclick="rejectWithdrawal('${id}')">Reject</button></td></tr>`;
            } else {
                history += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${w.status}</td><td>${new Date(w.requestDate).toLocaleString()}</td></tr>`;
            }
        }
        content.innerHTML = `<h3>Pending Withdrawals</h3><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>${pending || '<tr><td colspan="5">None</td></tr>'}</tbody></table>
        <h3>History</h3><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${history || '<tr><td colspan="5">None</td></tr>'}</tbody></table>`;
    } catch(e) { console.error(e); }
}

window.approveWithdrawal = async function(id) {
    await database.ref('withdrawals/' + id).update({ status: 'confirmed' });
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
    await database.ref('withdrawals/' + id).update({ status: 'rejected' });
    Swal.fire('Rejected', 'Withdrawal rejected. Funds returned.', 'info');
    loadWithdrawalRequests();
    loadDashboardStats();
};

async function loadDepositRecords() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button>
        <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th></tr></thead><tbody id="depositsTableBody"><tr><td colspan="4">Loading...</td></tr></tbody></table>`;
    document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
    await loadDepositsTable();
}

async function loadDepositsTable() {
    const snap = await database.ref('deposits').once('value');
    const deposits = snap.val() || {};
    let html = '';
    for (let id in deposits) {
        html += `<tr><td>${deposits[id].id}</td><td>${deposits[id].username}</td><td>${deposits[id].amount} USDT</td><td>${deposits[id].date}</td></tr>`;
    }
    document.getElementById('depositsTableBody').innerHTML = html || '<tr><td colspan="4">No deposits</td></tr>';
}

async function manualDeposit() {
    const { value: username } = await Swal.fire({ title: 'Manual Deposit', input: 'text', inputLabel: 'Username' });
    if (!username) return;
    const { value: amount } = await Swal.fire({ title: 'Amount', input: 'number', inputLabel: 'Amount in USDT' });
    if (!amount) return;
    
    const usersSnap = await database.ref('users').once('value');
    const users = usersSnap.val() || {};
    let userId = null;
    for (let id in users) if (users[id].username === username) { userId = id; break; }
    if (!userId) { Swal.fire('Error', 'User not found', 'error'); return; }
    
    const user = users[userId];
    await database.ref('users/' + userId).update({ balance: (parseFloat(user.balance) + parseFloat(amount)).toFixed(2) });
    await database.ref('deposits/' + Date.now()).set({
        id: 'DEP' + Date.now(), userId, username, amount: parseFloat(amount), date: new Date().toLocaleString()
    });
    Swal.fire('Success', 'Deposit added!', 'success');
    loadDepositsTable();
    loadDashboardStats();
}

async function loadContentManagement() {
    const termsSnap = await database.ref('settings/terms').once('value');
    const noticeSnap = await database.ref('settings/taskNotice').once('value');
    const logoSnap = await database.ref('settings/logoURL').once('value');
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>Logo Upload</label><input type="file" id="logoUpload" accept="image/*"><button class="save-btn" id="uploadLogoBtn">Upload Logo</button></div>
        <div class="form-group"><label>Terms & Conditions</label><textarea id="termsEditor" rows="8">${termsSnap.val() || ''}</textarea><button class="save-btn" id="saveTermsBtn">Save Terms</button></div>
        <div class="form-group"><label>Task Notice</label><textarea id="noticeEditor" rows="3">${noticeSnap.val() || ''}</textarea><button class="save-btn" id="saveNoticeBtn">Save Notice</button></div>
        <div class="form-group"><label>FAQS PDF URL</label><input type="text" id="faqsPDF" value="${await database.ref('settings/faqsPDF').once('value').then(s => s.val() || '')}"><button class="save-btn" id="saveFaqsBtn">Save FAQS PDF</button></div>
        <div class="form-group"><label>About PDF URL</label><input type="text" id="aboutPDF" value="${await database.ref('settings/aboutPDF').once('value').then(s => s.val() || '')}"><button class="save-btn" id="saveAboutBtn">Save About PDF</button></div>
        <div class="form-group"><label>Certificate Image</label><input type="file" id="certImage" accept="image/*"><button class="save-btn" id="saveCertBtn">Upload Certificate</button></div>`;
    
    document.getElementById('uploadLogoBtn').addEventListener('click', async () => {
        const file = document.getElementById('logoUpload').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                await database.ref('settings/logoURL').set(e.target.result);
                Swal.fire('Success', 'Logo uploaded!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('saveTermsBtn').addEventListener('click', async () => {
        await database.ref('settings/terms').set(document.getElementById('termsEditor').value);
        Swal.fire('Saved', 'Terms saved!', 'success');
    });
    document.getElementById('saveNoticeBtn').addEventListener('click', async () => {
        await database.ref('settings/taskNotice').set(document.getElementById('noticeEditor').value);
        Swal.fire('Saved', 'Notice saved!', 'success');
    });
    document.getElementById('saveFaqsBtn').addEventListener('click', async () => {
        await database.ref('settings/faqsPDF').set(document.getElementById('faqsPDF').value);
        Swal.fire('Saved', 'FAQS PDF saved!', 'success');
    });
    document.getElementById('saveAboutBtn').addEventListener('click', async () => {
        await database.ref('settings/aboutPDF').set(document.getElementById('aboutPDF').value);
        Swal.fire('Saved', 'About PDF saved!', 'success');
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
        }
    });
}

function loadVIPSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div><label>VIP 1 %</label><input id="vip1" value="0.5"></div><div><label>VIP 2 %</label><input id="vip2" value="1"></div><div><label>VIP 3 %</label><input id="vip3" value="1.5"></div><div><label>VIP 4 %</label><input id="vip4" value="2"></div><button class="save-btn" id="saveVipBtn">Save</button>`;
    document.getElementById('saveVipBtn').addEventListener('click', () => Swal.fire('Saved', 'VIP settings saved!', 'success'));
}

async function loadServiceSettings() {
    const snap = await database.ref('settings/serviceContacts').once('value');
    const contacts = snap.val() || {};
    const content = document.getElementById('adminContent');
    content.innerHTML = `<div><label>WhatsApp</label><input id="whatsapp" value="${contacts.whatsapp || ''}"></div>
        <div><label>Telegram</label><input id="telegram" value="${contacts.telegram || ''}"></div>
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
    content.innerHTML = `<div><label>Merchant Wallet Address</label><textarea id="merchantAddress" rows="3">${snap.val() || ''}</textarea></div>
        <button class="save-btn" id="saveWalletBtn">Save</button>`;
    document.getElementById('saveWalletBtn').addEventListener('click', async () => {
        await database.ref('settings/merchantWallet').set(document.getElementById('merchantAddress').value);
        Swal.fire('Saved', 'Wallet address saved!', 'success');
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
        if (codes[id].date === today && codes[id].active) todaysCode = codes[id];
        historyHtml += `<tr><td>${codes[id].date}</td><td style="color:#9b59b6;">${codes[id].code}</td><td>${codes[id].adminName}</td><td>${codes[id].active ? 'Active' : 'Expired'}</td>
        <td><button class="delete-btn" onclick="deactivateCode('${id}')">Deactivate</button></td></tr>`;
    }
    
    content.innerHTML = `<div><h3>Today's Code: ${todaysCode ? todaysCode.code : 'No code'}</h3><button class="save-btn" id="generateCodeBtn">Generate New Code</button></div>
        <table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead><tbody>${historyHtml || '<tr><td colspan="5">No codes</td></tr>'}</tbody></table>`;
    
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
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.random() * chars.length);
    const today = new Date().toISOString().split('T')[0];
    await database.ref('invitationCodes/CODE_' + Date.now()).set({
        code, date: today, adminId: adminId || 'master', adminName: adminName || 'master', active: true
    });
    Swal.fire('Generated', `Code: ${code}`, 'success');
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
            const profit = ((Math.random() * 10) + 1).toFixed(2);
            html += `<tr><td>${t.id}</td><td>${t.username}</td><td>${t.symbol}</td><td>${t.amount} USDT</td><td>${t.entryPrice}</td>
            <td><button class="approve-btn" onclick="confirmTrade('${id}', ${profit})">Confirm (+${profit} USDT)</button>
            <button class="reject-btn" onclick="rejectTrade('${id}', ${t.amount})">Reject</button></td></tr>`;
        }
    }
    content.innerHTML = `<table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Symbol</th><th>Amount</th><th>Entry Price</th><th>Actions</th></tr></thead><tbody>${html || '<tr><td colspan="6">No pending trades</td></tr>'}</tbody></table>`;
}

window.confirmTrade = async function(id, profit) {
    const snap = await database.ref('trades/' + id).once('value');
    const trade = snap.val();
    const userSnap = await database.ref('users/' + trade.userId).once('value');
    const user = userSnap.val();
    await database.ref('users/' + trade.userId).update({ balance: (parseFloat(user.balance) + parseFloat(profit)).toFixed(2) });
    await database.ref('trades/' + id).update({ status: 'confirmed', profit: profit });
    Swal.fire('Confirmed', `Added ${profit} USDT to user balance`, 'success');
    loadTradeConfirmations();
    loadDashboardStats();
};

window.rejectTrade = async function(id, amount) {
    const snap = await database.ref('trades/' + id).once('value');
    const trade = snap.val();
    const userSnap = await database.ref('users/' + trade.userId).once('value');
    const user = userSnap.val();
    await database.ref('users/' + trade.userId).update({ balance: (parseFloat(user.balance) + parseFloat(amount)).toFixed(2) });
    await database.ref('trades/' + id).update({ status: 'rejected' });
    Swal.fire('Rejected', `Returned ${amount} USDT to user`, 'info');
    loadTradeConfirmations();
    loadDashboardStats();
};

function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center; padding:50px;">Access Denied</div>';
        return;
    }
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Actions</th></tr></thead><tbody id="adminsTableBody"></tbody></table>`;
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    loadAdminsTable();
}

async function loadAdminsTable() {
    const snap = await database.ref('admins/sub').once('value');
    const admins = snap.val() || {};
    let html = '';
    for (let id in admins) {
        html += `<tr><td>${admins[id].username}</td><td>${admins[id].email}</td><td><button class="edit-btn" onclick="resetAdminPass('${id}')">Reset Password</button><button class="delete-btn" onclick="deleteAdmin('${id}')">Delete</button></td></tr>`;
    }
    document.getElementById('adminsTableBody').innerHTML = html || '<tr><td colspan="3">No sub admins</td></tr>';
}

window.resetAdminPass = async function(id) {
    const { value: pass } = await Swal.fire({ title: 'Reset Password', input: 'password' });
    if (pass && pass.length >= 4) {
        await database.ref('admins/sub/' + id).update({ password: pass });
        Swal.fire('Success', 'Password reset!', 'success');
    }
};

window.deleteAdmin = async function(id) {
    const result = await Swal.fire({ title: 'Delete Admin?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
        await database.ref('admins/sub/' + id).remove();
        Swal.fire('Deleted', 'Admin deleted', 'success');
        loadAdminsTable();
    }
};

async function createSubAdmin() {
    const { value: username } = await Swal.fire({ title: 'Username', input: 'text' });
    if (!username) return;
    const { value: email } = await Swal.fire({ title: 'Email', input: 'email' });
    if (!email) return;
    const { value: password } = await Swal.fire({ title: 'Password', input: 'password' });
    if (!password || password.length < 4) return;
    
    await database.ref('admins/sub/ADMIN' + Date.now()).set({
        username, email, password, role: 'sub', created: new Date().toISOString()
    });
    Swal.fire('Success', `Sub admin created!\nUsername: ${username}\nPassword: ${password}`, 'success');
    loadAdminsTable();
}