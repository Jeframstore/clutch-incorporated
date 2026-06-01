// Certificate Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadCertificateData();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
});

function loadCertificateData() {
    let certificateImage = localStorage.getItem('certificateImage');
    const certificateImg = document.getElementById('certificateImage');
    const noImagePlaceholder = document.getElementById('noImagePlaceholder');
    
    if (certificateImage && certificateImage !== '') {
        certificateImg.src = certificateImage;
        certificateImg.style.display = 'block';
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'none';
        }
    } else {
        certificateImg.style.display = 'none';
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'block';
        }
    }
    
    let certificateText = localStorage.getItem('certificateText');
    const textContainer = document.getElementById('certificateText');
    
    if (!certificateText) {
        certificateText = `This certifies that Clutch Incorporated is a verified and registered platform operating under international financial regulations. All transactions are secured and monitored for compliance with anti-money laundering policies.`;
        localStorage.setItem('certificateText', certificateText);
    }
    
    if (textContainer) {
        textContainer.innerHTML = certificateText;
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