// Admin Dashboard - Complete Version with Email Settings

let adminType = '';
let adminId = '';
let adminName = '';
let currentUserData = [];

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
    let users = getFilteredUsers();
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
            <div class="stat-card"><h3>Total Tasks</h3><div class="stat-value">${getTotalTasks()}</div></div>
        </div>
        <div style="text-align: center; padding: 40px; color: #888;">
            <p>Welcome to Admin Panel</p>
            <p>Admin Type: ${adminType === 'master' ? 'Master Admin (Full Access)' : 'Sub Admin'}</p>
        </div>
    `;
}

function getFilteredUsers() {
    let allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    if (adminType === 'master') {
        return allUsers;
    }
    
    let subAdminCodes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    let myCodes = subAdminCodes.filter(function(c) { return c.adminId === adminId; }).map(function(c) { return c.code; });
    
    return allUsers.filter(function(user) {
        return myCodes.includes(user.inviteCode);
    });
}

function getTotalTasks() {
    let tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
    return tasks.length;
}

function loadUserManagement() {
    let users = getFilteredUsers();
    currentUserData = users;
    
    const content = document.getElementById('adminContent');
    let usersHtml = `
        <div style="margin-bottom:20px;">
            <button class="save-btn" id="addUserBtn">+ Add New User</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Username</th><th>Email</th><th>Balance</th><th>Frozen</th><th>Available</th><th>Invite Code</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    users.forEach(function(user) {
        let frozen = parseFloat(user.frozenAmount || 0);
        let available = (parseFloat(user.balance || 0) - frozen).toFixed(2);
        usersHtml += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email || 'N/A'}</td>
                <td style="color:#ffd700;">${user.balance || '0'} USDT</td>
                <td style="color:#ff6666;">${frozen} USDT</td>
                <td style="color:#00ff00;">${available} USDT</td>
                <td style="color:#ffd700;">${user.inviteCode || 'N/A'}</td>
                <td>${user.status || 'active'}</td>
                <td>
                    <button class="edit-btn" onclick="viewUserDetails('${user.id}')">View Details</button>
                    <button class="edit-btn" onclick="addFunds('${user.id}')">+Add</button>
                    <button class="delete-btn" onclick="subtractFunds('${user.id}')">-Sub</button>
                    <button class="edit-btn" onclick="freezeAmount('${user.id}')">❄️Freeze</button>
                    <button class="save-btn" onclick="unfreezeAmount('${user.id}')">🔥Unfreeze</button>
                    <button class="edit-btn" onclick="assignCustomerService('${user.id}')">📞Assign CS</button>
                </td>
            </tr>
        `;
    });
    
    if (users.length === 0) {
        usersHtml += '<tr><td colspan="9" style="text-align:center">No users found</td></tr>';
    }
    
    usersHtml += `</tbody></table></div>`;
    content.innerHTML = usersHtml;
    
    window.viewUserDetails = viewUserDetails;
    window.addFunds = addFunds;
    window.subtractFunds = subtractFunds;
    window.freezeAmount = freezeAmount;
    window.unfreezeAmount = unfreezeAmount;
    window.assignCustomerService = assignCustomerService;
    
    document.getElementById('addUserBtn').addEventListener('click', addNewUser);
}

function viewUserDetails(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const savedPhone = localStorage.getItem('userPhoneNumber_' + userId) || user.phone || 'Not set';
    const savedWallet = localStorage.getItem('userWalletAddress_' + userId) || user.walletAddress || 'Not bound';
    const assignedCS = localStorage.getItem('userAssignedCS_' + userId) || user.assignedCS || 'Default';
    const frozen = parseFloat(user.frozenAmount || 0);
    const available = (parseFloat(user.balance || 0) - frozen).toFixed(2);
    
    const modalHtml = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px;">
            <div style="background:#1a1a2e; border-radius:20px; padding:25px; max-width:500px; width:100%; border:1px solid #ffd700;">
                <h3 style="color:#ffd700; margin-bottom:15px;">User Details: ${user.username}</h3>
                <div style="display:grid; gap:10px;">
                    <p><strong>User ID:</strong> ${user.id}</p>
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email || 'Not set'}</p>
                    <p><strong>Phone:</strong> ${savedPhone}</p>
                    <p><strong>Wallet Address:</strong> ${savedWallet}</p>
                    <p><strong>Invitation Code:</strong> <span style="color:#ffd700;">${user.inviteCode || 'N/A'}</span></p>
                    <p><strong>Invited By:</strong> ${user.invitedBy || 'N/A'}</p>
                    <p><strong>Total Balance:</strong> ${user.balance || '0'} USDT</p>
                    <p><strong>Frozen Amount:</strong> ${frozen} USDT</p>
                    <p><strong>Available Balance:</strong> ${available} USDT</p>
                    <p><strong>Commission Earned:</strong> ${user.commission || '0'} USDT</p>
                    <p><strong>VIP Level:</strong> ${user.vip || 'VIP 1'}</p>
                    <p><strong>Status:</strong> ${user.status || 'active'}</p>
                    <p><strong>Assigned CS:</strong> ${assignedCS}</p>
                    <p><strong>Joined Date:</strong> ${user.joinedDate || 'N/A'}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top:20px; width:100%; padding:12px; background:#ffd700; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function addFunds(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const amount = prompt(`Add funds to ${user.username}:`, '0');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        user.balance = (parseFloat(user.balance || 0) + parseFloat(amount)).toFixed(2);
        updateUserData();
        alert(`Added ${amount} USDT to ${user.username}. New balance: ${user.balance} USDT`);
        loadUserManagement();
        loadDashboard();
    }
}

function subtractFunds(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const amount = prompt(`Subtract funds from ${user.username}. Current balance: ${user.balance || '0'} USDT`, '0');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        let currentBalance = parseFloat(user.balance || 0);
        if (parseFloat(amount) > currentBalance) {
            alert('Cannot subtract more than current balance!');
            return;
        }
        user.balance = (currentBalance - parseFloat(amount)).toFixed(2);
        updateUserData();
        alert(`Subtracted ${amount} USDT from ${user.username}. New balance: ${user.balance} USDT`);
        loadUserManagement();
        loadDashboard();
    }
}

function freezeAmount(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    let currentFrozen = parseFloat(user.frozenAmount || 0);
    let available = parseFloat(user.balance || 0) - currentFrozen;
    
    const amount = prompt(`Freeze amount for ${user.username}. Available to freeze: ${available.toFixed(2)} USDT`, '0');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        if (parseFloat(amount) > available) {
            alert(`Cannot freeze more than available! Available: ${available.toFixed(2)} USDT`);
            return;
        }
        user.frozenAmount = (currentFrozen + parseFloat(amount)).toFixed(2);
        updateUserData();
        alert(`Frozen ${amount} USDT from ${user.username}. Total frozen: ${user.frozenAmount} USDT`);
        loadUserManagement();
    }
}

function unfreezeAmount(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    let currentFrozen = parseFloat(user.frozenAmount || 0);
    
    const amount = prompt(`Unfreeze amount for ${user.username}. Currently frozen: ${currentFrozen.toFixed(2)} USDT`, currentFrozen.toFixed(2));
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        if (parseFloat(amount) > currentFrozen) {
            alert(`Cannot unfreeze more than frozen! Frozen: ${currentFrozen.toFixed(2)} USDT`);
            return;
        }
        user.frozenAmount = (currentFrozen - parseFloat(amount)).toFixed(2);
        updateUserData();
        alert(`Unfrozen ${amount} USDT for ${user.username}. Remaining frozen: ${user.frozenAmount} USDT`);
        loadUserManagement();
    }
}

function assignCustomerService(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const currentCS = localStorage.getItem('userAssignedCS_' + userId) || user.assignedCS || 'Default';
    const whatsapp = localStorage.getItem('userAssignedWhatsapp_' + userId) || user.assignedWhatsapp || '';
    const telegram = localStorage.getItem('userAssignedTelegram_' + userId) || user.assignedTelegram || '';
    
    const modalHtml = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px;">
            <div style="background:#1a1a2e; border-radius:20px; padding:25px; max-width:450px; width:100%; border:1px solid #ffd700;">
                <h3 style="color:#ffd700; margin-bottom:15px;">Assign Customer Service for: ${user.username}</h3>
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="color:#aaa;">📱 WhatsApp Number</label>
                    <input type="text" id="assignWhatsapp" value="${whatsapp}" placeholder="+12345678900" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                </div>
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="color:#aaa;">✈️ Telegram Username</label>
                    <input type="text" id="assignTelegram" value="${telegram}" placeholder="@username" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                </div>
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="color:#aaa;">👤 CS Name/ID</label>
                    <input type="text" id="assignCSName" value="${currentCS}" placeholder="Agent Name" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="saveAssignBtn" style="flex:1; background:#ffd700; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer;">Save</button>
                    <button id="cancelAssignBtn" style="flex:1; background:#333; border:none; padding:12px; border-radius:10px; color:white; cursor:pointer;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('saveAssignBtn').addEventListener('click', function() {
        const whatsapp = document.getElementById('assignWhatsapp').value;
        const telegram = document.getElementById('assignTelegram').value;
        const csName = document.getElementById('assignCSName').value;
        
        localStorage.setItem('userAssignedCS_' + userId, csName);
        localStorage.setItem('userAssignedWhatsapp_' + userId, whatsapp);
        localStorage.setItem('userAssignedTelegram_' + userId, telegram);
        
        user.assignedCS = csName;
        user.assignedWhatsapp = whatsapp;
        user.assignedTelegram = telegram;
        updateUserData();
        
        document.querySelector('div[style*="position:fixed"]').remove();
        alert(`Customer service assigned to ${user.username}`);
        loadUserManagement();
    });
    
    document.getElementById('cancelAssignBtn').addEventListener('click', function() {
        document.querySelector('div[style*="position:fixed"]').remove();
    });
}

function addNewUser() {
    const username = prompt('Enter username:');
    if (!username) return;
    const email = prompt('Enter email:');
    if (!email) return;
    const password = prompt('Enter password (min 4 characters):');
    if (!password || password.length < 4) return;
    
    const newUser = {
        id: 'UID' + Date.now(),
        username: username,
        email: email,
        password: password,
        balance: '0.00',
        commission: '0.00',
        frozenAmount: '0',
        inviteCode: 'MANUAL',
        invitedBy: adminName,
        assignedAdminId: adminId,
        assignedAdminName: adminName,
        status: 'active',
        vip: 'VIP 1',
        joinedDate: new Date().toISOString().split('T')[0]
    };
    
    let allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    allUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
    loadUserManagement();
    alert('User added successfully!');
}

function updateUserData() {
    let allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    for (let i = 0; i < allUsers.length; i++) {
        for (let j = 0; j < currentUserData.length; j++) {
            if (allUsers[i].id === currentUserData[j].id) {
                allUsers[i] = currentUserData[j];
                break;
            }
        }
    }
    localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
}

function loadTaskManagement() {
    let tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
    
    const content = document.getElementById('adminContent');
    let tasksHtml = `
        <div style="margin-bottom:20px;">
            <button class="save-btn" id="addTaskBtn">+ Add New Task</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr><th>Task ID</th><th>Product Name</th><th>Price</th><th>Profit</th><th>Special</th><th>Task Time</th><th>Images</th><th>Actions</th></tr>
                </thead>
                <tbody>
    `;
    
    tasks.forEach(function(task) {
        let hasImages = (task.image1 && task.image1 !== '') ? '✅' : '❌';
        let isSpecial = task.isSpecial ? '⭐ Yes' : 'No';
        let taskTime = task.taskDateTime ? new Date(task.taskDateTime).toLocaleString() : 'Not set';
        
        tasksHtml += `
            <tr>
                <td>${task.taskId}</td>
                <td>${task.productName}</td>
                <td>$${task.price}</td>
                <td>+${task.profit} USDT</td>
                <td>${isSpecial}</td>
                <td>${taskTime}</td>
                <td>${hasImages}</td>
                <td>
                    <button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    if (tasks.length === 0) {
        tasksHtml += '<tr><td colspan="8" style="text-align:center">No tasks found</td></tr>';
    }
    
    tasksHtml += `</tbody></table></div>`;
    content.innerHTML = tasksHtml;
    
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    document.getElementById('addTaskBtn').addEventListener('click', addNewTask);
}

function editTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
    const task = tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    
    const modalHtml = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px; overflow-y:auto;">
            <div style="background:#1a1a2e; border-radius:20px; padding:25px; max-width:600px; width:100%; border:1px solid #ffd700;">
                <h3 style="color:#ffd700; margin-bottom:20px;">Edit Task: ${task.taskId}</h3>
                
                <div style="margin-bottom:15px;">
                    <label style="color:#aaa;">Product Name</label>
                    <input type="text" id="editProductName" value="${task.productName}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="color:#aaa;">Price (USD)</label>
                    <input type="number" id="editPrice" value="${task.price}" step="0.01" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="color:#aaa;">Profit (USDT)</label>
                    <input type="number" id="editProfit" value="${task.profit}" step="0.01" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="color:#aaa;">Special Task?</label>
                    <select id="editIsSpecial" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                        <option value="false" ${task.isSpecial ? '' : 'selected'}>No</option>
                        <option value="true" ${task.isSpecial ? 'selected' : ''}>Yes (⭐ Special)</option>
                    </select>
                </div>
                <div style="margin-bottom:15px;">
                    <label style="color:#aaa;">Task Date/Time</label>
                    <input type="datetime-local" id="editTaskDateTime" value="${task.taskDateTime ? task.taskDateTime.slice(0, 16) : ''}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="color:#aaa;">Task Images (Max 3)</label>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <div><label>Image 1</label><input type="file" id="image1Input" accept="image/*" style="background:#333;"><div id="image1Preview">${task.image1 ? '<img src="'+task.image1+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">' : ''}</div></div>
                        <div><label>Image 2</label><input type="file" id="image2Input" accept="image/*" style="background:#333;"><div id="image2Preview">${task.image2 ? '<img src="'+task.image2+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">' : ''}</div></div>
                        <div><label>Image 3</label><input type="file" id="image3Input" accept="image/*" style="background:#333;"><div id="image3Preview">${task.image3 ? '<img src="'+task.image3+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">' : ''}</div></div>
                    </div>
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="saveTaskBtn" style="flex:1; background:#ffd700; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer;">Save</button>
                    <button id="cancelTaskBtn" style="flex:1; background:#333; border:none; padding:12px; border-radius:10px; color:white; cursor:pointer;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    ['image1', 'image2', 'image3'].forEach(function(imgName, index) {
        const input = document.getElementById(imgName + 'Input');
        if (input) {
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const preview = document.getElementById(imgName + 'Preview');
                        preview.innerHTML = '<img src="'+event.target.result+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">';
                        task[imgName] = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
    
    document.getElementById('saveTaskBtn').addEventListener('click', function() {
        task.productName = document.getElementById('editProductName').value;
        task.price = document.getElementById('editPrice').value;
        task.profit = document.getElementById('editProfit').value;
        task.isSpecial = document.getElementById('editIsSpecial').value === 'true';
        task.taskDateTime = document.getElementById('editTaskDateTime').value;
        
        let allTasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
        const index = allTasks.findIndex(function(t) { return t.id === taskId; });
        if (index !== -1) allTasks[index] = task;
        localStorage.setItem('allTasks', JSON.stringify(allTasks));
        
        document.querySelector('div[style*="position:fixed"]').remove();
        loadTaskManagement();
        alert('Task saved!');
    });
    
    document.getElementById('cancelTaskBtn').addEventListener('click', function() {
        document.querySelector('div[style*="position:fixed"]').remove();
    });
}

function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    let tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
    tasks = tasks.filter(function(t) { return t.id !== taskId; });
    localStorage.setItem('allTasks', JSON.stringify(tasks));
    loadTaskManagement();
    alert('Task deleted!');
}

function addNewTask() {
    let tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
    const newTask = {
        id: 'TSK' + Date.now(),
        taskId: 'TSK' + Date.now(),
        productName: 'New Product',
        price: '0.00',
        profit: '0.10',
        isSpecial: false,
        taskDateTime: new Date().toISOString(),
        image1: '',
        image2: '',
        image3: ''
    };
    tasks.push(newTask);
    localStorage.setItem('allTasks', JSON.stringify(tasks));
    loadTaskManagement();
    alert('New task added! Click Edit to configure.');
}

function loadWithdrawalRequests() {
    let withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    let withdrawalRecords = JSON.parse(localStorage.getItem('withdrawalRecords') || '[]');
    let users = getFilteredUsers();
    let userIds = users.map(function(u) { return u.id; });
    
    let pendingHtml = '';
    let historyHtml = '';
    
    withdrawals.forEach(function(w) {
        if (userIds.includes(w.userId)) {
            pendingHtml += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${new Date(w.requestDate).toLocaleString()}</td>
            <td><button class="approve-btn" onclick="approveWithdrawal('${w.id}')">Approve</button>
            <button class="reject-btn" onclick="rejectWithdrawal('${w.id}')">Reject</button></td></tr>`;
        }
    });
    
    withdrawalRecords.forEach(function(w) {
        if (userIds.includes(w.userId)) {
            historyHtml += `<tr><td>${w.id}</td><td>${w.username}</td><td>${w.amount} USDT</td><td>${w.status}</td><td>${new Date(w.requestDate).toLocaleString()}</td></tr>`;
        }
    });
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <h3 style="color:#ffd700;">💰 Pending Withdrawals</h3>
        <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>${pendingHtml || '<tr><td colspan="5">None</td></tr>'}</tbody></table>
        <h3 style="color:#ffd700; margin-top:30px;">📜 Withdrawal History</h3>
        <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${historyHtml || '<tr><td colspan="5">None</td></tr>'}</tbody></table>
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
        loadDashboard();
    }
}

function rejectWithdrawal(id) {
    let withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    withdrawals = withdrawals.filter(function(w) { return w.id !== id; });
    localStorage.setItem('pendingWithdrawals', JSON.stringify(withdrawals));
    alert('Withdrawal rejected!');
    loadWithdrawalRequests();
    loadDashboard();
}

function loadDepositRecords() {
    let deposits = JSON.parse(localStorage.getItem('depositRecords') || '[]');
    let users = getFilteredUsers();
    let userIds = users.map(function(u) { return u.id; });
    let filteredDeposits = deposits.filter(function(d) { return userIds.includes(d.userId); });
    
    let html = '';
    filteredDeposits.forEach(function(d) {
        html += `<tr><td>${d.id}</td><td>${d.username}</td><td>${d.amount} USDT</td><td>${d.status}</td><td>${d.date}</td></tr>`;
    });
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="margin-bottom:20px;"><button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button></div>
        <table class="data-table"><thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${html || '<tr><td colspan="5">No deposits</td></tr>'}</tbody></table>
    `;
    document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
}

function manualDeposit() {
    const username = prompt('Username:');
    if (!username) return;
    const amount = prompt('Amount (USDT):');
    if (!amount || isNaN(amount)) return;
    
    let users = getFilteredUsers();
    const user = users.find(function(u) { return u.username === username; });
    if (!user) {
        alert('User not found');
        return;
    }
    
    user.balance = (parseFloat(user.balance || 0) + parseFloat(amount)).toFixed(2);
    updateUserData();
    
    let deposits = JSON.parse(localStorage.getItem('depositRecords') || '[]');
    deposits.unshift({
        id: 'DEP' + Date.now(),
        userId: user.id,
        username: username,
        amount: amount,
        status: 'confirmed',
        date: new Date().toLocaleString()
    });
    localStorage.setItem('depositRecords', JSON.stringify(deposits));
    
    alert(`Deposited ${amount} USDT to ${username}`);
    loadDepositRecords();
    loadDashboard();
}

function loadContentManagement() {
    let terms = localStorage.getItem('termsContent') || '';
    let notice = localStorage.getItem('taskNotice') || 'Online Support Hours: 10:00 - 22:00';
    let certificateText = localStorage.getItem('certificateText') || '';
    let aboutPdf = localStorage.getItem('aboutPDF') || '';
    let faqsPdf = localStorage.getItem('faqsPDF') || '';
    let adminEmail = localStorage.getItem('adminEmail') || 'admin@clutch.com';
    let smtpHost = localStorage.getItem('smtpHost') || '';
    let smtpPort = localStorage.getItem('smtpPort') || '587';
    let smtpUser = localStorage.getItem('smtpUser') || '';
    let smtpPass = localStorage.getItem('smtpPass') || '';
    
    // Get users for email dropdown
    let users = getFilteredUsers();
    let userOptions = '<option value="">All Users</option>';
    users.forEach(function(user) {
        userOptions += `<option value="${user.email}">${user.username} (${user.email})</option>`;
    });
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="margin-bottom:30px;">
            <h3 style="color:#ffd700;">📋 Terms & Conditions</h3>
            <textarea id="termsEditor" rows="8" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${terms.replace(/</g, '&lt;')}</textarea>
            <button class="save-btn" id="saveTermsBtn" style="margin-top:10px;">Save Terms</button>
        </div>
        
        <div style="margin-bottom:30px;">
            <h3 style="color:#ffd700;">📝 Task Notice</h3>
            <textarea id="noticeEditor" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${notice}</textarea>
            <button class="save-btn" id="saveNoticeBtn" style="margin-top:10px;">Save Notice</button>
        </div>
        
        <div style="margin-bottom:30px;">
            <h3 style="color:#ffd700;">📜 Certificate Text</h3>
            <textarea id="certTextEditor" rows="5" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${certificateText}</textarea>
            <button class="save-btn" id="saveCertTextBtn" style="margin-top:10px;">Save Certificate Text</button>
        </div>
        
        <div style="margin-bottom:30px;">
            <h3 style="color:#ffd700;">📄 About Us PDF URL</h3>
            <input type="text" id="aboutPdfUrl" value="${aboutPdf}" placeholder="Enter PDF URL" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            <button class="save-btn" id="saveAboutBtn" style="margin-top:10px;">Save About PDF</button>
        </div>
        
        <div style="margin-bottom:30px;">
            <h3 style="color:#ffd700;">❓ FAQS PDF URL</h3>
            <input type="text" id="faqsPdfUrl" value="${faqsPdf}" placeholder="Enter PDF URL" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            <button class="save-btn" id="saveFaqsBtn" style="margin-top:10px;">Save FAQS PDF</button>
        </div>
        
        <div style="margin-bottom:30px;">
            <h3 style="color:#ffd700;">🖼️ Certificate Image</h3>
            <input type="file" id="certImageInput" accept="image/*" style="background:#333;">
            <button class="save-btn" id="saveCertImageBtn" style="margin-top:10px;">Upload Certificate Image</button>
        </div>
        
        <div style="margin-bottom:30px; border-top: 2px solid #444; padding-top:20px;">
            <h3 style="color:#ffd700;">📧 Email Settings (For Forgot Password)</h3>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">Admin Email (From)</label>
                <input type="email" id="adminEmail" value="${adminEmail}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">SMTP Host (e.g., smtp.gmail.com)</label>
                <input type="text" id="smtpHost" value="${smtpHost}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">SMTP Port</label>
                <input type="text" id="smtpPort" value="${smtpPort}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">SMTP Username</label>
                <input type="text" id="smtpUser" value="${smtpUser}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">SMTP Password</label>
                <input type="password" id="smtpPass" value="${smtpPass}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <button class="save-btn" id="saveEmailSettingsBtn">Save Email Settings</button>
            <p style="color:#888; font-size:12px; margin-top:10px;">Note: Configure SMTP to send real emails. For testing, OTP is shown on screen.</p>
        </div>
        
        <div style="margin-bottom:30px; border-top: 2px solid #444; padding-top:20px;">
            <h3 style="color:#ffd700;">📧 Send Email to Clients</h3>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">Select User</label>
                <select id="emailUserSelect" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
                    ${userOptions}
                </select>
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">Subject</label>
                <input type="text" id="emailSubject" placeholder="Email Subject" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="color:#aaa;">Message</label>
                <textarea id="emailMessage" rows="5" placeholder="Write your message here..." style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;"></textarea>
            </div>
            <button class="save-btn" id="sendEmailBtn">Send Email</button>
            <div id="emailStatus" style="margin-top:10px;"></div>
        </div>
    `;
    
    document.getElementById('saveTermsBtn').addEventListener('click', function() {
        localStorage.setItem('termsContent', document.getElementById('termsEditor').value);
        alert('Terms saved!');
    });
    document.getElementById('saveNoticeBtn').addEventListener('click', function() {
        localStorage.setItem('taskNotice', document.getElementById('noticeEditor').value);
        alert('Notice saved!');
    });
    document.getElementById('saveCertTextBtn').addEventListener('click', function() {
        localStorage.setItem('certificateText', document.getElementById('certTextEditor').value);
        alert('Certificate text saved!');
    });
    document.getElementById('saveAboutBtn').addEventListener('click', function() {
        localStorage.setItem('aboutPDF', document.getElementById('aboutPdfUrl').value);
        alert('About PDF saved!');
    });
    document.getElementById('saveFaqsBtn').addEventListener('click', function() {
        localStorage.setItem('faqsPDF', document.getElementById('faqsPdfUrl').value);
        alert('FAQS PDF saved!');
    });
    document.getElementById('saveCertImageBtn').addEventListener('click', function() {
        const file = document.getElementById('certImageInput').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                localStorage.setItem('certificateImage', e.target.result);
                alert('Certificate image uploaded!');
            };
            reader.readAsDataURL(file);
        } else {
            alert('Select a file first');
        }
    });
    document.getElementById('saveEmailSettingsBtn').addEventListener('click', function() {
        localStorage.setItem('adminEmail', document.getElementById('adminEmail').value);
        localStorage.setItem('smtpHost', document.getElementById('smtpHost').value);
        localStorage.setItem('smtpPort', document.getElementById('smtpPort').value);
        localStorage.setItem('smtpUser', document.getElementById('smtpUser').value);
        localStorage.setItem('smtpPass', document.getElementById('smtpPass').value);
        alert('Email settings saved!');
    });
    document.getElementById('sendEmailBtn').addEventListener('click', function() {
        const selectedUser = document.getElementById('emailUserSelect').value;
        const subject = document.getElementById('emailSubject').value;
        const message = document.getElementById('emailMessage').value;
        const statusDiv = document.getElementById('emailStatus');
        
        if (!subject || !message) {
            statusDiv.innerHTML = '<div class="error-message">Please enter subject and message</div>';
            return;
        }
        
        let recipients = [];
        if (selectedUser === '') {
            // Send to all users
            recipients = users.map(function(u) { return u.email; });
        } else {
            recipients = [selectedUser];
        }
        
        // Store email in localStorage for demo
        const emailRecord = {
            id: 'EMAIL' + Date.now(),
            to: recipients.join(', '),
            subject: subject,
            message: message,
            date: new Date().toLocaleString(),
            sentBy: adminName
        };
        
        let sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        sentEmails.unshift(emailRecord);
        localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
        
        statusDiv.innerHTML = `<div class="success-message">Email sent to ${recipients.length} recipient(s)!</div>`;
        document.getElementById('emailSubject').value = '';
        document.getElementById('emailMessage').value = '';
        
        setTimeout(function() {
            statusDiv.innerHTML = '';
        }, 3000);
    });
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
    document.getElementById('saveVipBtn').addEventListener('click', function() { alert('VIP settings saved!'); });
}

function loadServiceSettings() {
    const whatsapp = localStorage.getItem('depositWhatsapp') || '+1 234 567 8900';
    const telegram = localStorage.getItem('depositTelegram') || '@ClutchSupport';
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>📱 Default WhatsApp Number</label><input type="text" id="whatsapp" value="${whatsapp}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;"></div>
        <div class="form-group"><label>✈️ Default Telegram Username</label><input type="text" id="telegram" value="${telegram}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;"></div>
        <button class="save-btn" id="saveServiceBtn">Save Default Settings</button>
        <p style="color:#888; margin-top:10px;">Note: You can assign different WhatsApp/Telegram to each user in User Management > Assign CS</p>
    `;
    document.getElementById('saveServiceBtn').addEventListener('click', function() {
        localStorage.setItem('depositWhatsapp', document.getElementById('whatsapp').value);
        localStorage.setItem('depositTelegram', document.getElementById('telegram').value);
        alert('Service settings saved!');
    });
}

function loadWalletSettings() {
    const address = localStorage.getItem('merchantWalletAddress') || '';
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>🏦 Merchant Wallet Address</label>
        <textarea id="merchantAddress" rows="3" style="width:100%; background:#333; color:white; padding:10px; border-radius:8px;">${address}</textarea>
        <button class="save-btn" id="saveWalletBtn">Save Address</button></div>
    `;
    document.getElementById('saveWalletBtn').addEventListener('click', function() {
        localStorage.setItem('merchantWalletAddress', document.getElementById('merchantAddress').value);
        alert('Wallet address saved!');
    });
}

function loadInvitationCodes() {
    const today = new Date().toISOString().split('T')[0];
    let codes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    let myCodes = codes;
    
    if (adminType !== 'master') {
        myCodes = codes.filter(function(c) { return c.adminId === adminId; });
    }
    
    let todaysCode = myCodes.find(function(c) { return c.date === today && c.active === true; });
    let historyHtml = '';
    
    myCodes.forEach(function(code) {
        historyHtml += `<tr>
            <td>${code.date}</td>
            <td style="color:#ffd700;">${code.code}</td>
            <td>${code.adminName}</td>
            <td>${code.active ? 'Active' : 'Expired'}</td>
            <td>${code.active ? `<button class="delete-btn" onclick="deactivateCode('${code.id}')">Deactivate</button>` : '-'}</td>
        </tr>`;
    });
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">
            <h3 style="color:#ffd700;">📋 Today's Invitation Code</h3>
            <p style="font-size:36px; font-weight:bold; color:#ffd700;">${todaysCode ? todaysCode.code : 'No code'}</p>
            <button class="save-btn" id="generateCodeBtn">🔑 Generate New Code</button>
        </div>
        <h3 style="color:#ffd700;">📜 Code History</h3>
        <table class="data-table"><thead><tr><th>Date</th><th>Code</th><th>Admin</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${historyHtml || '<tr><td colspan="5">No codes</td></tr>'}</tbody></table>
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
    const existing = codes.find(function(c) { return c.date === today && c.adminId === adminId; });
    if (existing) {
        alert('You already have a code for today: ' + existing.code);
        return;
    }
    
    const newCode = {
        id: 'CODE' + Date.now(),
        code: code,
        date: today,
        adminId: adminId,
        adminName: adminName,
        active: true
    };
    codes.push(newCode);
    localStorage.setItem('dailyInvitationCodes', JSON.stringify(codes));
    alert(`Code generated: ${code}\nValid until midnight today.`);
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
        html += `<tr>
            <td>${admin.username}</td>
            <td>${admin.email}</td>
            <td>${admin.created ? new Date(admin.created).toLocaleDateString() : 'Unknown'}</td>
            <td>
                <button class="edit-btn" onclick="resetAdminPass('${admin.id}')">Reset Password</button>
                <button class="delete-btn" onclick="deleteAdmin('${admin.id}')">Delete</button>
            </td>
        </tr>`;
    });
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <button class="save-btn" id="createAdminBtn">+ Create Sub Admin</button>
        <table class="data-table"><thead><tr><th>Username</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>${html || '<tr><td colspan="4">No sub admins</td><td></td><td></td><td></td></tr>'}</tbody></table>
    `;
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    window.resetAdminPass = resetAdminPass;
    window.deleteAdmin = deleteAdmin;
}

function createSubAdmin() {
    const username = prompt('Username:');
    if (!username) return;
    const email = prompt('Email:');
    if (!email) return;
    const password = prompt('Password (min 4 characters):');
    if (!password || password.length < 4) return;
    
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
    alert(`Sub admin created!\nUsername: ${username}\nPassword: ${password}`);
    loadAdminManagement();
}

function resetAdminPass(adminId) {
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const admin = subAdmins.find(function(a) { return a.id === adminId; });
    if (!admin) return;
    const newPass = prompt('New password for ' + admin.username + ':');
    if (newPass && newPass.length >= 4) {
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