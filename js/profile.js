// Profile Page - Complete with Invitation Code

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    const username = localStorage.getItem('username') || 'Jefram';
    const inviteCode = localStorage.getItem('userInviteCode') || 'A4832E73';
    
    document.getElementById('profileUserName').textContent = username;
    document.getElementById('inviteCode').textContent = inviteCode;
    
    let balance = localStorage.getItem('walletBalance');
    if (!balance) {
        balance = '0.00';
        localStorage.setItem('walletBalance', balance);
    }
    document.getElementById('profileBalance').textContent = parseFloat(balance).toFixed(2) + ' USDT';
    
    let profits = localStorage.getItem('commission');
    if (!profits) {
        profits = '0.00';
        localStorage.setItem('commission', profits);
    }
    document.getElementById('profileProfits').textContent = parseFloat(profits).toFixed(2) + ' USDT';
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    document.getElementById('depositBtn').addEventListener('click', function() {
        window.location.href = 'deposit.html';
    });
    
    document.getElementById('withdrawBtn').addEventListener('click', function() {
        window.location.href = 'withdraw.html';
    });
    
    document.getElementById('changePasswordBtn').addEventListener('click', function() {
        window.location.href = 'change-password.html';
    });
    
    document.getElementById('bindWalletBtn').addEventListener('click', function() {
        window.location.href = 'bind-wallet.html';
    });
    
    document.getElementById('contactUsBtn').addEventListener('click', function() {
        window.location.href = 'service.html';
    });
    
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInviteCode');
        localStorage.removeItem('walletBalance');
        localStorage.removeItem('commission');
        window.location.href = 'index.html';
    });
});

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