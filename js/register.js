// Registration Page - Complete

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        removeMessages();
        
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
            balance: '0.00',
            commission: '0.00',
            frozenAmount: '0',
            vip: 'VIP 1',
            status: 'active',
            joinedDate: new Date().toISOString().split('T')[0],
            emailVerified: false
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