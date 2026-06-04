// Records Page - Firebase realtime version

let allRecords = [];
let activeTab = 'all';
let userId = null;

const statusMap = {
    pending: { class: 'status-pending', label: 'Pending' },
    confirmed: { class: 'status-confirmed', label: 'Confirmed' },
    rejected: { class: 'status-rejected', label: 'Rejected' }
};

document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    userId = sessionStorage.getItem('userId');

    console.log('Records page loaded');
    console.log('Is logged in:', isLoggedIn);
    console.log('User ID:', userId);

    if (!isLoggedIn || isLoggedIn !== 'true' || !userId) {
        window.location.href = 'index.html';
        return;
    }

    setupTabs();
    setupNavigation();
    attachRealtimeListeners();
});

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            activeTab = this.getAttribute('data-tab');
            filterRecords(activeTab);
        });
    });
}

function setupNavigation() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }

    document.querySelectorAll('.nav-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const page = button.getAttribute('data-page');
            if (page === 'home') window.location.href = 'dashboard.html';
            else if (page === 'starting') window.location.href = 'starting.html';
            else if (page === 'records') window.location.href = 'records.html';
        });
    });
}

function attachRealtimeListeners() {
    const depositsRef = database.ref('deposits');
    const withdrawalsRef = database.ref('withdrawals');

    depositsRef.on('value', snapshot => {
        const deposits = snapshot.val() || {};
        syncDepositRecords(deposits);
    });

    withdrawalsRef.on('value', snapshot => {
        const withdrawals = snapshot.val() || {};
        syncWithdrawalRecords(withdrawals);
    });
}

function syncDepositRecords(deposits) {
    console.log('Syncing deposit records:', deposits);
    const records = [];
    for (let id in deposits) {
        const deposit = deposits[id];
        console.log('Processing deposit:', deposit, 'userId:', userId);
        if (!deposit || deposit.userId !== userId) continue;

        records.push({
            id: deposit.id || id,
            type: 'deposit',
            amount: parseFloat(deposit.amount || 0),
            date: deposit.date ? new Date(deposit.date).toLocaleString() : new Date().toLocaleString(),
            status: deposit.status || 'confirmed',
            remark: deposit.remark || 'Deposit'
        });
    }

    console.log('Deposit records for user:', records);
    updateRecords(records, 'deposit');
}

function syncWithdrawalRecords(withdrawals) {
    console.log('Syncing withdrawal records:', withdrawals);
    const records = [];
    for (let id in withdrawals) {
        const withdrawal = withdrawals[id];
        console.log('Processing withdrawal:', withdrawal, 'userId:', userId);
        if (!withdrawal || withdrawal.userId !== userId) continue;

        records.push({
            id: withdrawal.id || id,
            type: 'withdraw',
            amount: parseFloat(withdrawal.amount || 0),
            date: withdrawal.requestDate ? new Date(withdrawal.requestDate).toLocaleString() : new Date().toLocaleString(),
            status: withdrawal.status || 'pending',
            remark: withdrawal.status === 'pending' ? 'Processing' : withdrawal.status === 'confirmed' ? 'Completed' : 'Rejected'
        });
    }

    console.log('Withdrawal records for user:', records);
    updateRecords(records, 'withdraw');
}

function updateRecords(records, type) {
    allRecords = allRecords.filter(function(record) {
        return record.type !== type;
    }).concat(records);

    allRecords.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    filterRecords(activeTab);
}

function displayRecords(records) {
    console.log('Displaying records:', records);
    const recordsList = document.getElementById('recordsList');
    if (!recordsList) {
        console.log('recordsList element not found');
        return;
    }

    if (!records || records.length === 0) {
        console.log('No records to display');
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

        const statusInfo = statusMap[record.status] || statusMap.pending;

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
                <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
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
