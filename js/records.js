// Records Page - Complete

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadRecords();
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            const tab = this.getAttribute('data-tab');
            filterRecords(tab);
        });
    });
    
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
});

let allRecords = [];

function loadRecords() {
    // Load deposits from localStorage
    let deposits = localStorage.getItem('depositRecords');
    if (!deposits) {
        // Sample deposit records
        deposits = [
            {
                id: 'COMM6a1754cae40a29',
                type: 'deposit',
                amount: 0.03,
                date: '2024-05-28 14:30:00',
                status: 'confirmed',
                remark: 'Deposit via USDT'
            },
            {
                id: 'COMM6a1754c1d69830',
                type: 'deposit',
                amount: 0.03,
                date: '2024-05-27 09:15:00',
                status: 'confirmed',
                remark: 'Deposit via USDT'
            },
            {
                id: 'COMM6a1754b4e188c0',
                type: 'deposit',
                amount: 0.05,
                date: '2024-05-26 18:45:00',
                status: 'confirmed',
                remark: 'Deposit via USDT'
            },
            {
                id: 'COMM6a1754ac5b95b2',
                type: 'deposit',
                amount: 0.02,
                date: '2024-05-25 11:20:00',
                status: 'confirmed',
                remark: 'Deposit via USDT'
            }
        ];
        localStorage.setItem('depositRecords', JSON.stringify(deposits));
    }
    
    // Load withdrawals from localStorage
    let withdrawals = localStorage.getItem('withdrawalRecords');
    if (!withdrawals) {
        withdrawals = [
            {
                id: 'WD1712345678901',
                type: 'withdraw',
                amount: 50.00,
                date: '2024-05-20 10:30:00',
                status: 'confirmed',
                remark: 'Withdrawal to USDT wallet'
            },
            {
                id: 'WD1712345678902',
                type: 'withdraw',
                amount: 30.00,
                date: '2024-05-15 14:20:00',
                status: 'pending',
                remark: 'Processing withdrawal'
            },
            {
                id: 'WD1712345678903',
                type: 'withdraw',
                amount: 100.00,
                date: '2024-05-10 09:45:00',
                status: 'rejected',
                remark: 'Insufficient balance verification'
            }
        ];
        localStorage.setItem('withdrawalRecords', JSON.stringify(withdrawals));
    }
    
    // Get pending withdrawals from withdrawal requests
    let pendingRequests = localStorage.getItem('pendingWithdrawals');
    if (pendingRequests) {
        pendingRequests = JSON.parse(pendingRequests);
        let existingWithdrawals = JSON.parse(localStorage.getItem('withdrawalRecords') || '[]');
        
        pendingRequests.forEach(function(req) {
            const exists = existingWithdrawals.some(function(w) {
                return w.id === req.id;
            });
            if (!exists) {
                existingWithdrawals.unshift({
                    id: req.id,
                    type: 'withdraw',
                    amount: req.amount,
                    date: new Date(req.requestDate).toLocaleString(),
                    status: 'pending',
                    remark: 'Withdrawal request submitted'
                });
            }
        });
        localStorage.setItem('withdrawalRecords', JSON.stringify(existingWithdrawals));
    }
    
    // Combine all records
    let depositRecords = JSON.parse(localStorage.getItem('depositRecords') || '[]');
    let withdrawalRecords = JSON.parse(localStorage.getItem('withdrawalRecords') || '[]');
    
    allRecords = [...depositRecords, ...withdrawalRecords];
    
    // Sort by date (newest first)
    allRecords.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    
    displayRecords(allRecords);
}

function displayRecords(records) {
    const recordsList = document.getElementById('recordsList');
    
    if (!records || records.length === 0) {
        recordsList.innerHTML = '<div class="empty-state">No transaction records found</div>';
        return;
    }
    
    recordsList.innerHTML = '';
    
    records.forEach(function(record) {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'record-item';
        
        const typeClass = record.type === 'deposit' ? 'deposit' : 'withdraw';
        const amountClass = record.type === 'deposit' ? 'positive' : 'negative';
        const amountSymbol = record.type === 'deposit' ? '+' : '-';
        
        let statusClass = '';
        let statusText = '';
        
        switch(record.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'Pending';
                break;
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Confirmed';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = 'Rejected';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Pending';
        }
        
        recordDiv.innerHTML = `
            <div class="record-header">
                <span class="record-type ${typeClass}">${record.type.toUpperCase()}</span>
                <span class="record-amount ${amountClass}">${amountSymbol}$${record.amount.toFixed(2)}</span>
            </div>
            <div class="record-details">
                <span class="record-id">${record.id}</span>
                <span class="record-date">${record.date}</span>
            </div>
            <div class="record-status">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <span class="record-remark">${record.remark || '-'}</span>
            </div>
        `;
        
        recordsList.appendChild(recordDiv);
    });
}

function filterRecords(tab) {
    let filtered = [];
    
    if (tab === 'all') {
        filtered = allRecords;
    } else if (tab === 'deposit') {
        filtered = allRecords.filter(function(r) {
            return r.type === 'deposit';
        });
    } else if (tab === 'withdraw') {
        filtered = allRecords.filter(function(r) {
            return r.type === 'withdraw';
        });
    }
    
    displayRecords(filtered);
}

// Bottom navigation
document.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const page = button.getAttribute('data-page');
        
        if (page === 'home') {
            window.location.href = 'dashboard.html';
        } else if (page === 'starting') {
            window.location.href = 'starting.html';
        } else if (page === 'records') {
            // Already on records page
        }
    });
});