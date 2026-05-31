// Registration Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inviteCode = document.getElementById('regInviteCode').value.trim().toUpperCase();
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        removeMessages();
        
        if (!inviteCode) {
            showError('Invitation code is required');
            return;
        }
        
        if (!username || username.length < 3) {
            showError('Username must be at least 3 characters');
            return;
        }
        
        if (!email || !email.includes('@')) {
            showError('Please enter a valid email address');
            return;
        }
        
        if (!password || password.length < 4) {
            showError('Password must be at least 4 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        // Check invitation code
        const today = new Date().toISOString().split('T')[0];
        const validCodes = JSON.parse(localStorage.getItem('dailyInvitationCodes') || '[]');
        const isValidCode = validCodes.find(function(c) {
            return c.code === inviteCode && c.date === today && c.active === true;
        });
        
        if (!isValidCode) {
            showError('Invalid or expired invitation code. Please contact your admin.');
            return;
        }
        
        // Get existing users
        let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Check if username or email already exists
        const userExists = users.find(function(u) {
            return u.username === username || u.email === email;
        });
        
        if (userExists) {
            showError('Username or email already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'UID' + Date.now(),
            username: username,
            email: email,
            password: password,
            inviteCode: inviteCode,
            assignedAdminId: isValidCode.adminId,
            assignedAdminName: isValidCode.adminName,
            balance: '0.00',
            commission: '0.00',
            frozenAmount: '0',
            vip: 'VIP 1',
            status: 'active',
            joinedDate: today,
            invitedBy: isValidCode.adminName,
            phone: '',
            walletAddress: '',
            withdrawPassword: '',
            signInCount: 0,
            lastSignIn: ''
        };
        
        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        showSuccess('Registration successful! Please login.');
        
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 2000);
    });
});

function showError(message) {
    const form = document.getElementById('registerForm');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.appendChild(errorDiv);
}

function showSuccess(message) {
    const form = document.getElementById('registerForm');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.appendChild(successDiv);
}

function removeMessages() {
    const errors = document.querySelectorAll('.error-message, .success-message');
    errors.forEach(function(el) {
        el.remove();
    });
}