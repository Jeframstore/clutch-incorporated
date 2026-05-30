// Customer Service Page - Loads User-Specific Contacts

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserSpecificContacts();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    const whatsappLink = document.getElementById('whatsappLink');
    const telegramLink = document.getElementById('telegramLink');
    
    if (whatsappLink) {
        whatsappLink.addEventListener('click', function(e) {
            e.preventDefault();
            const whatsappNumber = localStorage.getItem('userAssignedWhatsapp') || localStorage.getItem('whatsappNumber') || '+12345678900';
            window.open('https://wa.me/' + whatsappNumber.replace(/[^0-9]/g, ''), '_blank');
        });
    }
    
    if (telegramLink) {
        telegramLink.addEventListener('click', function(e) {
            e.preventDefault();
            const telegramUser = localStorage.getItem('userAssignedTelegram') || localStorage.getItem('telegramUsername') || '@ClutchSupport';
            window.open('https://t.me/' + telegramUser.replace('@', ''), '_blank');
        });
    }
});

function loadUserSpecificContacts() {
    let whatsappNumber = localStorage.getItem('userAssignedWhatsapp');
    let telegramUsername = localStorage.getItem('userAssignedTelegram');
    
    if (!whatsappNumber) {
        whatsappNumber = localStorage.getItem('whatsappNumber') || '+1 234 567 8900';
    }
    if (!telegramUsername) {
        telegramUsername = localStorage.getItem('telegramUsername') || '@ClutchSupport';
    }
    
    const whatsappElement = document.getElementById('whatsappNumber');
    const telegramElement = document.getElementById('telegramUsername');
    
    if (whatsappElement) {
        whatsappElement.textContent = whatsappNumber;
    }
    
    if (telegramElement) {
        telegramElement.textContent = telegramUsername;
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