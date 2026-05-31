// Profile Page - Firebase Version

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    await loadProfile();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'dashboard.html');
    
    document.getElementById('depositBtn').addEventListener('click', () => window.location.href = 'deposit.html');
    document.getElementById('withdrawBtn').addEventListener('click', () => window.location.href = 'withdraw.html');
    document.getElementById('changePasswordBtn').addEventListener('click', () => window.location.href = 'change-password.html');
    document.getElementById('bindWalletBtn').addEventListener('click', () => window.location.href = 'bind-wallet.html');
    document.getElementById('contactUsBtn').addEventListener('click', () => window.location.href = 'service.html');
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});

async function loadProfile() {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            document.getElementById('profileUserName').textContent = user.username;
            document.getElementById('inviteCode').textContent = user.inviteCode || 'N/A';
            document.getElementById('profileBalance').textContent = parseFloat(user.balance || 0).toFixed(2) + ' USDT';
            document.getElementById('profileProfits').textContent = parseFloat(user.commission || 0).toFixed(2) + ' USDT';
            document.getElementById('creditScore').textContent = '97%';
            
            localStorage.setItem('userInviteCode', user.inviteCode);
            localStorage.setItem('walletBalance', user.balance);
            localStorage.setItem('commission', user.commission);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        if (page === 'home') window.location.href = 'dashboard.html';
        if (page === 'starting') window.location.href = 'starting.html';
        if (page === 'records') window.location.href = 'records.html';
    });
});