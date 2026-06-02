// Trading Page - Top 20 Binance Coins with Real Prices and Trading Functionality

let userId = null;
let selectedCoin = null;
let currentTradeType = 'buy';
let allCoins = [];

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
    
    // Trading tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTradeType = this.getAttribute('data-tab');
            
            const buyBtn = document.getElementById('buyBtn');
            const sellBtn = document.getElementById('sellBtn');
            if (currentTradeType === 'buy') {
                buyBtn.style.display = 'block';
                sellBtn.style.display = 'none';
            } else {
                buyBtn.style.display = 'none';
                sellBtn.style.display = 'block';
            }
        });
    });
    
    // Quick amount buttons
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const percent = parseInt(this.getAttribute('data-percent'));
            const balanceEl = document.getElementById('tradingBalance');
            const balance = parseFloat(balanceEl.textContent.replace(' USDT', '')) || 0;
            const amount = (balance * percent / 100).toFixed(2);
            document.getElementById('tradeAmount').value = amount;
            updateTotal();
        });
    });
    
    // Trade amount input
    const tradeAmount = document.getElementById('tradeAmount');
    if (tradeAmount) {
        tradeAmount.addEventListener('input', updateTotal);
    }
    
    // Buy button
    const buyBtn = document.getElementById('buyBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', executeTrade);
    }
    
    // Sell button
    const sellBtn = document.getElementById('sellBtn');
    if (sellBtn) {
        sellBtn.addEventListener('click', executeTrade);
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
        allCoins = data
            .filter(coin => coin.symbol.endsWith('USDT'))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 20);
        
        displayCoins(allCoins);
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
            <div class="coin-item" data-symbol="${coin.symbol}" onclick="selectCoin('${coin.symbol}')">
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

window.selectCoin = function(symbol) {
    const coin = allCoins.find(c => c.symbol === symbol);
    if (!coin) return;
    
    selectedCoin = coin;
    
    const selectedSection = document.getElementById('selectedCoinSection');
    const coinName = document.getElementById('selectedCoinName');
    const coinPrice = document.getElementById('selectedCoinPrice');
    const coinChange = document.getElementById('selectedCoinChange');
    const tradePrice = document.getElementById('tradePrice');
    
    selectedSection.style.display = 'block';
    coinName.textContent = coin.symbol.replace('USDT', '') + '/USDT';
    coinPrice.textContent = parseFloat(coin.lastPrice).toFixed(4);
    
    const priceChange = parseFloat(coin.priceChangePercent);
    coinChange.textContent = (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + '%';
    coinChange.className = 'price-change ' + (priceChange >= 0 ? 'positive' : 'negative');
    
    tradePrice.value = parseFloat(coin.lastPrice).toFixed(4);
    
    // Scroll to top
    selectedSection.scrollIntoView({ behavior: 'smooth' });
};

function updateTotal() {
    const amount = parseFloat(document.getElementById('tradeAmount').value) || 0;
    const price = parseFloat(document.getElementById('tradePrice').value) || 0;
    const total = amount * price;
    document.getElementById('tradeTotal').value = total.toFixed(2);
}

async function executeTrade() {
    if (!selectedCoin) {
        Swal.fire('Error', 'Please select a coin to trade', 'error');
        return;
    }
    
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const price = parseFloat(document.getElementById('tradePrice').value);
    const total = parseFloat(document.getElementById('tradeTotal').value);
    
    if (!amount || amount <= 0) {
        Swal.fire('Error', 'Please enter a valid amount', 'error');
        return;
    }
    
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        const currentBalance = parseFloat(user.balance || 0);
        
        if (currentTradeType === 'buy') {
            if (total > currentBalance) {
                Swal.fire('Error', 'Insufficient balance', 'error');
                return;
            }
            
            const newBalance = currentBalance - total;
            await database.ref('users/' + userId).update({ balance: newBalance.toFixed(2) });
            
            // Save trade record
            await database.ref('trades/' + Date.now()).set({
                userId: userId,
                username: user.username,
                coin: selectedCoin.symbol,
                type: 'buy',
                amount: amount,
                price: price,
                total: total,
                date: new Date().toLocaleString(),
                status: 'completed'
            });
            
            Swal.fire('Success', `Bought ${amount} ${selectedCoin.symbol.replace('USDT', '')} at ${price}`, 'success');
        } else {
            // Sell - for demo, just add to balance (in real app, would check holdings)
            const newBalance = currentBalance + total;
            await database.ref('users/' + userId).update({ balance: newBalance.toFixed(2) });
            
            // Save trade record
            await database.ref('trades/' + Date.now()).set({
                userId: userId,
                username: user.username,
                coin: selectedCoin.symbol,
                type: 'sell',
                amount: amount,
                price: price,
                total: total,
                date: new Date().toLocaleString(),
                status: 'completed'
            });
            
            Swal.fire('Success', `Sold ${amount} ${selectedCoin.symbol.replace('USDT', '')} at ${price}`, 'success');
        }
        
        await loadBalance();
        document.getElementById('tradeAmount').value = '';
        document.getElementById('tradeTotal').value = '';
        
    } catch (error) {
        console.error('Trade error:', error);
        Swal.fire('Error', 'Trade failed. Please try again.', 'error');
    }
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
