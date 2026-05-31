// Login Page - Firebase Version

if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const identifier = document.getElementById('loginIdentifier').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        removeMessages();
        
        try {
            // Check Master Admin
            const masterSnapshot = await database.ref('admins/master').once('value');
            const master = masterSnapshot.val();
            
            if (master && (identifier === master.username || identifier === master.email) && password === master.password) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminType', 'master');
                localStorage.setItem('adminUsername', master.username);
                localStorage.setItem('adminId', 'master');
                window.location.href = 'admin-dashboard.html';
                return;
            }
            
            // Check Sub Admins
            const subSnapshot = await database.ref('admins/sub').once('value');
            const subs = subSnapshot.val() || {};
            for (let id in subs) {
                const admin = subs[id];
                if ((admin.username === identifier || admin.email === identifier) && admin.password === password) {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    localStorage.setItem('adminType', 'sub');
                    localStorage.setItem('adminUsername', admin.username);
                    localStorage.setItem('adminId', id);
                    window.location.href = 'admin-dashboard.html';
                    return;
                }
            }
            
            // Check Regular Users
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            let foundUser = null;
            let foundUserId = null;
            
            for (let id in users) {
                const user = users[id];
                if ((user.username === identifier || user.email === identifier) && user.password === password) {
                    foundUser = user;
                    foundUserId = id;
                    break;
                }
            }
            
            if (foundUser) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', foundUser.username);
                localStorage.setItem('userEmail', foundUser.email);
                localStorage.setItem('userId', foundUserId);
                localStorage.setItem('userInviteCode', foundUser.inviteCode || '');
                localStorage.setItem('walletBalance', foundUser.balance || '0');
                localStorage.setItem('commission', foundUser.commission || '0');
                window.location.href = 'dashboard.html';
            } else {
                showError('Invalid username/email or password');
                document.getElementById('loginPassword').value = '';
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Database error. Please try again.');
        }
    });
}

function showError(message) {
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        loginCard.appendChild(errorDiv);
    }
}

function removeMessages() {
    const errorMsg = document.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
}