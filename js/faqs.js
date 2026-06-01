// FAQS Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadFAQSFile();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
});

function loadFAQSFile() {
    const pdfUrl = localStorage.getItem('faqsPDF');
    const pdfFrame = document.getElementById('pdfFrame');
    const noPdfPlaceholder = document.getElementById('noPdfPlaceholder');
    
    if (pdfUrl && pdfUrl !== '') {
        pdfFrame.src = pdfUrl;
        pdfFrame.style.display = 'block';
        if (noPdfPlaceholder) {
            noPdfPlaceholder.style.display = 'none';
        }
    } else {
        pdfFrame.style.display = 'none';
        if (noPdfPlaceholder) {
            noPdfPlaceholder.style.display = 'block';
        }
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