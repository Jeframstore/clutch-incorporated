// Change Password Page - Complete

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    const changeBtn = document.getElementById('changePasswordBtn');
    if (changeBtn) {
        changeBtn.addEventListener('click', changePassword);
    }
});

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    removeMessages();
    
    // Get stored password (default is '9630' for Jefram)
    const storedPassword = localStorage.getItem('userPassword') || '9630';
    
    if (!currentPassword) {
        showError('Please enter current password');
        return;
    }
    
    if (currentPassword !== storedPassword) {
        showError('Current password is incorrect');
        return;
    }
    
    if (!newPassword) {
        showError('Please enter new password');
        return;
    }
    
    if (newPassword.length < 4) {
        showError('New password must be at least 4 characters');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }
    
    // Save new password
    localStorage.setItem('userPassword', newPassword);
    
    showSuccess('Password changed successfully!');
    
    // Clear fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function showError(message) {
    const form = document.querySelector('.password-form');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.insertAdjacentElement('beforebegin', errorDiv);
    
    setTimeout(function() {
        const msg = document.querySelector('.error-message');
        if (msg) msg.remove();
    }, 5000);
}

function showSuccess(message) {
    const form = document.querySelector('.password-form');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.insertAdjacentElement('beforebegin', successDiv);
    
    setTimeout(function() {
        const msg = document.querySelector('.success-message');
        if (msg) msg.remove();
    }, 5000);
}

function removeMessages() {
    const errorMsg = document.querySelector('.error-message');
    const successMsg = document.querySelector('.success-message');
    if (errorMsg) errorMsg.remove();
    if (successMsg) successMsg.remove();
}

document.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const page = button.getAttribute('data-page');
        
        if (page === 'home') {
            window.location.href = 'dashboard.html';
        } else if (page === 'starting') {
            window.location.href = 'starting.html';
        } else if (page === 'records') {
            window.location.href = 'records.html';
        }
    });
});