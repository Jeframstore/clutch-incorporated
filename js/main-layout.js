// Main Layout - Shared Functions for ALL Pages

let currentUserId = null;
let priceUpdateInterval = null;
let allCoins = [];

// CoinGecko IDs mapping
const COINGECKO_IDS = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'BNBUSDT': 'binancecoin',
    'SOLUSDT': 'solana',
    'XRPUSDT': 'ripple',
    'ADAUSDT': 'cardano',
    'DOGEUSDT': 'dogecoin',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'MATICUSDT': 'matic-network',
    'DOTUSDT': 'polkadot',
    'AVAXUSDT': 'avalanche-2',
    'LINKUSDT': 'chainlink',
    'LTCUSDT': 'litecoin',
    'UNIUSDT': 'uniswap',
    'ATOMUSDT': 'cosmos',
    'ALGOUSDT': 'algorand'
};

const COINS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'USDT', 'USDC', 'MATICUSDT',
    'DOTUSDT', 'AVAXUSDT', 'LINKUSDT', 'LTCUSDT', 'UNIUSDT'
];

const COIN_NAMES = {
    'BTCUSDT': 'BTC', 'ETHUSDT': 'ETH', 'BNBUSDT': 'BNB', 'SOLUSDT': 'SOL', 'XRPUSDT': 'XRP',
    'ADAUSDT': 'ADA', 'DOGEUSDT': 'DOGE', 'USDT': 'USDT', 'USDC': 'USDC', 'MATICUSDT': 'MATIC',
    'DOTUSDT': 'DOT', 'AVAXUSDT': 'AVAX', 'LINKUSDT': 'LINK', 'LTCUSDT': 'LTC', 'UNIUSDT': 'UNI'
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
    await loadLogo();
    await loadLivePrices();
    
    startPriceUpdates();
    
    setupMobileMenu();
    setupCoinDropdown();
    setActiveNav();
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
            
            const joinedDate = user.joinedDate || '2024-01-01';
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

async function loadLogo() {
    try {
        const snapshot = await database.ref('settings/logoURL').once('value');
        const logoDataURL = snapshot.val();
        const logoImg = document.getElementById('siteLogo');
        
        if (logoImg && logoDataURL) {
            logoImg.src = logoDataURL;
            logoImg.style.display = 'block';
        } else if (logoImg) {
            logoImg.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading logo:', error);
    }
}

async function loadLivePrices() {
    try {
        // Build query string for all coins
        const allIds = Object.values(COINGECKO_IDS);
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${allIds.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        // Build full price data for all coins
        const fullPriceData = {};
        for (const symbol of COINS) {
            const coinId = COINGECKO_IDS[symbol];
            if (data[coinId]) {
                fullPriceData[symbol] = {
                    price: data[coinId].usd.toFixed(2),
                    change: data[coinId].usd_24h_change.toFixed(2)
                };
            } else {
                fullPriceData[symbol] = { price: '0.00', change: '0.00' };
            }
        }
        
        displayCoinPrices(fullPriceData);
        displayProfileCoins(fullPriceData);
        
    } catch (error) {
        console.error('Error fetching prices:', error);
        showFallbackPrices();
    }
}

function showFallbackPrices() {
    const fallbackData = {
        'BTCUSDT': { price: '61333.99', change: '2.5' },
        'ETHUSDT': { price: '1594.94', change: '1.8' },
        'BNBUSDT': { price: '577.00', change: '-0.5' },
        'SOLUSDT': { price: '64.76', change: '3.2' },
        'XRPUSDT': { price: '1.11', change: '-1.2' },
        'ADAUSDT': { price: '0.45', change: '1.2' },
        'DOGEUSDT': { price: '0.12', change: '-0.8' },
        'USDT': { price: '1.00', change: '0.01' },
        'USDC': { price: '1.00', change: '0.01' },
        'MATICUSDT': { price: '0.89', change: '2.1' },
        'DOTUSDT': { price: '6.50', change: '-1.0' },
        'AVAXUSDT': { price: '35.20', change: '4.5' },
        'LINKUSDT': { price: '14.30', change: '1.5' },
        'LTCUSDT': { price: '82.40', change: '-0.3' },
        'UNIUSDT': { price: '7.80', change: '2.0' }
    };
    
    displayCoinPrices(fallbackData);
    displayProfileCoins(fallbackData);
    console.log('Using fallback price data');
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
            
            const changeNum = parseFloat(data.change);
            const changeClass = changeNum >= 0 ? 'positive' : 'negative';
            const changeSign = changeNum >= 0 ? '▲' : '▼';
            
            const card = document.createElement('div');
            card.className = 'coin-card';
            card.innerHTML = `
                <h4>${COIN_NAMES[symbol]}</h4>
                <div class="price">$${parseFloat(data.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div class="change ${changeClass}">${changeSign} ${Math.abs(changeNum).toFixed(2)}%</div>
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
        
        const changeNum = parseFloat(data.change);
        const changeClass = changeNum >= 0 ? 'positive' : 'negative';
        const changeSign = changeNum >= 0 ? '▲' : '▼';
        
        const coinItem = document.createElement('div');
        coinItem.className = 'coin-item';
        coinItem.innerHTML = `
            <span class="coin-name">${COIN_NAMES[symbol]}</span>
            <span class="coin-price">$${parseFloat(data.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span class="coin-change ${changeClass}">${changeSign} ${Math.abs(changeNum).toFixed(2)}%</span>
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
                const changeNum = parseFloat(coin.change);
                const changeClass = changeNum >= 0 ? 'positive' : 'negative';
                const changeSign = changeNum >= 0 ? '▲' : '▼';
                
                const coinItem = document.createElement('div');
                coinItem.className = 'coin-item';
                coinItem.innerHTML = `
                    <span class="coin-name">${coin.name}</span>
                    <span class="coin-price">$${parseFloat(coin.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <span class="coin-change ${changeClass}">${changeSign} ${Math.abs(changeNum).toFixed(2)}%</span>
                `;
                dropdownCoins.appendChild(coinItem);
            });
        }
    });
}

function startPriceUpdates() {
    loadLivePrices();
    priceUpdateInterval = setInterval(loadLivePrices, 60000); // Update every 60 seconds
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