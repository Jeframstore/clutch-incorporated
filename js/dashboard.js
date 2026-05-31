// Dashboard - Firebase Version

document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('usernameDisplay').textContent = username || 'User';
    
    if (userId) {
        await loadUserData(userId);
    }
    
    // Profile Menu
    const profileIcon = document.getElementById('profileIconBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileIcon && profileMenu) {
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', () => { profileMenu.style.display = 'none'; });
        
        document.getElementById('profileMenuItem').addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
        
        document.getElementById('logoutMenuItem').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
    
    // Menu buttons
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'service') window.location.href = 'service.html';
            if (page === 'withdraw') window.location.href = 'withdraw.html';
            if (page === 'deposit') window.location.href = 'deposit.html';
            if (page === 'terms') window.location.href = 'terms.html';
            if (page === 'certificate') window.location.href = 'certificate.html';
            if (page === 'faqs') window.location.href = 'faqs.html';
            if (page === 'about') window.location.href = 'about.html';
        });
    });
    
    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            if (page === 'starting') window.location.href = 'starting.html';
            if (page === 'records') window.location.href = 'records.html';
        });
    });
});

async function loadUserData(userId) {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        if (user) {
            localStorage.setItem('walletBalance', user.balance || '0');
            localStorage.setItem('commission', user.commission || '0');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}