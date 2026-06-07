// Email Templates

// Send Welcome Email
function sendWelcomeEmail(userEmail, username) {
    const templateParams = {
        to_email: userEmail,
        to_name: username,
        subject: "Welcome to Clutch Revenue! 🎉",
        message: `
            <h2>Welcome ${username}!</h2>
            <p>Thank you for joining Clutch Revenue.</p>
            <p>You can now:</p>
            <ul>
                <li>Complete daily tasks to earn USDT</li>
                <li>Track your earnings</li>
                <li>Request withdrawals</li>
            </ul>
            <p>Get started by logging in: <a href="https://clutchrevenue.com">https://clutchrevenue.com</a></p>
            <br>
            <p>Best regards,<br>Clutch Revenue Team</p>
        `
    };
    
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

// Send Withdrawal Status Email
function sendWithdrawalStatusEmail(userEmail, username, amount, status, transactionId) {
    const statusText = status === 'confirmed' ? '✅ Approved' : '❌ Rejected';
    const statusColor = status === 'confirmed' ? '#00ff00' : '#ff4444';
    
    const templateParams = {
        to_email: userEmail,
        to_name: username,
        subject: `Withdrawal ${status === 'confirmed' ? 'Approved' : 'Updated'} - Clutch Revenue`,
        message: `
            <h2>Withdrawal Request ${status === 'confirmed' ? 'Approved' : 'Update'}</h2>
            <p>Dear ${username},</p>
            <p>Your withdrawal request has been <strong style="color:${statusColor}">${statusText}</strong>.</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Amount:</strong> ${amount} USDT</p>
            ${status === 'confirmed' ? '<p>Funds have been sent to your wallet. Please allow 24-48 hours for processing.</p>' : '<p>Please contact support if you have any questions.</p>'}
            <br>
            <p>View your transaction history: <a href="https://clutchrevenue.com/records.html">https://clutchrevenue.com/records.html</a></p>
            <br>
            <p>Best regards,<br>Clutch Revenue Team</p>
        `
    };
    
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

// Send Password Reset OTP Email
function sendPasswordResetEmail(userEmail, username, otpCode) {
    const templateParams = {
        to_email: userEmail,
        to_name: username,
        subject: "Password Reset Request - Clutch Revenue",
        message: `
            <h2>Password Reset Request</h2>
            <p>Dear ${username},</p>
            <p>You requested to reset your password. Use the following OTP code:</p>
            <h1 style="font-size: 32px; color: #ffd700; letter-spacing: 4px;">${otpCode}</h1>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Clutch Revenue Team</p>
        `
    };
    
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

// Send Task Reminder Email
function sendTaskReminderEmail(userEmail, username, taskCount) {
    const templateParams = {
        to_email: userEmail,
        to_name: username,
        subject: "New Tasks Available! - Clutch Revenue",
        message: `
            <h2>New Tasks Available!</h2>
            <p>Dear ${username},</p>
            <p>There are <strong>${taskCount}</strong> new tasks waiting for you!</p>
            <p>Complete them now to earn USDT.</p>
            <br>
            <p>Start working: <a href="https://clutchrevenue.com/starting.html">https://clutchrevenue.com/starting.html</a></p>
            <br>
            <p>Best regards,<br>Clutch Revenue Team</p>
        `
    };
    
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

// Send Deposit Confirmation Email
function sendDepositConfirmationEmail(userEmail, username, amount, transactionId) {
    const templateParams = {
        to_email: userEmail,
        to_name: username,
        subject: "Deposit Confirmed - Clutch Revenue",
        message: `
            <h2>Deposit Confirmed!</h2>
            <p>Dear ${username},</p>
            <p>Your deposit of <strong>${amount} USDT</strong> has been confirmed.</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p>Your balance has been updated.</p>
            <br>
            <p>View your balance: <a href="https://clutchrevenue.com/dashboard.html">https://clutchrevenue.com/dashboard.html</a></p>
            <br>
            <p>Best regards,<br>Clutch Revenue Team</p>
        `
    };
    
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}

// Send Sign-in Bonus Email (when 15 days completed)
function sendBonusPayoutEmail(userEmail, username, bonusAmount, newBalance) {
    const templateParams = {
        to_email: userEmail,
        to_name: username,
        subject: "🎉 Sign-in Bonus Paid Out! - Clutch Revenue",
        message: `
            <h2>Congratulations!</h2>
            <p>Dear ${username},</p>
            <p>You have successfully completed 15 consecutive days of sign-in!</p>
            <p>Your <strong>${bonusAmount} USDT</strong> bonus has been added to your balance.</p>
            <p><strong>New Balance:</strong> ${newBalance} USDT</p>
            <br>
            <p>Keep up the great work!</p>
            <br>
            <p>Best regards,<br>Clutch Revenue Team</p>
        `
    };
    
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
}