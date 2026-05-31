// Withdraw Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadBalance();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    const submitBtn = document.getElementById('submitWithdrawBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitWithdrawRequest);
    }
});

function loadBalance() {
    let balance = localStorage.getItem('walletBalance');
    if (!balance) {
        balance = '0.00';
        localStorage.setItem('walletBalance', balance);
    }
    
    const balanceElement = document.getElementById('withdrawBalance');
    if (balanceElement) {
        balanceElement.textContent = parseFloat(balance).toFixed(2) + ' USDT';
    }
}

function submitWithdrawRequest() {
    const amount = document.getElementById('withdrawAmount').value;
    let balance = parseFloat(localStorage.getItem('walletBalance') || 0);
    
    removeMessages();
    
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    if (amount < 10) {
        showError('Minimum withdrawal is 10 USDT');
        return;
    }
    
    if (amount > balance) {
        showError('Insufficient balance. Your balance is ' + balance.toFixed(2) + ' USDT');
        return;
    }
    
    const withdrawalRequest = {
        id: 'WD' + Date.now(),
        amount: parseFloat(amount),
        status: 'pending',
        requestDate: new Date().toISOString(),
        username: localStorage.getItem('username') || 'User'
    };
    
    let pendingRequests = localStorage.getItem('pendingWithdrawals');
    if (pendingRequests) {
        pendingRequests = JSON.parse(pendingRequests);
    } else {
        pendingRequests = [];
    }
    
    pendingRequests.push(withdrawalRequest);
    localStorage.setItem('pendingWithdrawals', JSON.stringify(pendingRequests));
    
    showSuccess('Withdrawal request submitted! Amount: ' + amount + ' USDT');
    
    document.getElementById('withdrawAmount').value = '';
}

function showError(message) {
    const form = document.querySelector('.withdraw-form');
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
    const form = document.querySelector('.withdraw-form');
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