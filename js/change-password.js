// Change Password Page - Firebase Version

let userId = null;

document.addEventListener('DOMContentLoaded', function() {
    userId = sessionStorage.getItem('userId');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'profile.html');
    
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
});

async function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    removeMessages();
    
    if (!current) { showError('Current password required'); return; }
    if (!newPass || newPass.length < 4) { showError('New password (min 4 characters)'); return; }
    if (newPass !== confirm) { showError('Passwords do not match'); return; }
    
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (current !== user.password) {
            showError('Current password incorrect');
            return;
        }
        
        await database.ref('users/' + userId).update({ password: newPass });
        showSuccess('Password changed successfully!');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (error) {
        showError('Database error');
    }
}

function showError(msg) {
    const form = document.querySelector('.password-form');
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    form.insertAdjacentElement('beforebegin', div);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(msg) {
    const form = document.querySelector('.password-form');
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = msg;
    form.insertAdjacentElement('beforebegin', div);
    setTimeout(() => div.remove(), 5000);
}

function removeMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        if (page === 'home') window.location.href = 'dashboard.html';
        if (page === 'starting') window.location.href = 'starting.html';
        if (page === 'records') window.location.href = 'records.html';
    });
});