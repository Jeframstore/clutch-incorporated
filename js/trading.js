// Trading Page - New Order System with Firebase

let userId = null;
let currentSymbol = 'BTC';
let currentPrice = 0;
let previousPrice = 0;
let tradeType = 'buy';
let currentBalance = 0;
let selectedDuration = 60;
let prices = {};
let priceHistory = [];
let selectedTimeFrame = '2h';

const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK', 'AVAX', 'UNI', 'ATOM', 'LTC', 'BCH'];

document.addEventListener('DOMContentLoaded', async function() {
    userId = sessionStorage.getItem('userId');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userId) {
        window.location.href = 'index.html';
        return;
    }
    
    await loadBalance();
    watchBalance();
    fetchLivePrices();
    loadOpenOrders();
    loadOrderHistory();
    
    // Symbol selector dropdown
    const symbolSelector = document.getElementById('symbolSelector');
    if (symbolSelector) {
        symbolSelector.addEventListener('change', function() {
            currentSymbol = this.value;
            updatePrice();
            fetchHistoricalData();
        });
    }
    
    // Buy/Sell type buttons - FIXED COLOR TOGGLE
    const buyBtn = document.getElementById('buyTypeBtn');
    const sellBtn = document.getElementById('sellTypeBtn');
    
    buyBtn.addEventListener('click', function() {
        tradeType = 'buy';
        // Keep buy button green, sell button red
        this.classList.add('bg-[#80FF00]', 'text-black');
        this.classList.remove('bg-[#FF4B4B]', 'text-white');
        sellBtn.classList.remove('bg-[#80FF00]', 'text-black');
        sellBtn.classList.add('bg-[#FF4B4B]', 'text-white');
        document.getElementById('placeOrderBtn').textContent = 'Place Buy Order';
    });
    
    sellBtn.addEventListener('click', function() {
        tradeType = 'sell';
        // Keep sell button red, buy button green
        this.classList.add('bg-[#FF4B4B]', 'text-white');
        this.classList.remove('bg-[#80FF00]', 'text-black');
        buyBtn.classList.remove('bg-[#FF4B4B]', 'text-white');
        buyBtn.classList.add('bg-[#80FF00]', 'text-black');
        document.getElementById('placeOrderBtn').textContent = 'Place Sell Order';
    });
    
    // Duration buttons
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.duration-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.remove('bg-[#FFD800]/10', 'border-[#FFD800]/30', 'text-[#FFD800]');
                b.classList.add('bg-black/40', 'border-white/5', 'text-white/60');
            });
            this.classList.add('active');
            this.classList.remove('bg-black/40', 'border-white/5', 'text-white/60');
            this.classList.add('bg-[#FFD800]/10', 'border-[#FFD800]/30', 'text-[#FFD800]');
            selectedDuration = parseInt(this.dataset.minutes);
        });
    });
    
    // Time frame buttons for chart
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.remove('bg-[#FFD800]/10', 'border-[#FFD800]/30', 'text-[#FFD800]');
                b.classList.add('bg-black/40', 'border-white/5', 'text-white/60');
            });
            this.classList.add('active');
            this.classList.remove('bg-black/40', 'border-white/5', 'text-white/60');
            this.classList.add('bg-[#FFD800]/10', 'border-[#FFD800]/30', 'text-[#FFD800]');
            selectedTimeFrame = this.dataset.time;
            fetchHistoricalData();
        });
    });
    
    // Place order button
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
    
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'home') window.location.href = 'dashboard.html';
            else if (page === 'starting') window.location.href = 'starting.html';
            else if (page === 'records') window.location.href = 'records.html';
        });
    });
    
    // Auto-refresh prices
    setInterval(fetchLivePrices, 5000);
    setInterval(loadOpenOrders, 5000);
    
    // Initialize chart
    fetchHistoricalData();
});

async function loadBalance() {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        const user = snapshot.val();
        
        if (user) {
            currentBalance = parseFloat(user.balance || 0);
            const balanceEl = document.getElementById('tradingBalance');
            if (balanceEl) {
                balanceEl.textContent = '$' + currentBalance.toFixed(2);
            }
        }
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

// Add real-time balance listener
function watchBalance() {
    database.ref('users/' + userId + '/balance').on('value', snapshot => {
        const balance = snapshot.val();
        if (balance !== null) {
            currentBalance = parseFloat(balance);
            const balanceEl = document.getElementById('tradingBalance');
            if (balanceEl) {
                balanceEl.textContent = '$' + currentBalance.toFixed(2);
            }
        }
    });
}

async function fetchLivePrices() {
    try {
        const symbols = coins.map(coin => coin + 'USDT');
        const responses = await Promise.all(
            symbols.map(symbol => 
                fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
                    .then(res => res.json())
            )
        );
        
        responses.forEach(data => {
            const coinSymbol = data.symbol.replace('USDT', '');
            prices[coinSymbol] = parseFloat(data.price);
        });
        
        document.getElementById('priceSource').innerHTML = `Live from Binance • Updated ${new Date().toLocaleTimeString()}`;
        updatePrice();
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

function updatePrice() {
    previousPrice = currentPrice;
    currentPrice = prices[currentSymbol] || 0;
    
    if (currentPrice > 0) {
        document.getElementById('currentPrice').textContent = '$' + currentPrice.toFixed(2);
        
        // Update price indicator and change percentage
        const indicator = document.getElementById('priceIndicator');
        const priceChangeEl = document.getElementById('priceChange');
        
        if (previousPrice > 0) {
            const change = ((currentPrice - previousPrice) / previousPrice) * 100;
            const changeText = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
            priceChangeEl.textContent = changeText;
            
            if (change >= 0) {
                indicator.className = 'w-3 h-3 rounded-full bg-[#80FF00]';
                priceChangeEl.className = 'text-[9px] font-black uppercase tracking-widest mt-1 text-[#80FF00]';
            } else {
                indicator.className = 'w-3 h-3 rounded-full bg-[#FF4B4B]';
                priceChangeEl.className = 'text-[9px] font-black uppercase tracking-widest mt-1 text-[#FF4B4B]';
            }
        }
        
        // Update price history for chart
        priceHistory.push({ time: Date.now(), price: currentPrice });
        if (priceHistory.length > 100) {
            priceHistory.shift();
        }
        drawChart();
    } else {
        document.getElementById('currentPrice').textContent = 'Loading...';
    }
}

async function fetchHistoricalData() {
    try {
        const symbol = currentSymbol + 'USDT';
        let interval = '1m';
        let limit = 120;
        
        switch(selectedTimeFrame) {
            case '2h':
                interval = '1m';
                limit = 120;
                break;
            case '12h':
                interval = '5m';
                limit = 144;
                break;
            case '1d':
                interval = '15m';
                limit = 96;
                break;
            case '30d':
                interval = '1h';
                limit = 720;
                break;
        }
        
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        const data = await response.json();
        
        priceHistory = data.map(candle => ({
            time: candle[0],
            price: parseFloat(candle[4])
        }));
        
        drawChart();
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
}

function drawChart() {
    const canvas = document.getElementById('priceChart');
    if (!canvas || priceHistory.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Find min and max prices
    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Determine color based on price trend
    const firstPrice = priceHistory[0].price;
    const lastPrice = priceHistory[priceHistory.length - 1].price;
    const isUp = lastPrice >= firstPrice;
    const lineColor = isUp ? '#80FF00' : '#FF4B4B';
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    
    priceHistory.forEach((point, index) => {
        const x = (index / (priceHistory.length - 1)) * width;
        const y = height - ((point.price - minPrice) / priceRange) * (height - 20) - 10;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isUp ? 'rgba(128, 255, 0, 0.2)' : 'rgba(255, 75, 75, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}

async function placeOrder() {
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const messageDiv = document.getElementById('tradeMessage');

    if (!amount || amount <= 0) {
        messageDiv.className = 'text-red-500';
        messageDiv.innerText = 'Please enter a valid amount';
        return;
    }

    if (currentPrice <= 0) {
        messageDiv.className = 'text-red-500';
        messageDiv.innerText = 'Waiting for live prices...';
        return;
    }

    if (tradeType === 'buy' && amount > currentBalance) {
        messageDiv.className = 'text-red-500';
        messageDiv.innerText = `Insufficient balance. You have $${currentBalance.toFixed(2)}`;
        return;
    }

    try {
        const orderId = 'ORD' + Date.now();
        const endTime = new Date(Date.now() + selectedDuration * 60 * 1000).toISOString();
        
        const orderData = {
            id: orderId,
            userId: userId,
            symbol: currentSymbol,
            type: 'market',
            side: tradeType,
            amount: amount,
            price: currentPrice,
            duration: selectedDuration,
            endTime: endTime,
            status: 'open',
            createdAt: new Date().toISOString()
        };
        
        await database.ref('tradingOrders/' + orderId).set(orderData);
        
        if (tradeType === 'buy') {
            await database.ref('users/' + userId).update({
                balance: (currentBalance - amount).toFixed(2)
            });
        }
        
        messageDiv.className = 'text-white';
        messageDiv.innerText = `Order placed successfully.`;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            messageDiv.innerText = '';
        }, 3000);
        
        document.getElementById('tradeAmount').value = '';
        loadBalance();
        loadOpenOrders();
        loadOrderHistory();
    } catch (error) {
        console.error('Error placing order:', error);
        messageDiv.className = 'text-red-500';
        messageDiv.innerText = 'Network error. Please try again.';
    }
}

function formatTimeRemaining(createdAt, minutes, status) {
    if (status === 'pending_execution') return '⏱️ Awaiting Admin Approval';
    if (status === 'executed') return 'Completed';
    if (status === 'rejected') return 'Rejected';
    
    const created = new Date(createdAt);
    const expiry = new Date(created.getTime() + (minutes * 60 * 1000));
    const now = new Date();
    const remaining = expiry - now;
    
    if (remaining <= 0) return 'Ready for admin';
    
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}m ${secs}s`;
}

async function loadOpenOrders() {
    try {
        const snapshot = await database.ref('tradingOrders').once('value');
        const orders = snapshot.val() || {};
        
        const container = document.getElementById('openOrdersList');
        const userOrders = Object.values(orders).filter(order => order.userId === userId && (order.status === 'open' || order.status === 'ready_for_admin'));
        
        if (userOrders.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-white/30 text-center">No pending orders</p>';
            // Auto-refresh every 5 seconds
            setTimeout(loadOpenOrders, 5000);
            return;
        }
        
        container.innerHTML = userOrders.map(order => {
            const now = Date.now();
            const endTime = new Date(order.endTime).getTime();
            const timeLeft = Math.max(0, endTime - now);
            const minutesLeft = Math.floor(timeLeft / 60000);
            const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
            
            const typeClass = order.side === 'buy' ? 'text-[#80FF00]' : 'text-[#FF4B4B]';
            const isReady = order.status === 'ready_for_admin';
            
            return `
                <div class="bg-black/40 border border-white/5 rounded-xl p-3 mb-2">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-[10px] font-bold">${order.symbol}/USD</span>
                            <span class="ml-2 ${typeClass} font-bold">${order.side.toUpperCase()}</span>
                        </div>
                        <span class="text-[9px] text-white/40">${new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between text-[9px] text-white/60">
                        <span>Price: $${order.price.toFixed(2)}</span>
                        <span>Amount: $${order.amount}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-[9px] ${isReady ? 'text-[#00ff00]' : 'text-[#FFD800]'}">${isReady ? '⏳ Waiting' : `⏱️ ${minutesLeft}m ${secondsLeft}s remaining`}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Auto-refresh every 5 seconds for live countdown
        setTimeout(loadOpenOrders, 5000);
    } catch (error) {
        console.error('Error loading open orders:', error);
    }
}

async function loadOrderHistory() {
    try {
        const snapshot = await database.ref('tradingOrders').once('value');
        const orders = snapshot.val() || {};
        
        console.log('All orders:', orders);
        
        const container = document.getElementById('orderHistory');
        const userOrders = Object.values(orders).filter(order => order.userId === userId && (order.status === 'closed' || order.status === 'rejected'));
        
        console.log('User orders for history:', userOrders);
        
        if (userOrders.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-white/30 text-center">No orders yet</p>';
            return;
        }
        
        container.innerHTML = userOrders.map(order => {
            const typeClass = order.side === 'buy' ? 'text-[#80FF00]' : 'text-[#FF4B4B]';
            const statusColor = order.status === 'closed' ? 'text-[#80FF00]' : 'text-[#FF4B4B]';
            
            return `
                <div class="bg-black/40 border border-white/5 rounded-xl p-3 mb-2">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-[10px] font-bold">${order.symbol}/USD</span>
                            <span class="ml-2 ${typeClass} font-bold">${order.side.toUpperCase()}</span>
                        </div>
                        <span class="text-[9px] text-white/40">${new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between text-[9px] text-white/60">
                        <span>Order Amount: $${order.amount}</span>
                        <span>Price: $${order.price.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-[9px] text-white/60 mt-1">
                        <span class="text-[#80FF00]">Order Returns: $${order.profit ? order.profit.toFixed(2) : '0.00'}</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-[9px] ${statusColor} font-bold">${order.status.toUpperCase()}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading order history:', error);
    }
}
