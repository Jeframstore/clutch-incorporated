// Registration Page - Firebase Version

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const inviteCode = document.getElementById('regInviteCode').value.trim().toUpperCase();
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        removeMessages();
        
        if (!inviteCode) { showError('Invitation code required'); return; }
        if (!username || username.length < 3) { showError('Username must be 3+ characters'); return; }
        if (!email || !email.includes('@')) { showError('Valid email required'); return; }
        if (!password || password.length < 4) { showError('Password must be 4+ characters'); return; }
        if (password !== confirmPassword) { showError('Passwords do not match'); return; }
        
        try {
            // Check invitation code
            const today = new Date().toISOString().split('T')[0];
            const codesSnapshot = await database.ref('invitationCodes').once('value');
            const codes = codesSnapshot.val() || {};
            
            let validCode = null;
            for (let id in codes) {
                const code = codes[id];
                if (code.code === inviteCode && code.date === today && code.active === true) {
                    validCode = code;
                    break;
                }
            }
            
            if (!validCode) {
                showError('Invalid or expired invitation code');
                return;
            }
            
            // Check if user exists
            const usersSnapshot = await database.ref('users').once('value');
            const users = usersSnapshot.val() || {};
            for (let id in users) {
                if (users[id].username === username || users[id].email === email) {
                    showError('Username or email already exists');
                    return;
                }
            }
            
            // Create new user
            const userId = 'UID' + Date.now();
            const newUser = {
                username: username,
                email: email,
                password: password,
                inviteCode: inviteCode,
                assignedAdminId: validCode.adminId || 'master',
                assignedAdminName: validCode.adminName || 'master',
                balance: '0.00',
                commission: '0.00',
                baseSalary: '0.00',
                frozenAmount: '0',
                vip: 'VIP 1',
                status: 'active',
                joinedDate: today,
                invitedBy: validCode.adminName || 'master',
                phone: '',
                walletAddress: '',
                withdrawPassword: '',
                signInStreak: 0,
                lastSignIn: ''
            };
            
            await database.ref('users/' + userId).set(newUser);

            // Send welcome email
            try {
                const emailTemplateSnap = await database.ref('settings/emailTemplates/welcome').once('value');
                const emailTemplate = emailTemplateSnap.val();
                const customMessage = emailTemplate ? emailTemplate.body : 'Welcome to Clutch Incorporated! Your account has been successfully created.';

                await sendWelcomeEmail(email, username, inviteCode, userId, customMessage);
            } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
                // Continue with registration even if email fails
            }

            showSuccess('Registration successful! Please login.');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            showError('Database error: ' + error.message);
        }
    });
});

function showError(msg) {
    const form = document.getElementById('registerForm');
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    form.appendChild(div);
}

function showSuccess(msg) {
    const form = document.getElementById('registerForm');
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = msg;
    form.appendChild(div);
}

function removeMessages() {
    const msgs = document.querySelectorAll('.error-message, .success-message');
    msgs.forEach(el => el.remove());
}
