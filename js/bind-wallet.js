// Bind Wallet Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserData();
    loadSavedData();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    const submitBtn = document.getElementById('submitBindBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitBindWallet);
    }
});

function loadUserData() {
    const username = localStorage.getItem('username') || 'Collins';
    document.getElementById('userName').textContent = username + ' - VIP 1';
    
    let balance = localStorage.getItem('walletBalance');
    if (!balance) {
        balance = '0.00';
        localStorage.setItem('walletBalance', balance);
    }
    document.getElementById('accountBalance').textContent = parseFloat(balance).toFixed(2) + ' USDT';
    
    let profits = localStorage.getItem('commission');
    if (!profits) {
        profits = '0.00';
        localStorage.setItem('commission', profits);
    }
    document.getElementById('totalProfits').textContent = parseFloat(profits).toFixed(2) + ' USDT';
    
    const inviteCode = localStorage.getItem('userInviteCode') || 'A4832E73';
    document.getElementById('inviteCode').textContent = inviteCode;
}

function loadSavedData() {
    const savedPhone = localStorage.getItem('userPhoneNumber');
    const savedWallet = localStorage.getItem('userWalletAddress');
    
    if (savedPhone) {
        document.getElementById('phoneNumber').value = savedPhone;
    }
    if (savedWallet) {
        document.getElementById('walletAddress').value = savedWallet;
    }
}

function submitBindWallet() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const walletAddress = document.getElementById('walletAddress').value.trim();
    const withdrawPassword = document.getElementById('withdrawPassword').value;
    
    removeMessages();
    
    if (!phoneNumber) {
        showError('Please enter your phone number with country code');
        return;
    }
    
    if (!walletAddress) {
        showError('Please enter your USDT wallet address');
        return;
    }
    
    if (walletAddress.length < 20) {
        showError('Please enter a valid USDT wallet address');
        return;
    }
    
    if (!withdrawPassword) {
        showError('Please set your withdraw password');
        return;
    }
    
    if (withdrawPassword.length < 4) {
        showError('Withdraw password must be at least 4 characters');
        return;
    }
    
    localStorage.setItem('userPhoneNumber', phoneNumber);
    localStorage.setItem('userWalletAddress', walletAddress);
    localStorage.setItem('withdrawPassword', withdrawPassword);
    
    showSuccess('Wallet address and withdraw password saved successfully!');
    
    document.getElementById('withdrawPassword').value = '';
}

function showError(message) {
    const form = document.querySelector('.bind-form');
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
    const form = document.querySelector('.bind-form');
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