// Terms Page - Original Working Version

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadTermsContent();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
});

function loadTermsContent() {
    let termsHTML = localStorage.getItem('termsContent');
    
    if (!termsHTML) {
        termsHTML = `
            <div class="terms-section">
                <h3>1. Product Optimization</h3>
                <p>1.1 - A minimum deposit of 100 USDT is required to request a reset to start optimizing products.</p>
                <p>1.2 - After all product optimizations have been completed, the user must request a full withdrawal and receive the withdrawal amount before requesting a reset of the account.</p>
            </div>
            <div class="terms-section">
                <h3>2. Regular Products</h3>
                <p>2.1 - The profit of the regular product is 0.5%, 1%, 1.5% and 2% depending on the VIP level.</p>
                <p>2.2 - After completing an optimized product, the funds and profits will be returned to the user's account balance.</p>
                <p>2.3 - The platform computer system randomly allocates products to the user's account based on the total amount of funds in the user's account.</p>
                <p>2.4 - All products are randomly allocated by the system, customer service and the user cannot cancel or skip the products that the user has received.</p>
                <p>2.5 - In order to protect the user's experience, the price of all products will be increased according to the total amount of the account and the profit will be increased as well.</p>
            </div>
            <div class="terms-section">
                <h3>3. Combined Products</h3>
                <p>3.1 - A combination product is a set of 1-3 products that are combined together and the system will randomly allocate the products in the combination.</p>
                <p>3.2 - The profit of a combination product is 3%, 6%, 9% and 12% depending on the VIP level.</p>
                <p>3.3 - The platform computer system randomly allocates products to the user's account according to the total amount of funds in the user's account.</p>
                <p>3.4 - All products are randomly allocated by the system, customer service and users cannot cancel or skip the products they have been given.</p>
                <p>3.5 - In order to protect the user's experience, the price of all products will be increased according to the total amount of the account, and the profit will also be increased.</p>
                <p>3.6 - When a user's account receives a combination product, the user's account will become negative and the user will not be able to continue with the optimization tasks. The user will need to clear the negative balance before being able to continue with the remaining tasks.</p>
            </div>
            <div class="terms-section">
                <h3>4. Deposits</h3>
                <p>4.1 - The user makes deposits according to his financial capacity. The more the user deposits, the higher the profit the user receives.</p>
                <p>4.2 - The user gets a combination product, the user can deposit according to the negative balance of the user's account.</p>
                <p>4.3 - The merchant's valid address will be updated on a daily basis. Before the user makes a deposit, the user requests a deposit from the online customer service and confirms the merchant's valid address.</p>
                <p>4.4 - The platform and the merchant will not be responsible for any loss of funds if the user does not confirm the merchant's valid address before making a deposit.</p>
            </div>
            <div class="terms-section">
                <h3>5. Withdrawals</h3>
                <p>5.1 - Withdrawal requests are processed within 24-48 hours.</p>
                <p>5.2 - Minimum withdrawal amount is 10 USDT.</p>
                <p>5.3 - Withdrawal fee is 0 USDT.</p>
                <p>5.4 - Users must have a verified wallet address before requesting withdrawal.</p>
            </div>
        `;
        localStorage.setItem('termsContent', termsHTML);
    }
    
    const termsContainer = document.getElementById('termsContent');
    if (termsContainer) {
        termsContainer.innerHTML = termsHTML;
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