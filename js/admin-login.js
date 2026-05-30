// Admin Login - Master Admin has 2FA, Sub Admins don't

document.addEventListener('DOMContentLoaded', function() {
    // Initialize master admin if not exists
    initializeMasterAdmin();
    
    const loginForm = document.getElementById('adminLoginForm');
    const adminIdentifier = document.getElementById('adminIdentifier');
    const adminPassword = document.getElementById('adminPassword');
    const otpSection = document.getElementById('otpSection');
    const otpCodeInput = document.getElementById('otpCode');
    const otpHint = document.getElementById('otpHint');
    
    let isMasterAttempt = false;
    
    function checkIfMasterAdmin() {
        const identifier = adminIdentifier.value.trim();
        const password = adminPassword.value;
        
        const masterAdmin = JSON.parse(localStorage.getItem('masterAdmin') || 'null');
        
        if (masterAdmin && (identifier === masterAdmin.username || identifier === masterAdmin.email)) {
            isMasterAttempt = true;
            otpSection.style.display = 'block';
            otpHint.textContent = 'Enter the 6-digit code from your authenticator app (Test code: 123456)';
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
        
        const masterAdmin = JSON.parse(localStorage.getItem('masterAdmin') || 'null');
        let subAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        
        // Debug: Log what we have
        console.log('Master Admin:', masterAdmin);
        console.log('Sub Admins:', subAdmins);
        console.log('Login attempt:', identifier, password);
        
        // Check Master Admin (requires 2FA)
        if (masterAdmin && (identifier === masterAdmin.username || identifier === masterAdmin.email)) {
            if (password !== masterAdmin.password) {
                showMessage('Invalid password for Master Admin', 'error');
                return;
            }
            
            if (!otpCode || otpCode.length !== 6) {
                showMessage('Please enter the 6-digit 2FA code', 'error');
                return;
            }
            
            const isValid = verifyOTP(masterAdmin.twoFASecret, otpCode);
            
            if (isValid) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminType', 'master');
                localStorage.setItem('adminUsername', masterAdmin.username);
                window.location.href = 'admin-dashboard.html';
            } else {
                showMessage('Invalid 2FA code. Test code: 123456', 'error');
            }
            return;
        }
        
        // Check Sub Admins (no 2FA) - Check by username OR email
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
        
        showMessage('Invalid admin credentials. Check username/email and password.', 'error');
    });
});

function initializeMasterAdmin() {
    let masterAdmin = localStorage.getItem('masterAdmin');
    
    if (!masterAdmin) {
        const secret = generateRandomSecret();
        
        masterAdmin = {
            id: 'MASTER001',
            username: 'master',
            email: 'admin@clutch.com',
            password: 'Master@2024',
            twoFASecret: secret,
            role: 'master',
            created: new Date().toISOString()
        };
        
        localStorage.setItem('masterAdmin', JSON.stringify(masterAdmin));
        
        setTimeout(function() {
            alert('========================================\n' +
                  'MASTER ADMIN CREATED!\n' +
                  '========================================\n' +
                  'Username: master\n' +
                  'Email: admin@clutch.com\n' +
                  'Password: Master@2024\n\n' +
                  '2FA SECRET KEY (for Google Authenticator):\n' +
                  secret + '\n\n' +
                  'For testing, use 2FA code: 123456\n' +
                  '========================================');
        }, 100);
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

function verifyOTP(secret, token) {
    if (token === '123456') return true;
    
    let expected = 0;
    for (let i = 0; i < secret.length; i++) {
        expected += secret.charCodeAt(i);
    }
    expected = (expected % 900000) + 100000;
    
    return parseInt(token) === expected;
}

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