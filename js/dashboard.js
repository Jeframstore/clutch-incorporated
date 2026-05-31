// Dashboard - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username || 'Collins';
    }
    
    const savedMessage = localStorage.getItem('welcomeMessage');
    const marqueeElement = document.getElementById('welcomeMarquee');
    if (savedMessage && marqueeElement) {
        marqueeElement.textContent = savedMessage;
    }
    
    let signInCount = localStorage.getItem('signInCount');
    if (signInCount === null) {
        signInCount = 0;
        localStorage.setItem('signInCount', signInCount);
    }
    
    const lastSignIn = localStorage.getItem('lastSignIn');
    const today = new Date().toDateString();
    
    if (lastSignIn !== today) {
        signInCount = parseInt(signInCount) + 1;
        localStorage.setItem('signInCount', signInCount);
        localStorage.setItem('lastSignIn', today);
        updateSignInDisplay(signInCount);
        
        const reward = getRewardForDay(signInCount);
        if (reward > 0) {
            setTimeout(function() {
                alert('Daily sign-in reward: +' + reward + ' USDT!');
            }, 500);
        }
    } else {
        updateSignInDisplay(signInCount);
    }
    
    const profileIcon = document.getElementById('profileIconBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileIcon && profileMenu) {
        profileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            if (profileMenu.style.display === 'none') {
                profileMenu.style.display = 'block';
            } else {
                profileMenu.style.display = 'none';
            }
        });
        
        document.addEventListener('click', function() {
            profileMenu.style.display = 'none';
        });
        
        const profileMenuItem = document.getElementById('profileMenuItem');
        const logoutMenuItem = document.getElementById('logoutMenuItem');
        
        if (profileMenuItem) {
            profileMenuItem.addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
        }
        
        if (logoutMenuItem) {
            logoutMenuItem.addEventListener('click', function() {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'index.html';
            });
        }
    }
});

function getRewardForDay(day) {
    const rewards = {
        1: 300, 2: 150, 3: 500, 4: 1000, 5: 50,
        6: 300, 7: 300, 8: 0, 9: 0, 10: 0,
        11: 0, 12: 0, 13: 0, 14: 0, 15: 0
    };
    
    if (day <= 15) {
        return rewards[day] || 0;
    } else {
        localStorage.setItem('signInCount', 0);
        return 0;
    }
}

function updateSignInDisplay(count) {
    const counterElement = document.querySelector('.signin-counter');
    if (counterElement) {
        counterElement.textContent = `SIGN IN NOW (${count}/15)`;
    }
    
    if (count >= 15) {
        setTimeout(function() {
            alert('Congratulations! You completed 15 days of continuous sign in!');
        }, 500);
    }
}

document.querySelectorAll('.menu-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        
        switch(page) {
            case 'service':
                window.location.href = 'service.html';
                break;
            case 'withdraw':
                window.location.href = 'withdraw.html';
                break;
            case 'deposit':
                window.location.href = 'deposit.html';
                break;
            case 'terms':
                window.location.href = 'terms.html';
                break;
            case 'certificate':
                window.location.href = 'certificate.html';
                break;
            case 'faqs':
                window.location.href = 'faqs.html';
                break;
            case 'about':
                window.location.href = 'about.html';
                break;
            default:
                break;
        }
    });
});

document.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        document.querySelectorAll('.nav-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        const page = this.getAttribute('data-page');
        
        if (page === 'home') {
            // Already on home
        } else if (page === 'starting') {
            window.location.href = 'starting.html';
        } else if (page === 'records') {
            window.location.href = 'records.html';
        }
    });
});

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}