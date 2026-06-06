// Main Layout - Shared Functions for ALL Pages

let currentUserId = null;
let priceUpdateInterval = null;
let allCoins = [];

// CoinGecko IDs mapping
const COINGECKO_IDS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'MATIC': 'matic-network',
    'DOT': 'polkadot',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'LTC': 'litecoin',
    'UNI': 'uniswap'
};

const COINS = [
    'BTC', 'ETH', 'BNB', 'SOL', 'XRP',
    'ADA', 'DOGE', 'USDT', 'USDC', 'MATIC',
    'DOT', 'AVAX', 'LINK', 'LTC', 'UNI'
];

const COIN_NAMES = {
    'BTC': 'BTC', 'ETH': 'ETH', 'BNB': 'BNB', 'SOL': 'SOL', 'XRP': 'XRP',
    'ADA': 'ADA', 'DOGE': 'DOGE', 'USDT': 'USDT', 'USDC': 'USDC', 'MATIC': 'MATIC',
    'DOT': 'DOT', 'AVAX': 'AVAX', 'LINK': 'LINK', 'LTC': 'LTC', 'UNI': 'UNI'
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
    
    // First populate fallback prices
    showFallbackPrices();
    
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
    // Use fallback prices only (no API calls to avoid CORS)
    showFallbackPrices();
}

function showFallbackPrices() {
    const fallbackData = {
        'BTC': { price: '60619.00', change: '2.5' },
        'ETH': { price: '1553.17', change: '1.8' },
        'BNB': { price: '577.00', change: '-0.5' },
        'SOL': { price: '64.76', change: '3.2' },
        'XRP': { price: '1.11', change: '-1.2' },
        'USDT': { price: '1.00', change: '0.01' },
        'ADA': { price: '0.45', change: '1.2' },
        'DOGE': { price: '0.12', change: '-0.8' },
        'MATIC': { price: '0.89', change: '2.1' },
        'DOT': { price: '6.50', change: '-1.0' },
        'AVAX': { price: '35.20', change: '4.5' },
        'LINK': { price: '14.30', change: '1.5' },
        'LTC': { price: '82.40', change: '-0.3' },
        'UNI': { price: '7.80', change: '2.0' }
    };
    
    // Display prices in main content and profile
    displayCoinPrices(fallbackData);
    displayProfileCoins(fallbackData);
    
    console.log('Fallback prices displayed');
}

function displayCoinPrices(priceData) {
    // Main content market prices grid (6 coins)
    const mainGrid = document.getElementById('marketPricesGrid');
    if (mainGrid) {
        mainGrid.innerHTML = '';
        
        const topCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'USDT'];
        for (const symbol of topCoins) {
            const data = priceData[symbol];
            if (data) {
                const changeNum = parseFloat(data.change);
                const changeClass = changeNum >= 0 ? 'positive' : 'negative';
                const changeSign = changeNum >= 0 ? '▲' : '▼';
                
                const card = document.createElement('div');
                card.className = 'coin-card';
                card.innerHTML = `
                    <h4>${symbol}</h4>
                    <div class="price">$${parseFloat(data.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="change ${changeClass}">${changeSign} ${Math.abs(changeNum).toFixed(2)}%</div>
                `;
                mainGrid.appendChild(card);
            }
        }
    }
    
    // Also handle any .coins-grid elements (fallback)
    const containers = document.querySelectorAll('.coins-grid');
    if (containers.length > 0 && !mainGrid) {
        containers.forEach(container => {
            container.innerHTML = '';
            const topCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'USDT'];
            for (const symbol of topCoins) {
                const data = priceData[symbol];
                if (!data) continue;
                
                const changeNum = parseFloat(data.change);
                const changeClass = changeNum >= 0 ? 'positive' : 'negative';
                const changeSign = changeNum >= 0 ? '▲' : '▼';
                
                const card = document.createElement('div');
                card.className = 'coin-card';
                card.innerHTML = `
                    <h4>${symbol}</h4>
                    <div class="price">$${parseFloat(data.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="change ${changeClass}">${changeSign} ${Math.abs(changeNum).toFixed(2)}%</div>
                `;
                container.appendChild(card);
            }
        });
    }
}

function displayProfileCoins(priceData) {
    const coinsListContainer = document.getElementById('profileCoinsList');
    if (!coinsListContainer) {
        console.log('profileCoinsList not found');
        return;
    }
    
    coinsListContainer.innerHTML = '';
    
    const topCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];
    for (const symbol of topCoins) {
        const data = priceData[symbol];
        if (data) {
            const changeNum = parseFloat(data.change);
            const changeClass = changeNum >= 0 ? 'positive' : 'negative';
            const changeSign = changeNum >= 0 ? '▲' : '▼';
            
            const coinItem = document.createElement('div');
            coinItem.className = 'coin-item';
            coinItem.innerHTML = `
                <span class="coin-name">${symbol}</span>
                <span class="coin-price">$${parseFloat(data.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                <span class="coin-change ${changeClass}">${changeSign} ${Math.abs(changeNum).toFixed(2)}%</span>
            `;
            coinsListContainer.appendChild(coinItem);
        }
    }
    
    // Store all coins for dropdown - ALWAYS populate regardless of priceData
    allCoins = [];
    const moreCoinsList = [
        { name: 'ADA', price: '0.45', change: '1.2' },
        { name: 'DOGE', price: '0.12', change: '-0.8' },
        { name: 'MATIC', price: '0.89', change: '2.1' },
        { name: 'DOT', price: '6.50', change: '-1.0' },
        { name: 'AVAX', price: '35.20', change: '4.5' },
        { name: 'LINK', price: '14.30', change: '1.5' },
        { name: 'LTC', price: '82.40', change: '-0.3' },
        { name: 'UNI', price: '7.80', change: '2.0' }
    ];
    
    for (const coin of moreCoinsList) {
        allCoins.push({
            name: coin.name,
            price: coin.price,
            change: coin.change
        });
    }
    
    console.log('Profile coins displayed, allCoins count:', allCoins.length);
}

function setupCoinDropdown() {
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    const dropdownCoins = document.getElementById('dropdownCoins');
    
    console.log('Dropdown trigger found:', !!dropdownTrigger);
    console.log('Dropdown coins found:', !!dropdownCoins);
    
    if (!dropdownTrigger || !dropdownCoins) return;
    
    // Remove existing event listeners
    const newTrigger = dropdownTrigger.cloneNode(true);
    dropdownTrigger.parentNode.replaceChild(newTrigger, dropdownTrigger);
    
    newTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Dropdown clicked, allCoins length:', allCoins.length);
        dropdownCoins.classList.toggle('show');
        
        // Populate dropdown if empty
        if (dropdownCoins.innerHTML === '' && allCoins.length > 0) {
            console.log('Populating dropdown with', allCoins.length, 'coins');
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
        } else if (dropdownCoins.innerHTML === '') {
            console.log('allCoins is empty, cannot populate dropdown');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!newTrigger.contains(e.target) && !dropdownCoins.contains(e.target)) {
            dropdownCoins.classList.remove('show');
        }
    });
}

function startPriceUpdates() {
    // No API updates needed - using static prices
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