/**
 * BookBuzz Email Service
 * Handles sending emails via the backend API
 * 
 * Usage:
 * - Development: Simulates email sending with alerts/console logs
 * - Production: Calls the PHP API to send real emails
 */

class EmailService {
    constructor() {
        this.apiUrl = this.getApiUrl();
        this.isProduction = window.location.hostname !== 'localhost' && 
                           !window.location.hostname.includes('127.0.0.1');
    }

    getApiUrl() {
        // Auto-detect API URL based on current location
        const baseUrl = window.location.origin;
        return `${baseUrl}/BookBuzzz/api/send-email.php`;
    }

    /**
     * Send OTP email
     * @param {string} email - Recipient email
     * @param {string} otp - OTP code
     * @param {string} name - User name
     */
    async sendOTP(email, otp, name = '') {
        const subject = 'Your BookBuzz Verification Code';
        const body = `
            <h2>Hello ${name || 'there'},</h2>
            <p>Your verification code for BookBuzz is:</p>
            <div class="otp-box">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <br>
            <p>Best regards,<br>BookBuzz Team</p>
        `;

        return await this.sendEmail(email, subject, body, 'otp');
    }

    /**
     * Send welcome email after registration
     * @param {string} email - Recipient email
     * @param {string} name - User name
     */
    async sendWelcomeEmail(email, name) {
        const subject = 'Welcome to BookBuzz!';
        const body = `
            <h2>Welcome to BookBuzz, ${name}!</h2>
            <p>Thank you for joining India's largest student-to-student book exchange platform.</p>
            <p>With BookBuzz, you can:</p>
            <ul>
                <li>Buy second-hand books at affordable prices</li>
                <li>Sell your used books to fellow students</li>
                <li>Access notes and study materials</li>
                <li>Connect with students from your college</li>
            </ul>
            <a href="${window.location.origin}/buy.html" class="button">Start Exploring</a>
            <br><br>
            <p>Happy Learning!<br>BookBuzz Team</p>
        `;

        return await this.sendEmail(email, subject, body, 'welcome');
    }

    /**
     * Send purchase confirmation email
     * @param {string} email - Buyer email
     * @param {string} name - Buyer name
     * @param {Object} book - Book details
     * @param {string} sellerName - Seller name
     */
    async sendPurchaseConfirmation(email, name, book, sellerName) {
        const subject = `Purchase Confirmation - ${book.title}`;
        const body = `
            <h2>Purchase Successful!</h2>
            <p>Hi ${name},</p>
            <p>You have successfully purchased:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Price:</strong> ₹${book.price}</p>
                <p><strong>Seller:</strong> ${sellerName}</p>
            </div>
            <p>The seller has been notified. You can contact them through your dashboard.</p>
            <a href="${window.location.origin}/dashboard.html" class="button">View in Dashboard</a>
        `;

        return await this.sendEmail(email, subject, body, 'purchase');
    }

    /**
     * Send contact seller notification
     * @param {string} sellerEmail - Seller email
     * @param {string} buyerName - Buyer name
     * @param {Object} book - Book details
     * @param {string} message - Buyer message
     */
    async sendContactSellerNotification(sellerEmail, buyerName, book, message) {
        const subject = `Someone is interested in your book: ${book.title}`;
        const body = `
            <h2>New Interest in Your Book!</h2>
            <p>Hi there,</p>
            <p><strong>${buyerName}</strong> is interested in your book:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${book.title}</h3>
                <p><strong>Price:</strong> ₹${book.price}</p>
            </div>
            <p><strong>Their message:</strong></p>
            <blockquote style="border-left: 3px solid #e86c1f; padding-left: 15px; color: #666;">
                ${message}
            </blockquote>
            <a href="${window.location.origin}/dashboard.html" class="button">Respond in Dashboard</a>
        `;

        return await this.sendEmail(sellerEmail, subject, body, 'contact');
    }

    /**
     * Send listing approval notification
     * @param {string} email - Seller email
     * @param {string} name - Seller name
     * @param {Object} book - Book details
     * @param {boolean} approved - Whether approved or rejected
     */
    async sendListingStatusNotification(email, name, book, approved) {
        const status = approved ? 'Approved' : 'Rejected';
        const subject = `Your Book Listing has been ${status}`;
        const body = approved ? `
            <h2>Congratulations, ${name}!</h2>
            <p>Your book listing has been approved and is now live on BookBuzz.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>${book.title}</h3>
                <p><strong>Price:</strong> ₹${book.price}</p>
            </div>
            <a href="${window.location.origin}/buy.html" class="button">View Your Listing</a>
        ` : `
            <h2>Listing Update</h2>
            <p>Hi ${name},</p>
            <p>Unfortunately, your book listing for <strong>${book.title}</strong> could not be approved.</p>
            <p>Please review our guidelines and try again.</p>
            <a href="${window.location.origin}/sell.html" class="button">List Another Book</a>
        `;

        return await this.sendEmail(email, subject, body, 'listing');
    }

    /**
     * Generic email sending method
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} body - HTML email body
     * @param {string} type - Email type (otp, welcome, purchase, etc.)
     */
    async sendEmail(to, subject, body, type = 'generic') {
        // In development, simulate email sending
        if (!this.isProduction && window.location.hostname === 'localhost') {
            console.log('📧 [DEV MODE] Email would be sent:', {
                to,
                subject,
                type,
                preview: body.substring(0, 100) + '...'
            });
            
            // Show OTP in alert for testing
            if (type === 'otp') {
                const otpMatch = body.match(/class="otp-box">(\d+)</);
                if (otpMatch) {
                    alert(`📧 DEVELOPMENT MODE\n\nEmail would be sent to: ${to}\n\nOTP: ${otpMatch[1]}\n\n(In production, this would be sent via SMTP)`);
                }
            }
            
            return { success: true, message: 'Email simulated (development mode)' };
        }

        // Production: Call backend API
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to,
                    subject,
                    body,
                    type
                })
            });

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Email sending failed:', error);
            return { 
                success: false, 
                message: 'Failed to send email. Please try again.' 
            };
        }
    }
}

// Create global instance
const emailService = new EmailService();

// Make available globally
window.emailService = emailService;
