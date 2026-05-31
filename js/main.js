// Login Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const identifier = document.getElementById('loginIdentifier').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            removeMessages();
            
            // Get registered users
            let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            // Check admin
            const masterAdmin = { username: 'master', email: 'admin@clutch.com', password: 'Master@2024' };
            const subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
            
            // Check master admin
            if ((identifier === masterAdmin.username || identifier === masterAdmin.email) && password === masterAdmin.password) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminType', 'master');
                localStorage.setItem('adminUsername', masterAdmin.username);
                window.location.href = 'admin-dashboard.html';
                return;
            }
            
            // Check sub admins
            const subAdmin = subAdmins.find(function(a) {
                return (a.username === identifier || a.email === identifier) && a.password === password;
            });
            
            if (subAdmin) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminType', 'sub');
                localStorage.setItem('adminUsername', subAdmin.username);
                window.location.href = 'admin-dashboard.html';
                return;
            }
            
            // Check regular users
            const user = users.find(function(u) {
                return (u.username === identifier || u.email === identifier) && u.password === password;
            });
            
            if (user) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', user.username);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userId', user.id);
                localStorage.setItem('userInviteCode', user.inviteCode);
                localStorage.setItem('walletBalance', user.balance);
                localStorage.setItem('commission', user.commission);
                window.location.href = 'dashboard.html';
            } else {
                showError('Invalid username/email or password');
                document.getElementById('loginPassword').value = '';
            }
        });
    }
});

function showError(message) {
    const loginCard = document.querySelector('.login-card');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    loginCard.appendChild(errorDiv);
}

function removeMessages() {
    const errorMsg = document.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
}