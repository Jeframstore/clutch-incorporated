// Bind Wallet Page - Firebase Version

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = sessionStorage.getItem('userId');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    await loadUserData();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'profile.html');
    
    document.getElementById('submitBindBtn').addEventListener('click', saveWallet);
});

async function loadUserData() {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        document.getElementById('userName').textContent = (user?.username || 'User') + ' - VIP 1';
        document.getElementById('accountBalance').textContent = parseFloat(user?.balance || 0).toFixed(2) + ' USDT';
        document.getElementById('totalProfits').textContent = parseFloat(user?.commission || 0).toFixed(2) + ' USDT';
        document.getElementById('inviteCode').textContent = user?.inviteCode || 'N/A';
        
        if (user?.phone) document.getElementById('phoneNumber').value = user.phone;
        if (user?.walletAddress) document.getElementById('walletAddress').value = user.walletAddress;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function saveWallet() {
    const phone = document.getElementById('phoneNumber').value.trim();
    const wallet = document.getElementById('walletAddress').value.trim();
    const password = document.getElementById('withdrawPassword').value;
    
    removeMessages();
    
    if (!phone) { showError('Phone number required'); return; }
    if (!wallet || wallet.length < 20) { showError('Valid wallet address required'); return; }
    if (!password || password.length < 4) { showError('Withdraw password (min 4 characters)'); return; }
    
    try {
        await database.ref('users/' + userId).update({
            phone: phone,
            walletAddress: wallet,
            withdrawPassword: password
        });
        showSuccess('Wallet address and password saved!');
        document.getElementById('withdrawPassword').value = '';
    } catch (error) {
        showError('Database error');
    }
}

function showError(msg) {
    const form = document.querySelector('.bind-form');
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    form.insertAdjacentElement('beforebegin', div);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(msg) {
    const form = document.querySelector('.bind-form');
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