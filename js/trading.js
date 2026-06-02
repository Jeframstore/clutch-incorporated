// Trading Page - LBank Inspired Trading Interface

let userId = null;
let selectedCoin = null;
let currentTradeType = 'buy';
let currentTradeTab = 'limit';
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
    await loadTradeHistory();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterCoins(this.value);
        });
    }
    
    // Trade type buttons (Buy/Sell)
    const tradeTypeBtns = document.querySelectorAll('.trade-type-btn');
    tradeTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tradeTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTradeType = this.getAttribute('data-type');
            
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
    
    // Trade tabs (Limit/Market)
    const tradeTabBtns = document.querySelectorAll('.trade-tab-btn');
    tradeTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tradeTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTradeTab = this.getAttribute('data-tab');
            
            const tradePrice = document.getElementById('tradePrice');
            if (currentTradeTab === 'market') {
                tradePrice.value = '';
                tradePrice.placeholder = 'Market Price';
                tradePrice.readOnly = true;
            } else {
                tradePrice.placeholder = 'Price';
                tradePrice.readOnly = false;
                if (selectedCoin) {
                    tradePrice.value = parseFloat(selectedCoin.lastPrice).toFixed(4);
                }
            }
        });
    });
    
    // Slider
    const slider = document.getElementById('amountSlider');
    if (slider) {
        slider.addEventListener('input', function() {
            const percent = parseInt(this.value);
            const balanceEl = document.getElementById('tradingBalance');
            const balance = parseFloat(balanceEl.textContent.replace(' USDT', '')) || 0;
            const amount = (balance * percent / 100).toFixed(2);
            document.getElementById('tradeAmount').value = amount;
            updateTotal();
        });
    }
    
    // Trade amount input
    const tradeAmount = document.getElementById('tradeAmount');
    if (tradeAmount) {
        tradeAmount.addEventListener('input', updateTotal);
    }
    
    // Price input
    const tradePrice = document.getElementById('tradePrice');
    if (tradePrice) {
        tradePrice.addEventListener('input', updateTotal);
    }
    
    // Control buttons (up/down)
    const controlBtns = document.querySelectorAll('.control-btn');
    controlBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tradePrice = document.getElementById('tradePrice');
            let currentPrice = parseFloat(tradePrice.value) || 0;
            const step = 0.0001;
            
            if (this.classList.contains('up')) {
                currentPrice += step;
            } else {
                currentPrice -= step;
            }
            
            tradePrice.value = currentPrice.toFixed(4);
            updateTotal();
        });
    });
    
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
    
    // Select first coin by default
    if (allCoins.length > 0) {
        selectCoin(allCoins[0].symbol);
    }
});

async function loadBalance() {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            const balanceEl = document.getElementById('tradingBalance');
            const usdtBalanceEl = document.getElementById('usdtBalance');
            if (balanceEl) {
                balanceEl.textContent = (user.balance || 0).toFixed(2) + ' USDT';
            }
            if (usdtBalanceEl) {
                usdtBalanceEl.textContent = (user.balance || 0).toFixed(2);
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

async function loadTradeHistory() {
    const tradeHistoryEl = document.getElementById('tradeHistory');
    if (!tradeHistoryEl) return;
    
    try {
        const snapshot = await database.ref('trades').orderByChild('userId').equalTo(userId).limitToLast(10).once('value');
        const trades = snapshot.val();
        
        if (trades) {
            let html = '';
            Object.values(trades).reverse().forEach(trade => {
                const typeClass = trade.type === 'buy' ? '' : 'sell';
                html += `
                    <div class="trade-history-row">
                        <span class="time">${trade.date}</span>
                        <span class="price">${parseFloat(trade.price).toFixed(4)}</span>
                        <span class="amount">${parseFloat(trade.amount).toFixed(4)}</span>
                        <span class="type ${typeClass}">${trade.type.toUpperCase()}</span>
                    </div>
                `;
            });
            tradeHistoryEl.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading trade history:', error);
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
    
    const coinName = document.getElementById('selectedCoinName');
    const coinPrice = document.getElementById('selectedCoinPrice');
    const coinChange = document.getElementById('selectedCoinChange');
    const tradePrice = document.getElementById('tradePrice');
    const orderBookMid = document.getElementById('orderBookMid');
    
    coinName.textContent = coin.symbol.replace('USDT', '') + '/USDT';
    coinPrice.textContent = parseFloat(coin.lastPrice).toFixed(4);
    
    const priceChange = parseFloat(coin.priceChangePercent);
    coinChange.textContent = (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + '%';
    coinChange.className = 'price-change ' + (priceChange >= 0 ? 'positive' : 'negative');
    
    if (currentTradeTab === 'limit') {
        tradePrice.value = parseFloat(coin.lastPrice).toFixed(4);
    }
    
    orderBookMid.textContent = parseFloat(coin.lastPrice).toFixed(4);
    
    // Update order book with simulated data
    updateOrderBook(coin);
};

function updateOrderBook(coin) {
    const asksEl = document.getElementById('orderBookAsks');
    const bidsEl = document.getElementById('orderBookBids');
    const currentPrice = parseFloat(coin.lastPrice);
    
    // Simulate order book data
    let asksHtml = '';
    let bidsHtml = '';
    
    for (let i = 0; i < 5; i++) {
        const askPrice = (currentPrice * (1 + (i + 1) * 0.001)).toFixed(4);
        const bidPrice = (currentPrice * (1 - (i + 1) * 0.001)).toFixed(4);
        const amount = (Math.random() * 10).toFixed(4);
        const total = (askPrice * amount).toFixed(2);
        
        asksHtml += `
            <div class="order-book-row">
                <span class="price">${askPrice}</span>
                <span class="amount">${amount}</span>
                <span class="total">${total}</span>
            </div>
        `;
        
        const bidTotal = (bidPrice * amount).toFixed(2);
        bidsHtml += `
            <div class="order-book-row">
                <span class="price">${bidPrice}</span>
                <span class="amount">${amount}</span>
                <span class="total">${bidTotal}</span>
            </div>
        `;
    }
    
    asksEl.innerHTML = asksHtml;
    bidsEl.innerHTML = bidsHtml;
}

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
    let price = parseFloat(document.getElementById('tradePrice').value);
    const total = parseFloat(document.getElementById('tradeTotal').value);
    const duration = parseInt(document.getElementById('tradeDuration').value);
    
    if (!amount || amount <= 0) {
        Swal.fire('Error', 'Please enter a valid amount', 'error');
        return;
    }
    
    if (currentTradeTab === 'market') {
        price = parseFloat(selectedCoin.lastPrice);
    }
    
    if (!price || price <= 0) {
        Swal.fire('Error', 'Please enter a valid price', 'error');
        return;
    }
    
    if (!duration || duration <= 0) {
        Swal.fire('Error', 'Please select a trade duration', 'error');
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
            
            // Deduct balance and create pending trade
            const newBalance = currentBalance - total;
            await database.ref('users/' + userId).update({ balance: newBalance.toFixed(2) });
            
            // Calculate end time
            const endTime = new Date(Date.now() + duration * 60 * 1000).getTime();
            
            // Save pending trade record
            await database.ref('openTrades/' + Date.now()).set({
                userId: userId,
                username: user.username,
                coin: selectedCoin.symbol,
                coinName: selectedCoin.symbol.replace('USDT', ''),
                type: 'buy',
                amount: amount,
                price: price,
                total: total,
                duration: duration,
                startTime: Date.now(),
                endTime: endTime,
                entryPrice: parseFloat(selectedCoin.lastPrice),
                date: new Date().toLocaleString(),
                status: 'open'
            });
            
            Swal.fire('Success', `Trade opened! Waiting for admin confirmation after ${duration} minutes.`, 'success');
        } else {
            // Sell - deduct balance and create pending trade
            if (total > currentBalance) {
                Swal.fire('Error', 'Insufficient balance', 'error');
                return;
            }
            
            const newBalance = currentBalance - total;
            await database.ref('users/' + userId).update({ balance: newBalance.toFixed(2) });
            
            // Calculate end time
            const endTime = new Date(Date.now() + duration * 60 * 1000).getTime();
            
            // Save pending trade record
            await database.ref('openTrades/' + Date.now()).set({
                userId: userId,
                username: user.username,
                coin: selectedCoin.symbol,
                coinName: selectedCoin.symbol.replace('USDT', ''),
                type: 'sell',
                amount: amount,
                price: price,
                total: total,
                duration: duration,
                startTime: Date.now(),
                endTime: endTime,
                entryPrice: parseFloat(selectedCoin.lastPrice),
                date: new Date().toLocaleString(),
                status: 'open'
            });
            
            Swal.fire('Success', `Trade opened! Waiting for admin confirmation after ${duration} minutes.`, 'success');
        }
        
        await loadBalance();
        document.getElementById('tradeAmount').value = '';
        document.getElementById('tradeTotal').value = '';
        document.getElementById('amountSlider').value = 0;
        
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
