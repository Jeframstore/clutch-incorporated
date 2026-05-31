// Records Page - Complete

let userId = null;
let allRecords = [];

document.addEventListener('DOMContentLoaded', async function() {
    userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    await loadRecords();
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.getAttribute('data-tab');
            filterRecords(tab);
        });
    });
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = 'dashboard.html');
});

async function loadRecords() {
    try {
        const withdrawalsSnap = await database.ref('withdrawals').once('value');
        const withdrawals = withdrawalsSnap.val() || {};
        
        allRecords = [];
        
        for (let id in withdrawals) {
            const w = withdrawals[id];
            if (w.userId === userId) {
                allRecords.push({
                    id: w.id,
                    type: 'withdraw',
                    amount: w.amount,
                    date: new Date(w.requestDate).toLocaleString(),
                    status: w.status || 'pending',
                    remark: w.status === 'pending' ? 'Processing' : (w.status === 'confirmed' ? 'Completed' : 'Rejected')
                });
            }
        }
        
        allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayRecords(allRecords);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayRecords(records) {
    const container = document.getElementById('recordsList');
    
    if (!records || records.length === 0) {
        container.innerHTML = '<div class="empty-state">No transaction records found</div>';
        return;
    }
    
    container.innerHTML = '';
    
    records.forEach(record => {
        const div = document.createElement('div');
        div.className = 'record-item';
        
        const typeClass = record.type === 'deposit' ? 'deposit' : 'withdraw';
        const amountClass = record.type === 'deposit' ? 'positive' : 'negative';
        const amountSymbol = record.type === 'deposit' ? '+' : '-';
        
        let statusClass = '', statusText = '';
        if (record.status === 'pending') { statusClass = 'status-pending'; statusText = 'Pending'; }
        else if (record.status === 'confirmed') { statusClass = 'status-confirmed'; statusText = 'Confirmed'; }
        else { statusClass = 'status-rejected'; statusText = 'Rejected'; }
        
        div.innerHTML = `
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
        container.appendChild(div);
    });
}

function filterRecords(tab) {
    if (tab === 'all') displayRecords(allRecords);
    else if (tab === 'deposit') displayRecords(allRecords.filter(r => r.type === 'deposit'));
    else if (tab === 'withdraw') displayRecords(allRecords.filter(r => r.type === 'withdraw'));
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        if (page === 'home') window.location.href = 'dashboard.html';
        if (page === 'starting') window.location.href = 'starting.html';
    });
});