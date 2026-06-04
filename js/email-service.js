// Email Service using EmailJS

// You need to configure these values from your EmailJS account
// Get them from: https://www.emailjs.com/
const EMAILJS_SERVICE_ID = 'service_315tb27';
const EMAILJS_TEMPLATE_ID = 'template_gn7wrzc';
const EMAILJS_PUBLIC_KEY = 'uk97dhVnVv4JSZOXL';

// Initialize EmailJS
import emailjs from '@emailjs/browser';

emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Send welcome email to newly registered user
 * @param {string} toEmail - User's email address
 * @param {string} toName - User's name
 * @param {string} invitationCode - User's invitation code
 * @param {string} userId - User's ID
 * @param {string} customMessage - Custom message from admin template
 */
async function sendWelcomeEmail(toEmail, toName, invitationCode, userId, customMessage) {
    try {
        const templateParams = {
            to_email: toEmail,
            to_name: toName,
            invitation_code: invitationCode,
            user_id: userId,
            message: customMessage || 'Welcome to Clutch Incorporated! Your account has been successfully created.'
        };

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        console.log('Welcome email sent successfully to:', toEmail);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
}

/**
 * Send custom email to a specific user
 * @param {string} toEmail - User's email address
 * @param {string} toName - User's name
 * @param {string} subject - Email subject
 * @param {string} message - Email message body
 */
async function sendCustomEmail(toEmail, toName, subject, message) {
    try {
        const templateParams = {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            message: message
        };

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        console.log('Custom email sent successfully to:', toEmail);
        return true;
    } catch (error) {
        console.error('Error sending custom email:', error);
        return false;
    }
}

/**
 * Send bulk email to multiple users
 * @param {Array} users - Array of user objects with email and name
 * @param {string} subject - Email subject
 * @param {string} message - Email message body
 */
async function sendBulkEmail(users, subject, message) {
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
        try {
            const templateParams = {
                to_email: user.email,
                to_name: user.username || user.name,
                subject: subject,
                message: message
            };

            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            successCount++;
            console.log('Bulk email sent to:', user.email);
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            failureCount++;
            console.error('Error sending bulk email to:', user.email, error);
        }
    }

    return { successCount, failureCount, total: users.length };
}
