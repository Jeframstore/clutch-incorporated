// Deposit Page\nimport { database } from './firebase-config.js'; - Original Working Version

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
    
    const whatsappBtn = document.getElementById('whatsappBtn');
    const telegramBtn = document.getElementById('telegramBtn');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const userId = sessionStorage.getItem('userId');
                const userSnap = await database.ref('users/' + userId).once('value');
                const user = userSnap.val();
                
                let whatsappNumber;
                // Check if user has assigned customer service contacts
                if (user && user.assignedWhatsapp) {
                    whatsappNumber = user.assignedWhatsapp;
                }
                
                // Fall back to default service contacts
                if (!whatsappNumber) {
                    const snap = await database.ref('settings/serviceContacts').once('value');
                    const contacts = snap.val() || { whatsapp: '+1 234 567 8900' };
                    whatsappNumber = contacts.whatsapp;
                }
                
                window.open('https://wa.me/' + whatsappNumber.replace(/[^0-9]/g, ''), '_blank');
            } catch (err) {
                console.error('Error loading whatsapp:', err);
            }
        });
    }
    
    if (telegramBtn) {
        telegramBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const userId = sessionStorage.getItem('userId');
                const userSnap = await database.ref('users/' + userId).once('value');
                const user = userSnap.val();
                
                let telegramUser;
                // Check if user has assigned customer service contacts
                if (user && user.assignedTelegram) {
                    telegramUser = user.assignedTelegram;
                }
                
                // Fall back to default service contacts
                if (!telegramUser) {
                    const snap = await database.ref('settings/serviceContacts').once('value');
                    const contacts = snap.val() || { telegram: '@ClutchSupport' };
                    telegramUser = contacts.telegram;
                }
                
                window.open('https://t.me/' + telegramUser.replace('@', ''), '_blank');
            } catch (err) {
                console.error('Error loading telegram:', err);
            }
        });
    }
});


async function loadContactNumbers() {
    try {
        const userId = sessionStorage.getItem('userId');
        console.log('Loading contacts for userId:', userId);
        
        const userSnap = await database.ref('users/' + userId).once('value');
        const user = userSnap.val();
        
        console.log('User data:', user);
        console.log('assignedWhatsapp:', user?.assignedWhatsapp);
        console.log('assignedTelegram:', user?.assignedTelegram);
        
        let whatsappNumber, telegramUsername;
        
        // Check if user has assigned customer service contacts
        if (user && user.assignedWhatsapp && user.assignedTelegram) {
            whatsappNumber = user.assignedWhatsapp;
            telegramUsername = user.assignedTelegram;
            console.log('Using assigned contacts:', whatsappNumber, telegramUsername);
        }
        
        // Fall back to default service contacts if no assigned contacts
        if (!whatsappNumber || !telegramUsername) {
            const snap = await database.ref('settings/serviceContacts').once('value');
            const contacts = snap.val() || { whatsapp: '+1 234 567 8900', telegram: '@ClutchSupport' };
            whatsappNumber = whatsappNumber || contacts.whatsapp;
            telegramUsername = telegramUsername || contacts.telegram;
            console.log('Using default contacts:', whatsappNumber, telegramUsername);
        }
        
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
