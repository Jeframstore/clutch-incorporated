// Admin Dashboard - Complete Firebase Version

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
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        const userCount = Object.keys(users).length;
        
        let totalBalance = 0;
        for (let id in users) {
            totalBalance += parseFloat(users[id].balance || 0);
        }
        
        const withdrawalsSnapshot = await database.ref('withdrawals').once('value');
        const withdrawals = withdrawalsSnapshot.val() || {};
        let pendingCount = 0;
        for (let id in withdrawals) {
            if (withdrawals[id].status === 'pending') pendingCount++;
        }
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h3>Total Users</h3><div class="stat-value">${userCount}</div></div>
                <div class="stat-card"><h3>Total Balance</h3><div class="stat-value">${totalBalance.toFixed(2)} USDT</div></div>
                <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value">${pendingCount}</div></div>
            </div>
            <div style="text-align: center; padding: 40px; color: #888;">
                <p>Welcome to Admin Panel</p>
                <p>Admin Type: ${adminType === 'master' ? 'Master Admin' : 'Sub Admin'}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        content.innerHTML = '<div style="text-align:center; padding:50px;">Error loading dashboard</div>';
    }
}

async function loadUserManagement() {
    const content = document.getElementById('adminContent');
    
    content.innerHTML = `
        <div style="margin-bottom:20px;">
            <button class="save-btn" id="addUserBtn">+ Add New User</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Invite Code</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr><td colspan="7" style="text-align:center">Loading users...</td</tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('addUserBtn').addEventListener('click', addNewUser);
    await loadUsersTable();
}

async function loadUsersTable() {
    try {
        const snapshot = await database.ref('users').once('value');
        const users = snapshot.val() || {};
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        for (let id in users) {
            const user = users[id];
            const row = `
                <tr>
                    <td>${id.substring(0, 15)}...</td>
                    <td>${user.username || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.balance || '0'} USDT</td>
                    <td style="color:#ffd700;">${user.inviteCode || 'N/A'}</td>
                    <td>${user.status || 'active'}</td>
                    <td>
                        <button class="edit-btn" onclick="editUserBalance('${id}')">Edit Balance</button>
                        <button class="edit-btn" onclick="viewUserDetails('${id}')">View</button>
                     </td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
        
        if (Object.keys(users).length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No users found</td></tr>';
        }
        
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center">Error loading users</td></tr>';
    }
}

window.editUserBalance = async function(userId) {
    const newBalance = prompt('Enter new balance (USDT):');
    if (newBalance && !isNaN(newBalance)) {
        try {
            await database.ref('users/' + userId).update({ balance: parseFloat(newBalance).toFixed(2) });
            alert('Balance updated!');
            loadUsersTable();
            loadDashboard();
        } catch (error) {
            alert('Error updating balance');
        }
    }
};

window.viewUserDetails = async function(userId) {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        alert(`📋 USER DETAILS\n\nUsername: ${user.username}\nEmail: ${user.email}\nBalance: ${user.balance} USDT\nInvite Code: ${user.inviteCode}\nStatus: ${user.status}\nJoined: ${user.joinedDate || 'N/A'}`);
    } catch (error) {
        alert('Error loading user details');
    }
};

async function addNewUser() {
    const username = prompt('Enter username:');
    if (!username) return;
    const email = prompt('Enter email:');
    if (!email) return;
    const password = prompt('Enter password (min 4 characters):');
    if (!password || password.length < 4) return;
    
    const userId = 'UID' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    
    const newUser = {
        username: username,
        email: email,
        password: password,
        balance: '0.00',
        commission: '0.00',
        frozenAmount: '0',
        inviteCode: 'MANUAL',
        status: 'active',
        joinedDate: today
    };
    
    try {
        await database.ref('users/' + userId).set(newUser);
        alert('User added successfully!');
        loadUsersTable();
        loadDashboard();
    } catch (error) {
        alert('Error adding user');
    }
}

async function loadWithdrawalRequests() {
    const content = document.getElementById('adminContent');
    
    try {
        const withdrawalsSnapshot = await database.ref('withdrawals').once('value');
        const withdrawals = withdrawalsSnapshot.val() || {};
        
        let pendingHtml = '';
        let historyHtml = '';
        
        for (let id in withdrawals) {
            const w = withdrawals[id];
            if (w.status === 'pending') {
                pendingHtml += `
                    <tr>
                        <td>${w.id}</td>
                        <td>${w.username || 'Unknown'}</td>
                        <td>${w.amount} USDT</td>
                        <td>${new Date(w.requestDate).toLocaleString()}</td>
                        <td>
                            <button class="approve-btn" onclick="approveWithdrawal('${id}')">Approve</button>
                            <button class="reject-btn" onclick="rejectWithdrawal('${id}')">Reject</button>
                        </td>
                    </tr>
                `;
            } else {
                historyHtml += `
                    <tr>
                        <td>${w.id}</td>
                        <td>${w.username || 'Unknown'}</td>
                        <td>${w.amount} USDT</td>
                        <td>${w.status}</td>
                        <td>${new Date(w.requestDate).toLocaleString()}</td>
                    </tr>
                `;
            }
        }
        
        content.innerHTML = `
            <h3 style="color:#ffd700;">💰 Pending Withdrawals</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>${pendingHtml || '<tr><td colspan="5" style="text-align:center">No pending withdrawals</td></tr>'}</tbody>
                </table>
            </div>
            
            <h3 style="color:#ffd700; margin-top:30px;">📜 Withdrawal History</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>${historyHtml || '<tr><td colspan="5" style="text-align:center">No withdrawal history</td></tr>'}</tbody>
                </table>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading withdrawals:', error);
        content.innerHTML = '<div style="text-align:center; padding:50px;">Error loading withdrawals</div>';
    }
}

window.approveWithdrawal = async function(id) {
    try {
        await database.ref('withdrawals/' + id).update({ status: 'confirmed' });
        alert('Withdrawal approved!');
        loadWithdrawalRequests();
        loadDashboard();
    } catch (error) {
        alert('Error approving withdrawal');
    }
};

window.rejectWithdrawal = async function(id) {
    try {
        await database.ref('withdrawals/' + id).update({ status: 'rejected' });
        alert('Withdrawal rejected!');
        loadWithdrawalRequests();
        loadDashboard();
    } catch (error) {
        alert('Error rejecting withdrawal');
    }
};

async function loadDepositRecords() {
    const content = document.getElementById('adminContent');
    
    try {
        const depositsSnapshot = await database.ref('deposits').once('value');
        const deposits = depositsSnapshot.val() || {};
        
        let html = '';
        for (let id in deposits) {
            const d = deposits[id];
            html += `
                <tr>
                    <td>${d.id}</td>
                    <td>${d.username || 'Unknown'}</td>
                    <td>${d.amount} USDT</td>
                    <td>${d.status || 'confirmed'}</td>
                    <td>${d.date || 'N/A'}</td>
                </tr>
            `;
        }
        
        content.innerHTML = `
            <div style="margin-bottom:20px;">
                <button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>${html || '<tr><td colspan="5" style="text-align:center">No deposit records</td></tr>'}</tbody>
                </table>
            </div>
        `;
        
        document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
        
    } catch (error) {
        console.error('Error loading deposits:', error);
        content.innerHTML = '<div style="text-align:center; padding:50px;">Error loading deposits</div>';
    }
}

async function manualDeposit() {
    const username = prompt('Enter username:');
    if (!username) return;
    const amount = prompt('Enter amount (USDT):');
    if (!amount || isNaN(amount)) return;
    
    try {
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};
        
        let userId = null;
        let userData = null;
        for (let id in users) {
            if (users[id].username === username) {
                userId = id;
                userData = users[id];
                break;
            }
        }
        
        if (!userId) {
            alert('User not found');
            return;
        }
        
        const newBalance = (parseFloat(userData.balance || 0) + parseFloat(amount)).toFixed(2);
        await database.ref('users/' + userId).update({ balance: newBalance });
        
        const depositId = 'DEP' + Date.now();
        await database.ref('deposits/' + depositId).set({
            id: depositId,
            userId: userId,
            username: username,
            amount: parseFloat(amount),
            status: 'confirmed',
            date: new Date().toLocaleString()
        });
        
        alert(`Deposited ${amount} USDT to ${username}`);
        loadDepositRecords();
        loadDashboard();
        
    } catch (error) {
        alert('Error making deposit');
    }
}

async function loadInvitationCodes() {
    const content = document.getElementById('adminContent');
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const codesSnapshot = await database.ref('invitationCodes').once('value');
        const codes = codesSnapshot.val() || {};
        
        let todaysCode = null;
        let historyHtml = '';
        
        for (let id in codes) {
            const code = codes[id];
            if (code.date === today && code.active === true) {
                todaysCode = code;
            }
            historyHtml += `
                <tr>
                    <td>${code.date || 'N/A'}</td>
                    <td style="color:#ffd700;">${code.code}</td>
                    <td>${code.adminName || 'master'}</td>
                    <td>${code.active ? 'Active' : 'Expired'}</td>
                    <td>${code.active ? `<button class="delete-btn" onclick="deactivateCode('${id}')">Deactivate</button>` : '-'}</td>
                </tr>
            `;
        }
        
        content.innerHTML = `
            <div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">
                <h3 style="color:#ffd700;">📋 Today's Invitation Code</h3>
                <p style="font-size:36px; font-weight:bold; color:#ffd700;">${todaysCode ? todaysCode.code : 'No code'}</p>
                <button class="save-btn" id="generateCodeBtn">🔑 Generate New Code</button>
            </div>
            <h3 style="color:#ffd700;">📜 Code History</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>${historyHtml || '<tr><td colspan="5" style="text-align:center">No codes</td></tr>'}</tbody>
                </table>
            </div>
        `;
        
        document.getElementById('generateCodeBtn').addEventListener('click', generateInvitationCode);
        
    } catch (error) {
        console.error('Error loading codes:', error);
        content.innerHTML = '<div style="text-align:center; padding:50px;">Error loading codes</div>';
    }
}

window.deactivateCode = async function(codeId) {
    try {
        await database.ref('invitationCodes/' + codeId).update({ active: false });
        alert('Code deactivated');
        loadInvitationCodes();
    } catch (error) {
        alert('Error deactivating code');
    }
};

async function generateInvitationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const today = new Date().toISOString().split('T')[0];
    const codeId = 'CODE_' + Date.now();
    
    try {
        await database.ref('invitationCodes/' + codeId).set({
            code: code,
            date: today,
            adminId: adminId || 'master',
            adminName: adminName || 'master',
            active: true,
            createdAt: new Date().toISOString()
        });
        
        alert(`✅ Code generated: ${code}\n📅 Valid until midnight today.`);
        loadInvitationCodes();
        
    } catch (error) {
        alert('Error generating code');
    }
}

// Admin Management (Master Admin Only)
function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = `
            <div style="text-align:center; padding:50px; color:#ff6666;">
                <p>⛔ Access Denied</p>
                <p>Only Master Admin can manage admin users.</p>
            </div>
        `;
        return;
    }
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody id="adminsTableBody">
                    <tr><td colspan="4" style="text-align:center">Loading...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    loadAdminsTable();
}

async function loadAdminsTable() {
    try {
        const snapshot = await database.ref('admins/sub').once('value');
        const admins = snapshot.val() || {};
        
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = '';
        
        for (let id in admins) {
            const admin = admins[id];
            tbody.innerHTML += `
                <tr>
                    <td>${admin.username}</td>
                    <td>${admin.email}</td>
                    <td>${admin.created ? new Date(admin.created).toLocaleDateString() : 'Unknown'}</td>
                    <td>
                        <button class="edit-btn" onclick="resetAdminPassword('${id}')">Reset Password</button>
                        <button class="delete-btn" onclick="deleteAdmin('${id}')">Delete</button>
                    </td>
                </tr>
            `;
        }
        
        if (Object.keys(admins).length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No sub admins created</td></tr>';
        }
        
    } catch (error) {
        console.error('Error loading admins:', error);
    }
}

window.resetAdminPassword = async function(adminId) {
    const newPassword = prompt('Enter new password (min 4 characters):');
    if (newPassword && newPassword.length >= 4) {
        await database.ref('admins/sub/' + adminId).update({ password: newPassword });
        alert('Password reset successfully!');
    }
};

window.deleteAdmin = async function(adminId) {
    if (confirm('Delete this admin?')) {
        await database.ref('admins/sub/' + adminId).remove();
        alert('Admin deleted');
        loadAdminsTable();
    }
};

async function createSubAdmin() {
    const username = prompt('Enter username:');
    if (!username) return;
    const email = prompt('Enter email:');
    if (!email) return;
    const password = prompt('Enter password (min 4 characters):');
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