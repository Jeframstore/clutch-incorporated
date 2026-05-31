// Dashboard - Complete with Fixed Sign-In

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('usernameDisplay').textContent = username || 'User';
    await loadUserData();
    
    // Profile Menu
    const profileIcon = document.getElementById('profileIconBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileIcon && profileMenu) {
        profileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        document.addEventListener('click', function() {
            profileMenu.style.display = 'none';
        });
        
        const profileMenuItem = document.getElementById('profileMenuItem');
        const logoutMenuItem = document.getElementById('logoutMenuItem');
        
        if (profileMenuItem) {
            profileMenuItem.addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
        }
        
        if (logoutMenuItem) {
            logoutMenuItem.addEventListener('click', function() {
                localStorage.clear();
                window.location.href = 'index.html';
            });
        }
    }
    
    // Menu buttons
    document.querySelectorAll('.menu-btn').forEach(function(btn) {
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
    
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            if (page === 'starting') window.location.href = 'starting.html';
            if (page === 'records') window.location.href = 'records.html';
        });
    });
});

async function loadUserData() {
    try {
        if (!userId) return;
        
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            // Update display
            document.getElementById('usernameDisplay').textContent = user.username;
            
            // Process sign-in streak
            const today = new Date().toISOString().split('T')[0];
            let streak = user.signInStreak || 0;
            let lastSignIn = user.lastSignIn || '';
            let baseSalary = user.baseSalary || 0;
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            // Check if user missed a day
            if (lastSignIn !== yesterdayStr && lastSignIn !== today && streak > 0) {
                streak = 0;
                baseSalary = 0;
                await database.ref('users/' + userId).update({
                    signInStreak: 0,
                    baseSalary: 0
                });
                console.log('Streak reset - missed a day');
            }
            
            // Check if signed in today
            if (lastSignIn !== today) {
                streak++;
                const rewards = {1: 300, 2: 150, 3: 500, 4: 1000, 5: 150, 6: 300, 7: 300, 8: 400, 9: 500, 10: 600, 11: 700, 12: 800, 13: 900, 14: 1000, 15: 1500};
                const todayReward = rewards[streak] || 0;
                baseSalary += todayReward;
                
                await database.ref('users/' + userId).update({
                    signInStreak: streak,
                    baseSalary: baseSalary,
                    lastSignIn: today
                });
                
                // Update display
                const baseSalaryElement = document.getElementById('baseSalary');
                if (baseSalaryElement) {
                    baseSalaryElement.textContent = baseSalary.toFixed(2);
                }
                
                const counterElement = document.querySelector('.signin-counter');
                if (counterElement) {
                    counterElement.textContent = `SIGN IN NOW (${streak}/15)`;
                }
                
                if (todayReward > 0) {
                    setTimeout(() => {
                        alert(`🎉 Daily sign-in reward: +${todayReward} USDT!\nStreak: ${streak} days\nTotal Base Salary: ${baseSalary.toFixed(2)} USDT`);
                    }, 500);
                }
            } else {
                // Update display with existing values
                const baseSalaryElement = document.getElementById('baseSalary');
                if (baseSalaryElement) {
                    baseSalaryElement.textContent = baseSalary.toFixed(2);
                }
                
                const counterElement = document.querySelector('.signin-counter');
                if (counterElement) {
                    counterElement.textContent = `SIGN IN NOW (${streak}/15)`;
                }
            }
            
            localStorage.setItem('walletBalance', user.balance || '0');
            localStorage.setItem('commission', user.commission || '0');
            localStorage.setItem('userInviteCode', user.inviteCode || '');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}