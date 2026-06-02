// Dashboard - Complete with Fixed Sign-In

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = sessionStorage.getItem('userId');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userId) {
        window.location.href = 'index.html';
        return;
    }
    
    attachUserDataListener();
    
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
    }
    
    const profileMenuItem = document.getElementById('profileMenuItem');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    
    if (profileMenuItem) {
        profileMenuItem.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    if (logoutMenuItem) {
        logoutMenuItem.addEventListener('click', logout);
    }
    
    // Menu button navigation
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'service') window.location.href = 'service.html';
            else if (page === 'withdraw') window.location.href = 'withdraw.html';
            else if (page === 'deposit') window.location.href = 'deposit.html';
            else if (page === 'trading') window.location.href = 'trading.html';
            else if (page === 'terms') window.location.href = 'terms.html';
            else if (page === 'certificate') window.location.href = 'certificate.html';
            else if (page === 'faqs') window.location.href = 'faqs.html';
            else if (page === 'about') window.location.href = 'about.html';
        });
    });
    
    // Bottom navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'home') window.location.href = 'dashboard.html';
            else if (page === 'starting') window.location.href = 'starting.html';
            else if (page === 'records') window.location.href = 'records.html';
        });
    });
});

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function attachUserDataListener() {
    try {
        if (!userId) return;

        database.ref('users/' + userId).on('value', async function(snapshot) {
            const user = snapshot.val();

        if (user) {
            // Update display from Firebase
            const usernameDisplay = document.getElementById('usernameDisplay');
            if (usernameDisplay) {
                usernameDisplay.textContent = user.username || 'User';
            }

            const totalBalanceDisplay = document.getElementById('totalBalanceDisplay');
            if (totalBalanceDisplay) {
                totalBalanceDisplay.textContent = parseFloat(user.balance || 0).toFixed(2);
            }
            
            // Process sign-in streak
            const today = new Date().toISOString().split('T')[0];
            let streak = user.signInStreak || 0;
            let lastSignIn = user.lastSignIn || '';
            let baseSalary = parseFloat(user.baseSalary || 0);
            
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
            
            // Check if completed 15 days - payout and reset
            if (streak >= 15 && lastSignIn !== today) {
                // Add base salary to balance
                const currentBalance = parseFloat(user.balance || 0);
                await database.ref('users/' + userId).update({
                    balance: currentBalance + baseSalary,
                    signInStreak: 0,
                    baseSalary: 0
                });
                streak = 0;
                baseSalary = 0;
                console.log('15 days completed - payout and reset');
            }
            
            // Check if signed in today
            if (lastSignIn !== today) {
                streak++;
                // Reward formula: +150 day 1, +50 each day for 15 days
                const todayReward = streak <= 15 ? (streak === 1 ? 150 : 50) : 0;
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
        }
        });
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}
