// Withdraw Page\nimport { database } from './firebase-config.js'; - Firebase Version

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = sessionStorage.getItem('userId');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    attachBalanceListener();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'dashboard.html');
    
    const submitBtn = document.getElementById('submitWithdrawBtn');
    if (submitBtn) submitBtn.addEventListener('click', submitWithdraw);
});

function attachBalanceListener() {
    try {
        database.ref('users/' + userId + '/balance').on('value', function(snapshot) {
            const balance = parseFloat(snapshot.val() || 0).toFixed(2);
            document.getElementById('withdrawBalance').textContent = balance + ' USDT';
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('withdrawBalance').textContent = '0.00 USDT';
    }
}

async function submitWithdraw() {
    const amount = document.getElementById('withdrawAmount').value;
    removeMessages();
    
    if (!amount || amount <= 0) { showError('Enter valid amount'); return; }
    if (amount < 10) { showError('Minimum 10 USDT'); return; }
    
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        const balance = parseFloat(user?.balance || 0);
        
        if (parseFloat(amount) > balance) {
            showError('Insufficient balance. Balance: ' + balance.toFixed(2) + ' USDT');
            return;
        }
        
        const withdrawId = 'WD' + Date.now();
        const withdrawData = {
            id: withdrawId,
            userId: userId,
            username: user.username,
            amount: parseFloat(amount),
            status: 'pending',
            requestDate: new Date().toISOString(),
            walletAddress: user.walletAddress || ''
        };
        
        await database.ref('withdrawals/' + withdrawId).set(withdrawData);
        showSuccess('Withdrawal request submitted! Amount: ' + amount + ' USDT');
        document.getElementById('withdrawAmount').value = '';
        
    } catch (error) {
        console.error('Error:', error);
        showError('Database error. Try again.');
    }
}

function showError(msg) {
    const form = document.querySelector('.withdraw-form');
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    form.insertAdjacentElement('beforebegin', div);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(msg) {
    const form = document.querySelector('.withdraw-form');
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
