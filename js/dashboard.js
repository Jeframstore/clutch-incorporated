// Dashboard - User Data and Records Only

let userId = null;
let signInStreak = 0;

document.addEventListener('DOMContentLoaded', async function() {
    userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
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
    
    // Load records
    loadRecords();
});

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Display 15-day sign-in rewards cards
function displaySignInRewards(completedDays) {
    const container = document.getElementById('signinRewardsContainer');
    if (!container) return;
    
    const rewards = [];
    let amount = 50;
    for (let i = 1; i <= 15; i++) {
        rewards.push({ day: i, amount: amount });
        amount += 50;
    }
    
    container.innerHTML = '';
    
    for (const reward of rewards) {
        const isCompleted = reward.day <= completedDays;
        const card = document.createElement('div');
        card.className = 'reward-day-card';
        if (isCompleted) {
            card.classList.add('completed');
        }
        card.innerHTML = `
            <div class="reward-day-number">${reward.day}</div>
            <div class="reward-day-amount">${reward.amount} USDT</div>
            ${isCompleted ? '<div class="reward-tick">✓</div>' : ''}
        `;
        container.appendChild(card);
    }
}

async function loadUserData() {
    try {
        if (!userId) return;
        
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            const usernameDisplay = document.getElementById('usernameDisplay');
            if (usernameDisplay) {
                usernameDisplay.textContent = user.username || 'User';
            }
            
            const today = new Date().toISOString().split('T')[0];
            let streak = user.signInStreak || 0;
            let lastSignIn = user.lastSignIn || '';
            let frozenBonus = user.frozenBonus || 0;
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            // Check if user missed a day - RESET EVERYTHING TO 0
            if (lastSignIn !== yesterdayStr && lastSignIn !== today && streak > 0) {
                streak = 0;
                frozenBonus = 0;
                await database.ref('users/' + userId).update({ 
                    signInStreak: 0, 
                    frozenBonus: 0,
                    lastSignIn: null
                });
                console.log('Streak reset - missed a day. Bonus reset to 0.');
            }
            
            // Check if completed 15 days - pay out frozen bonus
            if (streak >= 15 && lastSignIn !== today) {
                const currentBalance = parseFloat(user.balance || 0);
                await database.ref('users/' + userId).update({
                    balance: currentBalance + frozenBonus,
                    signInStreak: 0,
                    frozenBonus: 0,
                    lastSignIn: today
                });
                console.log('15 days completed! Paid out frozen bonus:', frozenBonus);
                streak = 0;
                frozenBonus = 0;
            }
            
            // Update sign-in bonus display (always show current frozen bonus)
            const signinBonusEl = document.getElementById('signinBonus');
            if (signinBonusEl) {
                signinBonusEl.textContent = frozenBonus.toFixed(2) + ' USDT';
            }
            
            // Update counter display
            const counterElement = document.querySelector('.signin-counter');
            if (counterElement) {
                counterElement.textContent = `SIGN IN NOW (${streak}/15)`;
            }
            
            // Process today's sign-in (only if not signed in today)
            if (lastSignIn !== today) {
                streak++;
                
                // Calculate today's reward (Day 1 = 50, Day 2 = 100, etc.)
                const todayReward = 50 + ((streak - 1) * 50);
                frozenBonus += todayReward;
                
                await database.ref('users/' + userId).update({
                    signInStreak: streak,
                    frozenBonus: frozenBonus,
                    lastSignIn: today
                });
                
                // Update display after adding reward
                if (signinBonusEl) {
                    signinBonusEl.textContent = frozenBonus.toFixed(2) + ' USDT';
                }
                if (counterElement) {
                    counterElement.textContent = `SIGN IN NOW (${streak}/15)`;
                }
                
                if (todayReward > 0) {
                    setTimeout(() => {
                        alert(`🎉 Daily sign-in reward: +${todayReward} USDT added to frozen bonus!\nStreak: ${streak} days\nFrozen Bonus: ${frozenBonus.toFixed(2)} USDT\n(Will be paid out after 15 days)`);
                    }, 500);
                }
            }
            
            // Display the 15-day rewards cards
            displaySignInRewards(streak);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadRecords() {
    const tbody = document.getElementById('recordsBody');
    if (!tbody) return;
    
    try {
        const withdrawalsSnap = await database.ref('withdrawals').once('value');
        const depositsSnap = await database.ref('deposits').once('value');
        const withdrawals = withdrawalsSnap.val() || {};
        const deposits = depositsSnap.val() || {};
        
        let records = [];
        
        for (let id in withdrawals) {
            const w = withdrawals[id];
            if (w.userId === userId) {
                records.push({
                    type: 'Withdraw',
                    amount: '-' + w.amount + ' USDT',
                    status: w.status,
                    date: new Date(w.requestDate).toLocaleDateString()
                });
            }
        }
        
        for (let id in deposits) {
            const d = deposits[id];
            if (d.userId === userId) {
                records.push({
                    type: 'Deposit',
                    amount: '+' + d.amount + ' USDT',
                    status: d.status || 'Completed',
                    date: d.date
                });
            }
        }
        
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        records = records.slice(0, 6);
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No records found<\/td><\/tr>';
        } else {
            tbody.innerHTML = records.map(r => `
                <tr>
                    <td>${r.type}<\/td>
                    <td>${r.amount}<\/td>
                    <td class="status-${(r.status || '').toLowerCase()}">${r.status}<\/td>
                    <td>${r.date}<\/td>
                <tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading records:', error);
        tbody.innerHTML = '<tr><td colspan="4">Error loading records<\/td><\/tr>';
    }
}