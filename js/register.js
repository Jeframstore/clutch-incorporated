// Registration Page - Complete

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
            const today = new Date().toISOString().split('T')[0];
            const codesSnap = await database.ref('invitationCodes').once('value');
            const codes = codesSnap.val() || {};
            
            let validCode = null;
            for (let id in codes) {
                const c = codes[id];
                if (c.code === inviteCode && c.date === today && c.active === true) {
                    validCode = c;
                    break;
                }
            }
            
            if (!validCode) { showError('Invalid or expired invitation code'); return; }
            
            const usersSnap = await database.ref('users').once('value');
            const users = usersSnap.val() || {};
            for (let id in users) {
                if (users[id].username === username || users[id].email === email) {
                    showError('Username or email already exists');
                    return;
                }
            }
            
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
                frozenAmount: '0',
                vip: 'VIP 1',
                status: 'active',
                joinedDate: today,
                invitedBy: validCode.adminName || 'master',
                phone: '',
                walletAddress: '',
                withdrawPassword: '',
                signInCount: 0,
                lastSignIn: '',
                completedTasks: 0,
                totalTasks: 40
            };
            
            await database.ref('users/' + userId).set(newUser);
            showSuccess('Registration successful! Please login.');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            
        } catch (error) {
            console.error(error);
            showError('Database error. Try again.');
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
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
}