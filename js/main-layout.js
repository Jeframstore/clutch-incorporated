// Main Layout - Shared Functions for ALL Pages

let currentUserId = null;
let priceUpdateInterval = null;
let allCoins = [];

const COINS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT',
    'LINKUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'ALGOUSDT'
];

const COIN_NAMES = {
    'BTCUSDT': 'BTC', 'ETHUSDT': 'ETH', 'BNBUSDT': 'BNB', 'SOLUSDT': 'SOL', 'XRPUSDT': 'XRP',
    'ADAUSDT': 'ADA', 'DOGEUSDT': 'DOGE', 'MATICUSDT': 'MATIC', 'DOTUSDT': 'DOT', 'AVAXUSDT': 'AVAX',
    'LINKUSDT': 'LINK', 'LTCUSDT': 'LTC', 'UNIUSDT': 'UNI', 'ATOMUSDT': 'ATOM', 'ALGOUSDT': 'ALGO'
};

document.addEventListener('DOMContentLoaded', async function() {
    currentUserId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    if (!currentUserId) {
        console.error('No userId found');
        window.location.href = 'index.html';
        return;
    }
    
    await loadUserProfile();
    await loadLivePrices();
    
    startPriceUpdates();
    setupMobileMenu();
    setupCoinDropdown();
    setActiveNav();
    setupLogout();
});

async function loadUserProfile() {
    try {
        const snapshot = await database.ref('users/' + currentUserId).once('value');
        const user = snapshot.val();
        
        if (user) {
            const usernameElements = document.querySelectorAll('.username');
            usernameElements.forEach(el => {
                el.textContent = user.username;
            });
            
            const joinedDate = user.joinedDate || new Date().toISOString().split('T')[0];
            const inviteCode = user.inviteCode || 'N/A';
            const balance = parseFloat(user.balance || 0).toFixed(2);
            
            const joinedEl = document.getElementById('profileJoined');
            if (joinedEl) joinedEl.textContent = joinedDate;
            
            const inviteEl = document.getElementById('profileInviteCode');
            if (inviteEl) inviteEl.textContent = inviteCode;
            
            const balanceEl = document.getElementById('profileBalance');
            if (balanceEl) balanceEl.textContent = balance + ' USDT';
            
            localStorage.setItem('username', user.username);
            localStorage.setItem('userInviteCode', inviteCode);
            localStorage.setItem('walletBalance', balance);
            localStorage.setItem('commission', user.commission || '0');
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

async function loadLivePrices() {
    try {
        const priceData = {};
        for (const symbol of COINS) {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
            const data = await response.json();
            priceData[symbol] = {
                price: parseFloat(data.lastPrice).toFixed(2),
                change: parseFloat(data.priceChangePercent).toFixed(2)
            };
        }
        
        displayCoinPrices(priceData);
        displayProfileCoins(priceData);
        
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

function displayCoinPrices(priceData) {
    const containers = document.querySelectorAll('.coins-grid');
    if (containers.length === 0) return;
    
    containers.forEach(container => {
        container.innerHTML = '';
        
        const topCoins = COINS.slice(0, 5);
        for (const symbol of topCoins) {
            const data = priceData[symbol];
            if (!data) continue;
            
            const changeClass = data.change >= 0 ? 'positive' : 'negative';
            const changeSign = data.change >= 0 ? '▲' : '▼';
            
            const card = document.createElement('div');
            card.className = 'coin-card';
            card.innerHTML = `
                <h4>${COIN_NAMES[symbol]}</h4>
                <div class="price">$${data.price}</div>
                <div class="change ${changeClass}">${changeSign} ${Math.abs(data.change)}%</div>
            `;
            container.appendChild(card);
        }
    });
}

function displayProfileCoins(priceData) {
    const coinsListContainer = document.getElementById('profileCoinsList');
    if (!coinsListContainer) return;
    
    coinsListContainer.innerHTML = '';
    
    const topCoins = COINS.slice(0, 5);
    for (const symbol of topCoins) {
        const data = priceData[symbol];
        if (!data) continue;
        
        const changeClass = data.change >= 0 ? 'positive' : 'negative';
        const changeSign = data.change >= 0 ? '▲' : '▼';
        
        const coinItem = document.createElement('div');
        coinItem.className = 'coin-item';
        coinItem.innerHTML = `
            <span class="coin-name">${COIN_NAMES[symbol]}</span>
            <span class="coin-price">$${data.price}</span>
            <span class="coin-change ${changeClass}">${changeSign} ${Math.abs(data.change)}%</span>
        `;
        coinsListContainer.appendChild(coinItem);
    }
    
    allCoins = [];
    for (const symbol of COINS.slice(5)) {
        const data = priceData[symbol];
        if (data) {
            allCoins.push({
                name: COIN_NAMES[symbol],
                symbol: symbol,
                price: data.price,
                change: data.change
            });
        }
    }
}

function setupCoinDropdown() {
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    const dropdownCoins = document.getElementById('dropdownCoins');
    
    if (!dropdownTrigger || !dropdownCoins) return;
    
    dropdownTrigger.addEventListener('click', () => {
        dropdownCoins.classList.toggle('show');
        
        if (dropdownCoins.classList.contains('show') && dropdownCoins.innerHTML === '') {
            dropdownCoins.innerHTML = '';
            allCoins.forEach(coin => {
                const changeClass = coin.change >= 0 ? 'positive' : 'negative';
                const changeSign = coin.change >= 0 ? '▲' : '▼';
                
                const coinItem = document.createElement('div');
                coinItem.className = 'coin-item';
                coinItem.innerHTML = `
                    <span class="coin-name">${coin.name}</span>
                    <span class="coin-price">$${coin.price}</span>
                    <span class="coin-change ${changeClass}">${changeSign} ${Math.abs(coin.change)}%</span>
                `;
                dropdownCoins.appendChild(coinItem);
            });
        }
    });
}

function startPriceUpdates() {
    loadLivePrices();
    priceUpdateInterval = setInterval(loadLivePrices, 30000);
}

function setupMobileMenu() {
    if (!document.querySelector('.mobile-menu-btn')) {
        const btn = document.createElement('button');
        btn.className = 'mobile-menu-btn';
        btn.innerHTML = '☰';
        btn.onclick = () => {
            document.querySelector('.sidebar').classList.toggle('open');
        };
        document.body.appendChild(btn);
    }
    
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}