// Records Page - Original Working Version

let allRecords = [];

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    loadRecords();
    
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
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
});

function loadRecords() {
    let deposits = JSON.parse(localStorage.getItem('depositRecords') || '[]');
    let withdrawals = JSON.parse(localStorage.getItem('withdrawalRecords') || '[]');
    let pendingRequests = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
    
    allRecords = [];
    
    deposits.forEach(function(d) {
        allRecords.push({
            id: d.id,
            type: 'deposit',
            amount: d.amount,
            date: d.date,
            status: d.status || 'confirmed',
            remark: d.remark || 'Deposit'
        });
    });
    
    withdrawals.forEach(function(w) {
        allRecords.push({
            id: w.id,
            type: 'withdraw',
            amount: w.amount,
            date: new Date(w.requestDate).toLocaleString(),
            status: w.status,
            remark: w.status === 'pending' ? 'Processing' : (w.status === 'confirmed' ? 'Completed' : 'Rejected')
        });
    });
    
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
                <span class="record-amount ${amountClass}">${amountSymbol}$${parseFloat(record.amount).toFixed(2)}</span>
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
        filtered = allRecords.filter(function(r) { return r.type === 'deposit'; });
    } else if (tab === 'withdraw') {
        filtered = allRecords.filter(function(r) { return r.type === 'withdraw'; });
    }
    
    displayRecords(filtered);
}

document.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const page = button.getAttribute('data-page');
        
        if (page === 'home') {
            window.location.href = 'dashboard.html';
        } else if (page === 'starting') {
            window.location.href = 'starting.html';
        }
    });
});