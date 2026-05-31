// Admin Login - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const adminIdentifier = document.getElementById('adminIdentifier');
    const adminPassword = document.getElementById('adminPassword');
    const otpSection = document.getElementById('otpSection');
    const otpCodeInput = document.getElementById('otpCode');
    const otpHint = document.getElementById('otpHint');
    
    let isMasterAttempt = false;
    
    function checkIfMasterAdmin() {
        const identifier = adminIdentifier.value.trim();
        
        if (identifier === 'master' || identifier === 'admin@clutch.com') {
            isMasterAttempt = true;
            otpSection.style.display = 'block';
            otpHint.textContent = 'Test 2FA Code: 123456';
            otpCodeInput.required = true;
        } else {
            isMasterAttempt = false;
            otpSection.style.display = 'none';
            otpCodeInput.required = false;
            otpCodeInput.value = '';
        }
    }
    
    adminIdentifier.addEventListener('input', checkIfMasterAdmin);
    adminPassword.addEventListener('input', checkIfMasterAdmin);
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const identifier = adminIdentifier.value.trim();
        const password = adminPassword.value;
        const otpCode = otpCodeInput.value;
        
        removeMessage();
        
        // Master Admin
        if ((identifier === 'master' || identifier === 'admin@clutch.com') && password === 'Master@2024') {
            if (otpCode !== '123456') {
                showMessage('Invalid 2FA code. Use: 123456', 'error');
                return;
            }
            
            localStorage.setItem('isAdminLoggedIn', 'true');
            localStorage.setItem('adminType', 'master');
            localStorage.setItem('adminUsername', 'master');
            localStorage.setItem('adminId', 'master');
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // Sub Admins
        let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const subAdmin = subAdmins.find(function(a) {
            return (a.username === identifier || a.email === identifier) && a.password === password;
        });
        
        if (subAdmin) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            localStorage.setItem('adminType', 'sub');
            localStorage.setItem('adminUsername', subAdmin.username);
            localStorage.setItem('adminId', subAdmin.id);
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        showMessage('Invalid admin credentials', 'error');
    });
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    messageDiv.innerHTML = `<div class="${type === 'error' ? 'error-message' : 'success-message'}">${message}</div>`;
    setTimeout(function() {
        messageDiv.innerHTML = '';
    }, 5000);
}

function removeMessage() {
    const messageDiv = document.getElementById('loginMessage');
    messageDiv.innerHTML = '';
}