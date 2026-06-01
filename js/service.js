// Service Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadContactNumbers();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    const whatsappLink = document.getElementById('whatsappLink');
    const telegramLink = document.getElementById('telegramLink');
    
    if (whatsappLink) {
        whatsappLink.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const snap = await database.ref('settings/serviceContacts').once('value');
                const contacts = snap.val() || { whatsapp: '+1 234 567 8900' };
                const whatsappNumber = contacts.whatsapp;
                window.open('https://wa.me/' + whatsappNumber.replace(/[^0-9]/g, ''), '_blank');
            } catch (err) {
                console.error('Error loading whatsapp:', err);
            }
        });
    }
    
    if (telegramLink) {
        telegramLink.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const snap = await database.ref('settings/serviceContacts').once('value');
                const contacts = snap.val() || { telegram: '@ClutchSupport' };
                const telegramUser = contacts.telegram;
                window.open('https://t.me/' + telegramUser.replace('@', ''), '_blank');
            } catch (err) {
                console.error('Error loading telegram:', err);
            }
        });
    }
});

async function loadContactNumbers() {
    try {
        const snap = await database.ref('settings/serviceContacts').once('value');
        const contacts = snap.val() || { whatsapp: '+1 234 567 8900', telegram: '@ClutchSupport' };
        const whatsappNumber = contacts.whatsapp;
        const telegramUsername = contacts.telegram;
        
        const whatsappElement = document.getElementById('whatsappNumber');
        const telegramElement = document.getElementById('telegramUsername');
        
        if (whatsappElement) {
            whatsappElement.textContent = whatsappNumber;
        }
        
        if (telegramElement) {
            telegramElement.textContent = telegramUsername;
        }
    } catch (e) {
        console.error('Error loading contact numbers:', e);
    }
}

document.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const page = button.getAttribute('data-page');
        
        if (page === 'home') {
            window.location.href = 'dashboard.html';
        } else if (page === 'starting') {
            window.location.href = 'starting.html';
        } else if (page === 'records') {
            window.location.href = 'records.html';
        }
    });
});