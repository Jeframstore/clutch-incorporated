// Dashboard - Complete with Fixed Sign-In

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = sessionStorage.getItem('userId');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userId) {
        window.location.href = 'index.html';
        return;
    }
    
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
        
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

async function loadUserData() {
    try {
        if (!userId) return;
        
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            // Update display from Firebase
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
                // Linear reward formula: 150 USDT day 1, +50 USDT per day, max 15 days
                const todayReward = streak <= 15 ? (150 + (streak - 1) * 50) : 0;
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
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}


function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}