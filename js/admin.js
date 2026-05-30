// Admin Login - Complete

document.addEventListener('DOMContentLoaded', function() {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    const loginForm = document.getElementById('adminLoginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        if (username === adminUsername && password === adminPassword) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin-dashboard.html';
        } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Invalid admin credentials';
            loginForm.appendChild(errorDiv);
        }
    });
});