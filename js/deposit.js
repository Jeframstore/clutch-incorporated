// Deposit Page - Firebase Version

document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    await loadServiceContacts();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    const whatsappBtn = document.getElementById('whatsappBtn');
    const telegramBtn = document.getElementById('telegramBtn');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const whatsappNumber = localStorage.getItem('depositWhatsapp') || '+12345678900';
            window.open('https://wa.me/' + whatsappNumber.replace(/[^0-9]/g, ''), '_blank');
        });
    }
    
    if (telegramBtn) {
        telegramBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const telegramUser = localStorage.getItem('depositTelegram') || '@ClutchSupport';
            window.open('https://t.me/' + telegramUser.replace('@', ''), '_blank');
        });
    }
});

async function loadServiceContacts() {
    try {
        const snapshot = await database.ref('settings/serviceContacts').once('value');
        const contacts = snapshot.val();
        
        if (contacts) {
            localStorage.setItem('depositWhatsapp', contacts.whatsapp || '+1 234 567 8900');
            localStorage.setItem('depositTelegram', contacts.telegram || '@ClutchSupport');
        }
        
        const whatsappNumber = localStorage.getItem('depositWhatsapp') || '+1 234 567 8900';
        const telegramUsername = localStorage.getItem('depositTelegram') || '@ClutchSupport';
        
        const whatsappElement = document.getElementById('whatsappNumber');
        const telegramElement = document.getElementById('telegramUsername');
        
        if (whatsappElement) whatsappElement.textContent = whatsappNumber;
        if (telegramElement) telegramElement.textContent = telegramUsername;
        
    } catch (error) {
        console.error('Error loading service contacts:', error);
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