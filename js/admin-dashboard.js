// Admin Dashboard - Complete with Invitation Code System

let currentUserData = [];
let currentTasks = [];
let pendingWithdrawals = [];
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

function loadSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    const adminBadge = document.getElementById('adminTypeBadge');
    
    if (adminType === 'master') {
        adminBadge.textContent = '👑 MASTER';
    } else {
        adminBadge.textContent = '📋 SUB ADMIN';
    }
    
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
            
            switch(page) {
                case 'dashboard': loadDashboard(); break;
                case 'users': loadUserManagement(); break;
                case 'tasks': loadTaskManagement(); break;
                case 'withdrawals': loadWithdrawalRequests(); break;
                case 'deposits': loadDepositRecords(); break;
                case 'content': loadContentManagement(); break;
                case 'vip': loadVIPSettings(); break;
                case 'service': loadServiceSettings(); break;
                case 'wallet': loadWalletSettings(); break;
                case 'invitecodes': loadInvitationCodes(); break;
                case 'admins': 
                    if (adminType === 'master') {
                        loadAdminManagement();
                    } else {
                        alert('Access Denied. Only Master Admin can access this page.');
                    }
                    break;
            }
        });
    });
}

function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminType');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminId');
    window.location.href = 'admin-login.html';
}

function loadDashboard() {
    const content = document.getElementById('adminContent');
    let allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    let filteredUsers = [];
    if (adminType === 'master') {
        filteredUsers = allUsers;
    } else {
        filteredUsers = allUsers.filter(function(u) {
            return u.assignedAdminId === adminId;
        });
    }
    
    const withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    const totalBalance = filteredUsers.reduce(function(sum, user) {
        return sum + (parseFloat(user.balance) || 0);
    }, 0);
    
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>Total Users</h3><div class="stat-value">${filteredUsers.length || 0}</div></div>
            <div class="stat-card"><h3>Total Balance</h3><div class="stat-value">${totalBalance.toFixed(2)} USDT</div></div>
            <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value">${withdrawals.length}</div></div>
            <div class="stat-card"><h3>Total Tasks</h3><div class="stat-value">${currentTasks.length || 5}</div></div>
        </div>
        <div style="text-align: center; padding: 40px; color: #888;">
            <p>Welcome to Admin Panel</p>
            <p style="font-size: 12px; margin-top: 10px;">Admin Type: ${adminType === 'master' ? 'Master Admin (Full Access)' : 'Sub Admin'}</p>
        </div>
    `;
}

function loadUserManagement() {
    let allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    let filteredUsers = [];
    if (adminType === 'master') {
        filteredUsers = allUsers;
    } else {
        filteredUsers = allUsers.filter(function(u) {
            return u.assignedAdminId === adminId;
        });
    }
    
    if (filteredUsers.length === 0 && adminType !== 'master') {
        filteredUsers = [];
    }
    
    currentUserData = filteredUsers;
    
    const content = document.getElementById('adminContent');
    
    let usersHtml = `
        <div style="margin-bottom: 20px;">
            <button class="save-btn" id="addUserBtn">+ Add New User</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Username</th><th>Email</th><th>Invite Code</th><th>Balance</th><th>Frozen</th><th>Available</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
    `;
    
    filteredUsers.forEach(function(user) {
        const available = (parseFloat(user.balance) - parseFloat(user.frozenAmount || 0)).toFixed(2);
        usersHtml += `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email || 'Not set'}</td>
                <td><span style="color:#ffd700;">${user.inviteCode || 'N/A'}</span></td>
                <td>${user.balance} USDT</td>
                <td>${user.frozenAmount || 0} USDT</td>
                <td style="color: #00ff00;">${available} USDT</td>
                <td>${user.status}</td>
                <td>
                    <button class="edit-btn" onclick="viewUserDetails('${user.id}')">View</button>
                    <button class="edit-btn" onclick="addFunds('${user.id}')">+Add</button>
                    <button class="delete-btn" onclick="subtractFunds('${user.id}')">-Sub</button>
                    <button class="edit-btn" onclick="freezeAmount('${user.id}')">❄️Freeze</button>
                    <button class="save-btn" onclick="unfreezeAmount('${user.id}')">🔥Unfreeze</button>
                    <button class="edit-btn" onclick="assignServiceAccount('${user.id}')">📞Assign CS</button>
                  </td>
            </tr>
        `;
    });
    
    if (filteredUsers.length === 0) {
        usersHtml += `<tr><td colspan="9" style="text-align: center; color: #888;">No users found</td></tr>`;
    }
    
    usersHtml += `</tbody></table></div>`;
    content.innerHTML = usersHtml;
    
    window.viewUserDetails = viewUserDetails;
    window.addFunds = addFunds;
    window.subtractFunds = subtractFunds;
    window.freezeAmount = freezeAmount;
    window.unfreezeAmount = unfreezeAmount;
    window.assignServiceAccount = assignServiceAccount;
    
    document.getElementById('addUserBtn').addEventListener('click', addNewUser);
}

function viewUserDetails(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const savedWallet = localStorage.getItem('userWalletAddress') || user.walletAddress || 'Not bound';
    const savedPhone = localStorage.getItem('userPhoneNumber') || user.phone || 'Not set';
    const available = (parseFloat(user.balance) - parseFloat(user.frozenAmount || 0)).toFixed(2);
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.95)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.style.padding = '20px';
    
    modal.innerHTML = `
        <div style="background: #1a1a2e; border-radius: 20px; padding: 25px; max-width: 500px; width: 100%; border: 1px solid #ffd700;">
            <h3 style="color: #ffd700; margin-bottom: 15px;">User Details: ${user.username}</h3>
            <div style="display: grid; gap: 10px;">
                <p><strong style="color:#888;">User ID:</strong> <span style="color:white;">${user.id}</span></p>
                <p><strong style="color:#888;">Username:</strong> <span style="color:white;">${user.username}</span></p>
                <p><strong style="color:#888;">Email:</strong> <span style="color:white;">${user.email || 'Not set'}</span></p>
                <p><strong style="color:#888;">Invitation Code:</strong> <span style="color:#ffd700;">${user.inviteCode || 'N/A'}</span></p>
                <p><strong style="color:#888;">Invited By:</strong> <span style="color:white;">${user.invitedBy || 'N/A'}</span></p>
                <p><strong style="color:#888;">Phone Number:</strong> <span style="color:white;">${savedPhone}</span></p>
                <p><strong style="color:#888;">Wallet Address:</strong> <span style="color:white; word-break:break-all;">${savedWallet}</span></p>
                <p><strong style="color:#888;">Total Balance:</strong> <span style="color:#ffd700;">${user.balance} USDT</span></p>
                <p><strong style="color:#888;">Frozen Amount:</strong> <span style="color:#ff6666;">${user.frozenAmount || 0} USDT</span></p>
                <p><strong style="color:#888;">Available Balance:</strong> <span style="color:#00ff00;">${available} USDT</span></p>
                <p><strong style="color:#888;">Commission Earned:</strong> <span style="color:#ffd700;">${user.commission} USDT</span></p>
                <p><strong style="color:#888;">VIP Level:</strong> <span style="color:#ffd700;">${user.vip}</span></p>
                <p><strong style="color:#888;">Status:</strong> <span style="color:${user.status === 'active' ? '#00ff00' : '#ff6666'};">${user.status}</span></p>
                <p><strong style="color:#888;">Joined Date:</strong> <span style="color:white;">${user.joinedDate}</span></p>
            </div>
            <button id="closeModalBtn" style="margin-top:20px; width:100%; padding:12px; background:#ffd700; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('closeModalBtn').addEventListener('click', function() { modal.remove(); });
}

function assignServiceAccount(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.95)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.style.padding = '20px';
    
    modal.innerHTML = `
        <div style="background: #1a1a2e; border-radius: 20px; padding: 25px; max-width: 450px; width: 100%; border: 1px solid #ffd700;">
            <h3 style="color: #ffd700; margin-bottom: 15px;">Assign Customer Service for: ${user.username}</h3>
            <div class="form-group">
                <label>📱 WhatsApp Number</label>
                <input type="text" id="assignWhatsapp" value="${user.assignedWhatsapp || '+1 234 567 8900'}" placeholder="+12345678900" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div class="form-group">
                <label>✈️ Telegram Username</label>
                <input type="text" id="assignTelegram" value="${user.assignedTelegram || '@ClutchSupport'}" placeholder="@username" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="saveAssignBtn" style="flex:1; background:#ffd700; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer;">Save Assignment</button>
                <button id="cancelAssignBtn" style="flex:1; background:#333; border:none; padding:12px; border-radius:10px; color:white; cursor:pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('saveAssignBtn').addEventListener('click', function() {
        const whatsapp = document.getElementById('assignWhatsapp').value;
        const telegram = document.getElementById('assignTelegram').value;
        
        user.assignedWhatsapp = whatsapp;
        user.assignedTelegram = telegram;
        
        localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
        
        modal.remove();
        loadUserManagement();
        alert(`Customer service assigned to ${user.username}:\nWhatsApp: ${whatsapp}\nTelegram: ${telegram}`);
    });
    
    document.getElementById('cancelAssignBtn').addEventListener('click', function() {
        modal.remove();
    });
}

function addFunds(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const amount = prompt(`Add funds to ${user.username}:`, '0');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        user.balance = (parseFloat(user.balance) + parseFloat(amount)).toFixed(2);
        localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
        localStorage.setItem('walletBalance', user.balance);
        
        let deposits = JSON.parse(localStorage.getItem('depositRecords') || '[]');
        deposits.unshift({
            id: 'DEP' + Date.now(),
            username: user.username,
            amount: amount,
            status: 'confirmed',
            date: new Date().toLocaleString(),
            remark: 'Manual deposit by admin'
        });
        localStorage.setItem('depositRecords', JSON.stringify(deposits));
        
        loadUserManagement();
        alert(`Added ${amount} USDT to ${user.username}. New balance: ${user.balance} USDT`);
    } else {
        alert('Invalid amount');
    }
}

function subtractFunds(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const amount = prompt(`Subtract funds from ${user.username}. Current balance: ${user.balance} USDT`, '0');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        if (parseFloat(amount) > parseFloat(user.balance)) {
            alert('Cannot subtract more than current balance!');
            return;
        }
        user.balance = (parseFloat(user.balance) - parseFloat(amount)).toFixed(2);
        localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
        localStorage.setItem('walletBalance', user.balance);
        
        loadUserManagement();
        alert(`Subtracted ${amount} USDT from ${user.username}. New balance: ${user.balance} USDT`);
    } else {
        alert('Invalid amount');
    }
}

function freezeAmount(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const currentFrozen = parseFloat(user.frozenAmount || 0);
    const available = parseFloat(user.balance) - currentFrozen;
    
    const amount = prompt(`Freeze amount for ${user.username}. Available to freeze: ${available.toFixed(2)} USDT`, '0');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        if (parseFloat(amount) > available) {
            alert(`Cannot freeze more than available balance! Available: ${available.toFixed(2)} USDT`);
            return;
        }
        user.frozenAmount = (currentFrozen + parseFloat(amount)).toFixed(2);
        localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
        
        loadUserManagement();
        alert(`Frozen ${amount} USDT from ${user.username}. Total frozen: ${user.frozenAmount} USDT`);
    } else {
        alert('Invalid amount');
    }
}

function unfreezeAmount(userId) {
    const user = currentUserData.find(function(u) { return u.id === userId; });
    if (!user) return;
    
    const currentFrozen = parseFloat(user.frozenAmount || 0);
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.95)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.style.padding = '20px';
    
    modal.innerHTML = `
        <div style="background: #1a1a2e; border-radius: 20px; padding: 25px; max-width: 400px; width: 100%; border: 1px solid #ffd700;">
            <h3 style="color: #ffd700; margin-bottom: 15px;">Unfreeze Funds - ${user.username}</h3>
            <p>Currently Frozen: <span style="color:#ff6666;">${currentFrozen} USDT</span></p>
            <div class="form-group" style="margin-top: 15px;">
                <label>Amount to Unfreeze:</label>
                <input type="number" id="unfreezeAmount" step="0.01" value="${currentFrozen}" style="width:100%; padding:10px; background:#333; border:1px solid #ffd700; border-radius:8px; color:white;">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="unfreezeAllBtn" style="flex:1; background:#ffd700; border:none; padding:10px; border-radius:8px; cursor:pointer;">Unfreeze All</button>
                <button id="unfreezePartialBtn" style="flex:1; background:#ffd700; border:none; padding:10px; border-radius:8px; cursor:pointer;">Unfreeze Amount</button>
                <button id="cancelModalBtn" style="flex:1; background:#333; border:none; padding:10px; border-radius:8px; color:white; cursor:pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('unfreezeAllBtn').addEventListener('click', function() {
        user.frozenAmount = '0';
        localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
        loadUserManagement();
        modal.remove();
        alert(`All frozen funds (${currentFrozen} USDT) unfrozen for ${user.username}`);
    });
    
    document.getElementById('unfreezePartialBtn').addEventListener('click', function() {
        const amount = document.getElementById('unfreezeAmount').value;
        if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
            if (parseFloat(amount) > currentFrozen) {
                alert(`Cannot unfreeze more than frozen amount! Frozen: ${currentFrozen} USDT`);
                return;
            }
            const newFrozen = (currentFrozen - parseFloat(amount)).toFixed(2);
            user.frozenAmount = newFrozen;
            localStorage.setItem('registeredUsers', JSON.stringify(currentUserData));
            loadUserManagement();
            modal.remove();
            alert(`Unfrozen ${amount} USDT for ${user.username}. Remaining frozen: ${newFrozen} USDT`);
        } else {
            alert('Invalid amount');
        }
    });
    
    document.getElementById('cancelModalBtn').addEventListener('click', function() {
        modal.remove();
    });
}

function addNewUser() {
    const username = prompt('Enter username:');
    if (!username) return;
    
    const email = prompt('Enter email:');
    if (!email || !email.includes('@')) {
        alert('Valid email required');
        return;
    }
    
    const password = prompt('Enter password (min 4 characters):');
    if (!password || password.length < 4) {
        alert('Password must be at least 4 characters');
        return;
    }
    
    const inviteCode = prompt('Enter invitation code for this user:');
    if (!inviteCode) {
        alert('Invitation code required');
        return;
    }
    
    const newUser = {
        id: 'UID' + Date.now(),
        username: username,
        email: email,
        password: password,
        inviteCode: inviteCode.toUpperCase(),
        assignedAdminId: adminId,
        assignedAdminName: adminName,
        invitedBy: adminName,
        balance: '0.00',
        frozenAmount: '0',
        commission: '0.00',
        vip: 'VIP 1',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        assignedWhatsapp: '+1 234 567 8900',
        assignedTelegram: '@ClutchSupport'
    };
    
    let allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    allUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
    loadUserManagement();
    alert('User added successfully!');
}

function loadTaskManagement() {
    let tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
    
    if (tasks.length === 0) {
        tasks = [{
            id: 'TSK001',
            taskId: 'TSK001',
            productName: 'Sample Product',
            price: '25.99',
            profit: '0.75',
            image1: '',
            image2: '',
            image3: '',
            taskDateTime: new Date().toISOString(),
            nextTaskDateTime: '',
            completed: false
        }];
        localStorage.setItem('allTasks', JSON.stringify(tasks));
    }
    
    currentTasks = tasks;
    
    const content = document.getElementById('adminContent');
    
    let tasksHtml = `
        <div style="margin-bottom: 20px;">
            <button class="save-btn" id="addTaskBtn">+ Add New Task</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>Task ID</th><th>Product Name</th><th>Price</th><th>Profit</th><th>Has Images</th><th>Task Time</th><th>Actions</th></tr></thead>
                <tbody>
    `;
    
    tasks.forEach(function(task) {
        const hasImages = (task.image1 && task.image1 !== '') ? 'Yes' : 'No';
        tasksHtml += `
            <tr>
                <td>${task.taskId}</td>
                <td>${task.productName}</td>
                <td>$${task.price}</td>
                <td>+${task.profit} USDT</td>
                <td>${hasImages}</td>
                <td>${task.taskDateTime ? new Date(task.taskDateTime).toLocaleString() : 'Not set'}</td>
                <td>
                    <button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
                 </td>
            </tr>
        `;
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
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.95)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.style.padding = '20px';
    modal.style.overflowY = 'auto';
    
    modal.innerHTML = `
        <div style="background: #1a1a2e; border-radius: 20px; padding: 25px; max-width: 600px; width: 100%; border: 1px solid #ffd700;">
            <h3 style="color: #ffd700; margin-bottom: 20px;">Edit Task: ${task.taskId}</h3>
            
            <div class="form-group"><label>Task ID</label><input type="text" id="editTaskId" value="${task.taskId}"></div>
            <div class="form-group"><label>Product Name</label><input type="text" id="editProductName" value="${task.productName}"></div>
            <div class="form-group"><label>Price (USD)</label><input type="number" id="editPrice" value="${task.price}" step="0.01"></div>
            <div class="form-group"><label>Profit (USDT)</label><input type="number" id="editProfit" value="${task.profit}" step="0.01"></div>
            <div class="form-group"><label>Task Date/Time</label><input type="datetime-local" id="editTaskDateTime" value="${task.taskDateTime ? task.taskDateTime.slice(0, 16) : ''}"></div>
            
            <div class="form-group">
                <label>Task Images (Max 3)</label>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <div><label>Image 1</label><input type="file" id="image1Input" accept="image/*"><div id="image1Preview" style="margin-top:5px;">${task.image1 ? '<img src="'+task.image1+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">' : ''}</div></div>
                    <div><label>Image 2</label><input type="file" id="image2Input" accept="image/*"><div id="image2Preview" style="margin-top:5px;">${task.image2 ? '<img src="'+task.image2+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">' : ''}</div></div>
                    <div><label>Image 3</label><input type="file" id="image3Input" accept="image/*"><div id="image3Preview" style="margin-top:5px;">${task.image3 ? '<img src="'+task.image3+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">' : ''}</div></div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="saveTaskBtn" style="flex:1; background:#ffd700; border:none; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer;">Save Changes</button>
                <button id="cancelModalBtn" style="flex:1; background:#333; border:none; padding:12px; border-radius:10px; color:white; cursor:pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const image1Input = document.getElementById('image1Input');
    const image2Input = document.getElementById('image2Input');
    const image3Input = document.getElementById('image3Input');
    
    image1Input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('image1Preview').innerHTML = '<img src="'+event.target.result+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">';
                task.image1 = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    image2Input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('image2Preview').innerHTML = '<img src="'+event.target.result+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">';
                task.image2 = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    image3Input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('image3Preview').innerHTML = '<img src="'+event.target.result+'" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">';
                task.image3 = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('saveTaskBtn').addEventListener('click', function() {
        task.taskId = document.getElementById('editTaskId').value;
        task.productName = document.getElementById('editProductName').value;
        task.price = document.getElementById('editPrice').value;
        task.profit = document.getElementById('editProfit').value;
        task.taskDateTime = document.getElementById('editTaskDateTime').value;
        
        localStorage.setItem('allTasks', JSON.stringify(currentTasks));
        localStorage.setItem('currentTask', JSON.stringify(task));
        modal.remove();
        loadTaskManagement();
        alert('Task saved successfully!');
    });
    
    document.getElementById('cancelModalBtn').addEventListener('click', function() {
        modal.remove();
    });
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
        profit: '0.10',
        image1: '',
        image2: '',
        image3: '',
        taskDateTime: new Date().toISOString(),
        nextTaskDateTime: '',
        completed: false
    };
    
    currentTasks.push(newTask);
    localStorage.setItem('allTasks', JSON.stringify(currentTasks));
    loadTaskManagement();
    alert('New task added! Click Edit to configure details and upload images.');
}

function loadWithdrawalRequests() {
    let withdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    let withdrawalRecords = JSON.parse(localStorage.getItem('withdrawalRecords') || '[]');
    
    const content = document.getElementById('adminContent');
    
    let withdrawalsHtml = `
        <h3 style="color: #ffd700; margin-bottom: 15px;">Pending Withdrawals</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Username</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>
    `;
    
    withdrawals.forEach(function(w) {
        withdrawalsHtml += `<tr><td>${w.id}</td><td>${w.username || 'Unknown'}</td><td>${w.amount} USDT</td><td>${new Date(w.requestDate).toLocaleString()}</td>
        <td><button class="approve-btn" onclick="approveWithdrawal('${w.id}')">Approve</button><button class="reject-btn" onclick="rejectWithdrawal('${w.id}')">Reject</button></td></tr>`;
    });
    
    if (withdrawals.length === 0) {
        withdrawalsHtml += `<tr><td colspan="5" style="text-align: center;">No pending withdrawals</td></tr>`;
    }
    
    withdrawalsHtml += `</tbody></table></div>`;
    withdrawalsHtml += `<h3 style="color: #ffd700; margin: 30px 0 15px;">Withdrawal History</h3>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Username</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>`;
    
    withdrawalRecords.forEach(function(w) {
        withdrawalsHtml += `<td><td>${w.id}</td><td>${w.username || 'Unknown'}</td><td>${w.amount} USDT</td><td>${w.status}</td><td>${new Date(w.requestDate).toLocaleString()}</td></tr>`;
    });
    
    if (withdrawalRecords.length === 0) {
        withdrawalsHtml += `<tr><td colspan="5" style="text-align: center;">No withdrawal history</td></tr>`;
    }
    
    withdrawalsHtml += `</tbody></table></div>`;
    content.innerHTML = withdrawalsHtml;
    
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
    
    let depositsHtml = `<div style="margin-bottom:20px;"><button class="save-btn" id="manualDepositBtn">+ Manual Deposit</button></div>
        <div class="table-container"><table class="data-table"><thead><tr><th>ID</th><th>Username</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>`;
    
    deposits.forEach(function(d) {
        depositsHtml += `<tr><td>${d.id}</td><td>${d.username || 'Unknown'}</td><td>${d.amount} USDT</td><td>${d.status || 'confirmed'}</td><td>${d.date}</td></tr>`;
    });
    
    if (deposits.length === 0) {
        depositsHtml += `<tr><td colspan="5" style="text-align: center;">No deposit records</td></tr>`;
    }
    
    depositsHtml += `</tbody></table></div>`;
    content.innerHTML = depositsHtml;
    document.getElementById('manualDepositBtn').addEventListener('click', manualDeposit);
}

function manualDeposit() {
    const username = prompt('Enter username:');
    if (!username) return;
    const amount = prompt('Enter amount to deposit (USDT):');
    if (!amount || isNaN(amount)) return;
    
    let deposits = JSON.parse(localStorage.getItem('depositRecords') || '[]');
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(function(u) { return u.username === username; });
    
    if (user) {
        user.balance = (parseFloat(user.balance) + parseFloat(amount)).toFixed(2);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        localStorage.setItem('walletBalance', user.balance);
    }
    
    deposits.unshift({ id: 'DEP' + Date.now(), username: username, amount: amount, status: 'confirmed', date: new Date().toLocaleString() });
    localStorage.setItem('depositRecords', JSON.stringify(deposits));
    alert(`Deposited ${amount} USDT to ${username}`);
    loadDepositRecords();
}

function loadContentManagement() {
    const content = document.getElementById('adminContent');
    let termsContent = localStorage.getItem('termsContent') || '';
    
    content.innerHTML = `
        <div class="form-group"><label>📋 Terms & Conditions (Editable HTML)</label>
        <textarea id="termsEditor" rows="10" style="width:100%; font-family: monospace;">${termsContent.replace(/</g, '&lt;')}</textarea>
        <button class="save-btn" id="saveTermsBtn" style="margin-top: 10px;">Save Terms</button></div>
        
        <div class="form-group" style="margin-top:30px;"><label>📝 Task Notice (Admin only)</label>
        <textarea id="taskNoticeEditor" rows="3" style="width:100%;">${localStorage.getItem('taskNotice') || 'Online Support Hours: 10:00 - 22:00'}</textarea>
        <button class="save-btn" id="saveNoticeBtn" style="margin-top: 10px;">Save Task Notice</button></div>
        
        <div style="margin-top:30px;"><label>📜 Certificate Image</label>
        <input type="file" id="certFileInput" accept="image/*">
        <button class="save-btn" id="saveCertBtn" style="margin-top: 10px;">Upload Certificate</button></div>
        
        <div style="margin-top:30px;"><label>📄 About Us PDF URL</label>
        <input type="text" id="aboutPDFUrl" placeholder="Enter PDF URL" value="${localStorage.getItem('aboutPDF') || ''}">
        <button class="save-btn" id="saveAboutBtn" style="margin-top: 10px;">Save About PDF</button></div>
        
        <div style="margin-top:30px;"><label>❓ FAQS PDF URL</label>
        <input type="text" id="faqsPDFUrl" placeholder="Enter PDF URL" value="${localStorage.getItem('faqsPDF') || ''}">
        <button class="save-btn" id="saveFaqsBtn" style="margin-top: 10px;">Save FAQS PDF</button></div>
    `;
    
    document.getElementById('saveTermsBtn').addEventListener('click', function() {
        localStorage.setItem('termsContent', document.getElementById('termsEditor').value);
        alert('Terms saved!');
    });
    
    document.getElementById('saveNoticeBtn').addEventListener('click', function() {
        localStorage.setItem('taskNotice', document.getElementById('taskNoticeEditor').value);
        alert('Task notice saved!');
    });
    
    document.getElementById('saveCertBtn').addEventListener('click', function() {
        const file = document.getElementById('certFileInput').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                localStorage.setItem('certificateImage', e.target.result);
                alert('Certificate image uploaded!');
            };
            reader.readAsDataURL(file);
        } else alert('Select a file first');
    });
    
    document.getElementById('saveAboutBtn').addEventListener('click', function() {
        localStorage.setItem('aboutPDF', document.getElementById('aboutPDFUrl').value);
        alert('About PDF saved!');
    });
    
    document.getElementById('saveFaqsBtn').addEventListener('click', function() {
        localStorage.setItem('faqsPDF', document.getElementById('faqsPDFUrl').value);
        alert('FAQS PDF saved!');
    });
}

function loadVIPSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>VIP 1 Commission (%)</label><input type="number" id="vip1Commission" value="0.5" step="0.1"></div>
        <div class="form-group"><label>VIP 2 Commission (%)</label><input type="number" id="vip2Commission" value="1" step="0.1"></div>
        <div class="form-group"><label>VIP 3 Commission (%)</label><input type="number" id="vip3Commission" value="1.5" step="0.1"></div>
        <div class="form-group"><label>VIP 4 Commission (%)</label><input type="number" id="vip4Commission" value="2" step="0.1"></div>
        <div class="form-group"><label>Orders Per Round</label><input type="number" id="ordersPerRound" value="40"></div>
        <button class="save-btn" id="saveVipBtn">Save VIP Settings</button>
    `;
    document.getElementById('saveVipBtn').addEventListener('click', function() { alert('VIP settings saved!'); });
}

function loadServiceSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>Default WhatsApp Number</label><input type="text" id="whatsappNumber" value="${localStorage.getItem('depositWhatsapp') || '+1 234 567 8900'}"></div>
        <div class="form-group"><label>Default Telegram Username</label><input type="text" id="telegramUsername" value="${localStorage.getItem('depositTelegram') || '@ClutchSupport'}"></div>
        <button class="save-btn" id="saveServiceBtn">Save Default Service Settings</button>
        <p style="color:#888; font-size:12px; margin-top:10px;">Note: You can assign different WhatsApp/Telegram to each user in User Management > Assign CS</p>
    `;
    document.getElementById('saveServiceBtn').addEventListener('click', function() {
        localStorage.setItem('depositWhatsapp', document.getElementById('whatsappNumber').value);
        localStorage.setItem('whatsappNumber', document.getElementById('whatsappNumber').value);
        localStorage.setItem('depositTelegram', document.getElementById('telegramUsername').value);
        localStorage.setItem('telegramUsername', document.getElementById('telegramUsername').value);
        alert('Default service settings saved!');
    });
}

function loadWalletSettings() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="form-group"><label>Merchant Wallet Address</label>
        <textarea id="merchantAddress" rows="3" style="width:100%">${localStorage.getItem('merchantWalletAddress') || 'TXh8QpFqZ5zX7nL3mR9vK2wJ4bN6cM1aP0d'}</textarea>
        <button class="save-btn" id="saveWalletBtn">Save Wallet Address</button></div>
    `;
    document.getElementById('saveWalletBtn').addEventListener('click', function() {
        localStorage.setItem('merchantWalletAddress', document.getElementById('merchantAddress').value);
        alert('Wallet address saved!');
    });
}

// ============ INVITATION CODE MANAGEMENT ============

function loadInvitationCodes() {
    const adminType = localStorage.getItem('adminType');
    const adminId = localStorage.getItem('adminId');
    const adminName = localStorage.getItem('adminUsername');
    
    const today = new Date().toISOString().split('T')[0];
    let allCodes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    
    let displayCodes = [];
    if (adminType === 'master') {
        displayCodes = allCodes;
    } else {
        displayCodes = allCodes.filter(function(c) {
            return c.adminId === adminId;
        });
    }
    
    const todaysCode = displayCodes.find(function(c) {
        return c.date === today;
    });
    
    const content = document.getElementById('adminContent');
    
    let html = `
        <div style="margin-bottom: 30px; padding: 20px; background: rgba(255,215,0,0.1); border-radius: 16px; border: 1px solid rgba(255,215,0,0.3);">
            <h3 style="color: #ffd700; margin-bottom: 15px;">📋 Today's Invitation Code</h3>
            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1;">
                    <p><strong style="color:#888;">Date:</strong> ${today}</p>
                    <p><strong style="color:#888;">Current Code:</strong> <span style="color:#ffd700; font-size: 24px; font-weight: bold;">${todaysCode ? todaysCode.code : 'Not set'}</span></p>
                    <p><strong style="color:#888;">Assigned Admin:</strong> ${todaysCode ? todaysCode.adminName : 'None'}</p>
                </div>
                <div>
                    <button class="save-btn" id="generateCodeBtn">🔑 Generate New Code</button>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #ffd700;">📜 Invitation Code History</h3>
            <button class="edit-btn" id="showAllCodesBtn" style="margin-top: 10px;">Show All Codes</button>
        </div>
        
        <div id="codesList" style="display: none;">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr><th>Date</th><th>Invitation Code</th><th>Assigned Admin</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
    `;
    
    displayCodes.forEach(function(code) {
        html += `
            <tr>
                <td>${code.date}</td>
                <td><span style="color:#ffd700; font-weight: bold;">${code.code}</span></td>
                <td>${code.adminName}</td>
                <td>${code.active ? 'Active' : 'Expired'}</td>
                <td>
                    <button class="delete-btn" onclick="deactivateCode('${code.id}')">Deactivate</button>
                </td>
            </tr>
        `;
    });
    
    if (displayCodes.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; color: #888;">No invitation codes generated yet</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    
    document.getElementById('generateCodeBtn').addEventListener('click', generateInvitationCode);
    
    const showBtn = document.getElementById('showAllCodesBtn');
    if (showBtn) {
        showBtn.addEventListener('click', function() {
            const codesList = document.getElementById('codesList');
            if (codesList.style.display === 'none') {
                codesList.style.display = 'block';
                showBtn.textContent = 'Hide Codes';
            } else {
                codesList.style.display = 'none';
                showBtn.textContent = 'Show All Codes';
            }
        });
    }
    
    window.deactivateCode = deactivateCode;
}

function generateInvitationCode() {
    const adminId = localStorage.getItem('adminId');
    const adminName = localStorage.getItem('adminUsername');
    const today = new Date().toISOString().split('T')[0];
    
    let allCodes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    
    const existingCode = allCodes.find(function(c) {
        return c.date === today && c.adminId === adminId;
    });
    
    if (existingCode) {
        alert(`You already have an invitation code for today: ${existingCode.code}`);
        return;
    }
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const newCode = {
        id: 'CODE' + Date.now(),
        code: code,
        date: today,
        adminId: adminId,
        adminName: adminName,
        active: true,
        createdAt: new Date().toISOString()
    };
    
    allCodes.push(newCode);
    localStorage.setItem('dailyInvitationCodes', JSON.stringify(allCodes));
    
    alert(`Invitation code generated!\n\nCode: ${code}\nDate: ${today}\nValid for today only.`);
    
    loadInvitationCodes();
}

function deactivateCode(codeId) {
    if (!confirm('Deactivate this invitation code? It will no longer work for registration.')) return;
    
    let allCodes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
    allCodes = allCodes.map(function(c) {
        if (c.id === codeId) {
            c.active = false;
        }
        return c;
    });
    localStorage.setItem('dailyInvitationCodes', JSON.stringify(allCodes));
    
    loadInvitationCodes();
    alert('Code deactivated.');
}

// ============ MASTER ADMIN ONLY - ADMIN MANAGEMENT ============

function loadAdminManagement() {
    if (adminType !== 'master') {
        document.getElementById('adminContent').innerHTML = `
            <div style="text-align: center; padding: 50px; color: #ff6666;">
                <p>⛔ Access Denied</p>
                <p style="font-size: 12px; margin-top: 10px;">Only Master Admin can manage admin users.</p>
            </div>
        `;
        return;
    }
    
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const masterAdmin = JSON.parse(localStorage.getItem('masterAdmin') || '{}');
    
    const content = document.getElementById('adminContent');
    
    let html = `
        <div style="margin-bottom: 30px; padding: 20px; background: rgba(255,215,0,0.1); border-radius: 16px; border: 1px solid rgba(255,215,0,0.3);">
            <h3 style="color: #ffd700; margin-bottom: 10px;">👑 Master Admin</h3>
            <p><strong>Username:</strong> ${masterAdmin.username}</p>
            <p><strong>Email:</strong> ${masterAdmin.email}</p>
            <p><strong>Role:</strong> Master (Full Access + 2FA)</p>
            <button class="edit-btn" onclick="resetMasterPassword()" style="margin-top: 10px;">Reset Master Password</button>
            <button class="edit-btn" onclick="resetMaster2FA()" style="margin-top: 10px;">Reset 2FA Secret</button>
        </div>
        
        <div style="margin-bottom: 20px;">
            <button class="save-btn" id="createAdminBtn">+ Create New Sub Admin</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
    `;
    
    subAdmins.forEach(function(admin) {
        html += `
            <tr>
                <td>${admin.id}</td>
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td>Sub Admin</td>
                <td>${admin.created ? new Date(admin.created).toLocaleDateString() : 'Unknown'}</td>
                <td>
                    <button class="edit-btn" onclick="resetSubAdminPassword('${admin.id}')">Reset Password</button>
                    <button class="delete-btn" onclick="deleteSubAdmin('${admin.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    if (subAdmins.length === 0) {
        html += `<tr><td colspan="6" style="text-align: center; color: #888;">No sub admins created yet</td></tr>`;
    }
    
    html += `</tbody></table></div>`;
    content.innerHTML = html;
    
    document.getElementById('createAdminBtn').addEventListener('click', createSubAdmin);
    
    window.resetSubAdminPassword = resetSubAdminPassword;
    window.deleteSubAdmin = deleteSubAdmin;
    window.resetMasterPassword = resetMasterPassword;
    window.resetMaster2FA = resetMaster2FA;
}

function createSubAdmin() {
    const username = prompt('Enter sub admin username:');
    if (!username) return;
    
    const email = prompt('Enter sub admin email:');
    if (!email || !email.includes('@')) {
        alert('Invalid email');
        return;
    }
    
    const password = prompt('Enter password (min 4 characters):');
    if (!password || password.length < 4) {
        alert('Password must be at least 4 characters');
        return;
    }
    
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    
    const exists = subAdmins.find(function(a) {
        return a.username === username || a.email === email;
    });
    
    if (exists) {
        alert('Username or email already exists');
        return;
    }
    
    const newAdmin = {
        id: 'ADMIN' + Date.now(),
        username: username,
        email: email,
        password: password,
        role: 'sub',
        created: new Date().toISOString()
    };
    
    subAdmins.push(newAdmin);
    localStorage.setItem('adminUsers', JSON.stringify(subAdmins));
    
    alert(`Sub Admin created!\nUsername: ${username}\nEmail: ${email}\nPassword: ${password}`);
    loadAdminManagement();
}

function resetSubAdminPassword(adminId) {
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const admin = subAdmins.find(function(a) { return a.id === adminId; });
    
    if (!admin) return;
    
    const newPassword = prompt(`Reset password for ${admin.username}:`, 'newpassword123');
    if (newPassword && newPassword.length >= 4) {
        admin.password = newPassword;
        localStorage.setItem('adminUsers', JSON.stringify(subAdmins));
        alert(`Password reset for ${admin.username}. New password: ${newPassword}`);
    } else {
        alert('Password must be at least 4 characters');
    }
}

function deleteSubAdmin(adminId) {
    if (!confirm('Delete this sub admin? This cannot be undone.')) return;
    
    let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    subAdmins = subAdmins.filter(function(a) { return a.id !== adminId; });
    localStorage.setItem('adminUsers', JSON.stringify(subAdmins));
    
    alert('Sub admin deleted');
    loadAdminManagement();
}

function resetMasterPassword() {
    const newPassword = prompt('Enter new master password (min 4 characters):');
    if (!newPassword || newPassword.length < 4) {
        alert('Password must be at least 4 characters');
        return;
    }
    
    let masterAdmin = JSON.parse(localStorage.getItem('masterAdmin'));
    if (masterAdmin) {
        masterAdmin.password = newPassword;
        localStorage.setItem('masterAdmin', JSON.stringify(masterAdmin));
        alert(`Master password changed successfully!\nNew password: ${newPassword}`);
    }
}

function resetMaster2FA() {
    if (!confirm('Reset 2FA secret? You will need to set up Google Authenticator again.')) return;
    
    let masterAdmin = JSON.parse(localStorage.getItem('masterAdmin'));
    if (masterAdmin) {
        const newSecret = generateRandomSecret();
        masterAdmin.twoFASecret = newSecret;
        localStorage.setItem('masterAdmin', JSON.stringify(masterAdmin));
        
        alert(`2FA SECRET KEY (for Google Authenticator):\n${newSecret}\n\nSave this key! Test code: 123456`);
    }
}

function generateRandomSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
}