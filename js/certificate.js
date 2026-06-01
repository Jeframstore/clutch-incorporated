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

async function loadCertificateData() {
    try {
        const imageSnap = await database.ref('settings/certificateImage').once('value');
        const certificateImage = imageSnap.val();
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
        
        const textSnap = await database.ref('settings/certificateText').once('value');
        let certificateText = textSnap.val();
        const textContainer = document.getElementById('certificateText');
        
        if (!certificateText) {
            certificateText = `This certifies that Clutch Incorporated is a verified and registered platform operating under international financial regulations. All transactions are secured and monitored for compliance with anti-money laundering policies.`;
            await database.ref('settings/certificateText').set(certificateText);
        }
        
        if (textContainer) {
            textContainer.innerHTML = certificateText;
        }
    } catch (e) {
        console.error('Error loading certificate data:', e);
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