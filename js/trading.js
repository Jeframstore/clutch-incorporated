// Trading Page - Top 20 Binance Coins with Real Prices

let userId = null;

document.addEventListener('DOMContentLoaded', async function() {
    userId = sessionStorage.getItem('userId');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userId) {
        window.location.href = 'index.html';
        return;
    }
    
    await loadBalance();
    await loadCoins();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterCoins(this.value);
        });
    }
    
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
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

async function loadBalance() {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            const balanceEl = document.getElementById('tradingBalance');
            if (balanceEl) {
                balanceEl.textContent = (user.balance || 0).toFixed(2) + ' USDT';
            }
        }
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

async function loadCoins() {
    const coinsList = document.getElementById('coinsList');
    if (!coinsList) return;
    
    try {
        // Fetch top 20 coins from Binance API
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        // Filter for USDT pairs and sort by volume
        const usdtPairs = data
            .filter(coin => coin.symbol.endsWith('USDT'))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 20);
        
        displayCoins(usdtPairs);
    } catch (error) {
        console.error('Error loading coins:', error);
        coinsList.innerHTML = '<div class="error">Error loading coins. Please try again.</div>';
    }
}

function displayCoins(coins) {
    const coinsList = document.getElementById('coinsList');
    if (!coinsList) return;
    
    let html = '';
    
    coins.forEach(coin => {
        const priceChange = parseFloat(coin.priceChangePercent);
        const priceChangeClass = priceChange >= 0 ? 'positive' : 'negative';
        const priceChangeIcon = priceChange >= 0 ? '▲' : '▼';
        
        html += `
            <div class="coin-item" data-symbol="${coin.symbol}">
                <div class="coin-info">
                    <div class="coin-symbol">${coin.symbol.replace('USDT', '')}/USDT</div>
                    <div class="coin-price">${parseFloat(coin.lastPrice).toFixed(4)}</div>
                </div>
                <div class="coin-change ${priceChangeClass}">
                    ${priceChangeIcon} ${Math.abs(priceChange).toFixed(2)}%
                </div>
                <div class="coin-volume">
                    Vol: ${formatVolume(coin.quoteVolume)}
                </div>
            </div>
        `;
    });
    
    coinsList.innerHTML = html;
}

function filterCoins(searchTerm) {
    const coins = document.querySelectorAll('.coin-item');
    const term = searchTerm.toLowerCase();
    
    coins.forEach(coin => {
        const symbol = coin.getAttribute('data-symbol').toLowerCase();
        if (symbol.includes(term)) {
            coin.style.display = 'flex';
        } else {
            coin.style.display = 'none';
        }
    });
}

function formatVolume(volume) {
    const num = parseFloat(volume);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}
