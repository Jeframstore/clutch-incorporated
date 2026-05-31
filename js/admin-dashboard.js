// Admin Dashboard - Complete Firebase Only

let adminType = '';
let adminId = '';

document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = localStorage.getItem('isAdminLoggedIn');
    adminType = localStorage.getItem('adminType') || 'sub';
    adminId = localStorage.getItem('adminId') || '';
    
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
        <button class="nav-item" data-page="withdrawals">💰 Withdrawal Requests</button>
        <button class="nav-item" data-page="deposits">💳 Deposit Records</button>
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
            else if (page === 'withdrawals') loadWithdrawalRequests();
            else if (page === 'deposits') loadDepositRecords();
            else if (page === 'invitecodes') loadInvitationCodes();
            else if (page === 'admins' && adminType === 'master') loadAdminManagement();
        });
    });
}

async function loadDashboard() {
    const content = document.getElementById('adminContent');
    try {
        const usersSnap = await database.ref('users').once('value');
        const users = usersSnap.val() || {};
        const userCount = Object.keys(users).length;
        let totalBalance = 0;
        for (let id in users) totalBalance += parseFloat(users[id].balance || 0);
        
        const withdrawalsSnap = await database.ref('withdrawals').once('value');
        const withdrawals = withdrawalsSnap.val() || {};
        let pending = 0;
        for (let id in withdrawals) if (withdrawals[id].status === 'pending') pending++;
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h3>Total Users</h3><div class="stat-value">${userCount}</div></div>
                <div class="stat-card"><h3>Total Balance</h3><div class="stat-value">${totalBalance.toFixed(2)} USDT</div></div>
                <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value">${pending}</div></div>
            </div>
        `;
    } catch(e) { content.innerHTML = '<div style="text-align:center; padding:50px;">Error loading dashboard</div>'; }
}

async function loadUserManagement() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="margin-bottom:20px;">
            <button class="save-btn" id="refreshUsersBtn">🔄 Refresh Users</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Invite Code</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="usersTableBody"><tr><td colspan="7">Loading...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('refreshUsersBtn').addEventListener('click', () => loadUsersTable());
    await loadUsersTable();
}

async function loadUsersTable() {
    try {
        const snapshot = await database.ref('users').once('value');
        const users = snapshot.val() || {};
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        for (let id in users) {
            const u = users[id];
            tbody.innerHTML += `
                <tr>
                    <td>${id.substring(0, 15)}...</td
                    <td>${u.username || 'N/A'}</td
                    <td>${u.email || 'N/A'}</td
                    <td>${u.balance || '0'} USDT</td
                    <td style="color:#ffd700;">${u.inviteCode || 'N/A'}</td
                    <td>${u.status || 'active'}</td
                    <td><button class="edit-btn" onclick="editUser('${id}')">Edit Balance</button></td
                </tr>
            `;
        }
        if (Object.keys(users).length === 0) tbody.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
    } catch(e) { console.error(e); }
}

window.editUser = async function(userId) {
    const newBalance = prompt('Enter new balance (USDT):');
    if (newBalance && !isNaN(newBalance)) {
        await database.ref('users/' + userId).update({ balance: parseFloat(newBalance).toFixed(2) });
        alert('Balance updated!');
        loadUsersTable();
        loadDashboard();
    }
};

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
            <h3 style="color:#ffd700;">Pending Withdrawals</h3>
            <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>${pending || '<tr><td colspan="5">None</td></tr'}</tbody></table>
            <h3 style="color:#ffd700; margin-top:30px;">History</h3>
            <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${history || '</tr><td colspan="5">None</td></tr'}</tbody></table>
        `;
    } catch(e) { content.innerHTML = '<div style="text-align:center; padding:50px;">Error</div>'; }
}

window.approveWithdrawal = async function(id) {
    await database.ref('withdrawals/' + id).update({ status: 'confirmed' });
    alert('Approved!');
    loadWithdrawalRequests();
    loadDashboard();
};

window.rejectWithdrawal = async function(id) {
    await database.ref('withdrawals/' + id).update({ status: 'rejected' });
    alert('Rejected!');
    loadWithdrawalRequests();
    loadDashboard();
};

async function loadDepositRecords() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button><table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th></tr></thead><tbody id="depositsTable"></tbody></table>`;
    document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
    await loadDepositsTable();
}

async function loadDepositsTable() {
    try {
        const snap = await database.ref('deposits').once('value');
        const deposits = snap.val() || {};
        let html = '';
        for (let id in deposits) html += `<tr><td>${deposits[id].id}</td><td>${deposits[id].username}</td><td>${deposits[id].amount} USDT</td><td>${deposits[id].date}</td></tr>`;
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
    for (let id in users) if (users[id].username === username) { userId = id; break; }
    if (!userId) { alert('User not found'); return; }
    
    const user = users[userId];
    const newBalance = (parseFloat(user.balance || 0) + parseFloat(amount)).toFixed(2);
    await database.ref('users/' + userId).update({ balance: newBalance });
    await database.ref('deposits/' + Date.now()).set({ id: 'DEP' + Date.now(), userId, username, amount: parseFloat(amount), date: new Date().toLocaleString() });
    alert('Deposit added!');
    loadDepositsTable();
    loadDashboard();
}

async function loadInvitationCodes() {
    const content = document.getElementById('adminContent');
    const today = new Date().toISOString().split('T')[0];
    const snap = await database.ref('invitationCodes').once('value');
    const codes = snap.val() || {};
    
    let todaysCode = null;
    let history = '';
    for (let id in codes) {
        if (codes[id].date === today && codes[id].active === true) todaysCode = codes[id];
        history += `<tr><td>${codes[id].date}</td><td style="color:#ffd700;">${codes[id].code}</td><td>${codes[id].adminName}</td><td>${codes[id].active ? 'Active' : 'Expired'}</td><td>${codes[id].active ? `<button class="delete-btn" onclick="deactivateCode('${id}')">Deactivate</button>` : '-'}</td></tr>`;
    }
    
    content.innerHTML = `
        <div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">
            <h3 style="color:#ffd700;">Today's Code</h3>
            <p style="font-size:36px; font-weight:bold; color:#ffd700;">${todaysCode ? todaysCode.code : 'No code'}</p>
            <button class="save-btn" id="generateCodeBtn">Generate New Code</button>
        </div>
        <table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead><tbody>${history || '<td><td colspan="5">No codes</td></tr'}</tbody></table>
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
    await database.ref('invitationCodes/CODE_' + Date.now()).set({ code, date: today, adminId: adminId || 'master', adminName: adminName || 'master', active: true });
    alert(`Code generated: ${code}`);
    loadInvitationCodes();
}

function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center; padding:50px; color:#ff6666;">Access Denied</div>';
        return;
    }
    const content = document.getElementById('adminContent');
    content.innerHTML = `<button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button><table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead><tbody id="adminsTable"></tbody></table>`;
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    loadAdminsTable();
}

async function loadAdminsTable() {
    const snap = await database.ref('admins/sub').once('value');
    const admins = snap.val() || {};
    let html = '';
    for (let id in admins) html += `<tr><td>${admins[id].username}</td><td>${admins[id].email}</td><td>${admins[id].created ? new Date(admins[id].created).toLocaleDateString() : 'Unknown'}</td><td><button class="edit-btn" onclick="resetAdminPass('${id}')">Reset Password</button><button class="delete-btn" onclick="deleteAdmin('${id}')">Delete</button></td></tr>`;
    document.getElementById('adminsTable').innerHTML = html || '<td><td colspan="4">No sub admins</td></tr';
}

window.resetAdminPass = async function(id) {
    const newPass = prompt('New password:');
    if (newPass && newPass.length >= 4) { await database.ref('admins/sub/' + id).update({ password: newPass }); alert('Password reset!'); }
};

window.deleteAdmin = async function(id) {
    if (confirm('Delete this admin?')) { await database.ref('admins/sub/' + id).remove(); alert('Deleted'); loadAdminsTable(); }
};

async function createSubAdmin() {
    const username = prompt('Username:');
    if (!username) return;
    const email = prompt('Email:');
    if (!email) return;
    const password = prompt('Password:');
    if (!password || password.length < 4) return;
    await database.ref('admins/sub/ADMIN' + Date.now()).set({ username, email, password, role: 'sub', created: new Date().toISOString() });
    alert(`Sub admin created!`);
    loadAdminsTable();
}