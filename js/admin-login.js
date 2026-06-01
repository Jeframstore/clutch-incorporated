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
            
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            sessionStorage.setItem('adminType', 'master');
            sessionStorage.setItem('adminUsername', 'master');
            sessionStorage.setItem('adminId', 'master');
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // Sub Admins - Firebase
        database.ref('admins/sub').once('value').then(function(snapshot) {
            const subAdmins = snapshot.val() || {};
            let foundSubAdmin = null;
            let foundSubAdminId = null;
            
            for (let id in subAdmins) {
                const admin = subAdmins[id];
                if ((admin.username === identifier || admin.email === identifier) && admin.password === password) {
                    foundSubAdmin = admin;
                    foundSubAdminId = id;
                    break;
                }
            }
            
            if (foundSubAdmin) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                sessionStorage.setItem('adminType', 'sub');
                sessionStorage.setItem('adminUsername', foundSubAdmin.username);
                sessionStorage.setItem('adminId', foundSubAdminId);
                window.location.href = 'admin-dashboard.html';
            } else {
                showMessage('Invalid admin credentials', 'error');
            }
        }).catch(function(error) {
            console.error('Error checking sub admins:', error);
            showMessage('Database error. Please try again.', 'error');
        });
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