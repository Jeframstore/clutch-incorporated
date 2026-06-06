// Dashboard - Complete with Fixed Sign-In

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userId) {
        window.location.href = 'index.html';
        return;
    }
    
    await loadUserData();
    loadMarketPrices();
    
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
    localStorage.clear();
    window.location.href = 'index.html';
}

async function loadUserData() {
    try {
        if (!userId) return;
        
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            // Update display from Firebase
            const usernameDisplay = document.getElementById('usernameDisplay');
            if (usernameDisplay) {
                usernameDisplay.textContent = user.username || 'User';
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

async function loadMarketPrices() {
    try {
        const coinsGrid = document.getElementById('coinsGrid');
        if (!coinsGrid) return;

        // Show coins: BTC, ETH, BNB, SOL, XRP, USDT
        const displayCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'USDT'];
        
        // CoinGecko IDs
        const coinIds = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'BNB': 'binancecoin',
            'SOL': 'solana',
            'XRP': 'ripple',
            'USDT': 'tether'
        };
        
        // Fetch prices from CoinGecko
        const ids = Object.values(coinIds).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        let html = '';
        for (const coin of displayCoins) {
            const coinId = coinIds[coin];
            const priceData = data[coinId];
            
            if (priceData) {
                const price = priceData.usd;
                const change24h = priceData.usd_24h_change || 0;
                const changeColor = change24h >= 0 ? '#00ff88' : '#ff4444';
                const changeSymbol = change24h >= 0 ? '↑' : '↓';
                
                html += `
                    <div class="coin-card">
                        <div class="coin-header">
                            <span class="coin-name">${coin}</span>
                            <span class="coin-price">$${price.toFixed(2)}</span>
                        </div>
                        <div class="coin-profit" style="color: ${changeColor}">
                            ${changeSymbol} ${Math.abs(change24h).toFixed(2)}%
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="coin-card">
                        <div class="coin-header">
                            <span class="coin-name">${coin}</span>
                            <span class="coin-price">$0.00</span>
                        </div>
                        <div class="coin-profit">Loading...</div>
                    </div>
                `;
            }
        }
        
        coinsGrid.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading market prices:', error);
        // Show fallback prices
        const coinsGrid = document.getElementById('coinsGrid');
        if (coinsGrid) {
            coinsGrid.innerHTML = `
                <div class="coin-card"><div class="coin-header"><span class="coin-name">BTC</span><span class="coin-price">$60,619</span></div><div class="coin-profit" style="color: #00ff88">↑ 2.5%</div></div>
                <div class="coin-card"><div class="coin-header"><span class="coin-name">ETH</span><span class="coin-price">$1,553</span></div><div class="coin-profit" style="color: #00ff88">↑ 1.8%</div></div>
                <div class="coin-card"><div class="coin-header"><span class="coin-name">BNB</span><span class="coin-price">$577</span></div><div class="coin-profit" style="color: #ff4444">↓ 0.5%</div></div>
                <div class="coin-card"><div class="coin-header"><span class="coin-name">SOL</span><span class="coin-price">$64.76</span></div><div class="coin-profit" style="color: #00ff88">↑ 3.2%</div></div>
                <div class="coin-card"><div class="coin-header"><span class="coin-name">XRP</span><span class="coin-price">$1.11</span></div><div class="coin-profit" style="color: #ff4444">↓ 1.2%</div></div>
                <div class="coin-card"><div class="coin-header"><span class="coin-name">USDT</span><span class="coin-price">$1.00</span></div><div class="coin-profit" style="color: #00ff88">↑ 0.01%</div></div>
            `;
        }
    }
}