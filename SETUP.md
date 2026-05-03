# 📧 BookBuzz Email & Payment Integration Setup

This guide will help you configure **real email (SMTP)** and **Razorpay payment** integration for BookBuzz.

---

## 🔐 IMPORTANT: Security Warning

**NEVER commit your real credentials to GitHub!** Always use environment variables or config files that are in `.gitignore`.

---

## 📧 Email (SMTP) Setup

### Step 1: Choose Your Email Provider

**Option A: Gmail (Recommended for testing)**
- Requires App Password (not your regular Gmail password)
- Free tier: 500 emails/day

**Option B: Outlook/Office 365**
- Good for professional emails
- Uses your Microsoft account

**Option C: SendGrid / Mailgun (Production)**
- Better deliverability
- Higher sending limits

### Step 2: Get Your SMTP Credentials

#### For Gmail:
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate app password for "Mail"
5. Save the 16-character password

#### For Outlook:
- SMTP Host: `smtp.office365.com`
- Port: `587`
- Username: Your email address
- Password: Your email password

### Step 3: Configure config.php

```bash
# Copy template to real config file
cp config/config.template.php config/config.php

# Edit config.php with your credentials
```

Edit `config/config.php`:

```php
<?php
// SMTP Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'youremail@gmail.com');      // Your email
define('SMTP_PASSWORD', 'xxxx xxxx xxxx xxxx');       // App password (16 chars)
define('SMTP_FROM_EMAIL', 'noreply@bookbuzz.com');
define('SMTP_FROM_NAME', 'BookBuzz');
?>
```

### Step 4: Install PHPMailer

```bash
# Make sure you're in the project root
cd BookBuzzz

# Install PHPMailer via Composer
composer require phpmailer/phpmailer
```

If you don't have Composer:
1. Download from [getcomposer.org](https://getcomposer.org)
2. Run the install command above

### Step 5: Test Email

1. Register a new user on the website
2. Check if OTP email is received
3. Check spam folder if not in inbox

---

## 💳 Razorpay Payment Setup

### Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up for a free account
3. Complete KYC (for live mode)

### Step 2: Get API Keys

**Test Mode (Recommended for development):**
1. In Dashboard, ensure you're in "Test Mode"
2. Go to Settings → API Keys
3. Generate Key
4. Copy:
   - Key ID: `rzp_test_xxxxxxxxxxxx`
   - Key Secret: `xxxxxxxxxxxxxxxxxxxx`

**Live Mode (For production):**
- Complete KYC first
- Toggle to "Live Mode"
- Generate live keys

### Step 3: Configure config.php

Add to your `config/config.php`:

```php
<?php
// Razorpay Configuration (TEST MODE)
define('RAZORPAY_KEY_ID', 'rzp_test_YourKeyIDHere');
define('RAZORPAY_KEY_SECRET', 'YourSecretKeyHere');
define('RAZORPAY_CURRENCY', 'INR');

// Application
define('APP_URL', 'http://localhost/BookBuzzz');
define('APP_NAME', 'BookBuzz');
define('APP_ENV', 'development');  // Change to 'production' when live
?>
```

### Step 4: Install Razorpay SDK

```bash
# Install Razorpay PHP SDK
composer require razorpay/razorpay
```

### Step 5: Test Payment

1. Go to `buy.html`
2. Click "Buy Now" on any book
3. Complete the Razorpay checkout
4. Use test card: `5267 3181 8797 5449`
5. Any future expiry date, any CVV
6. Check payment logs in `logs/payments.log`

---

## 🛠 Installation Summary

### Prerequisites
- PHP 7.4 or higher
- Apache/Nginx web server
- Composer
- MySQL (optional, for future database features)

### Quick Setup Commands

```bash
# 1. Clone/navigate to project
cd BookBuzzz

# 2. Install dependencies
composer install

# 3. Create config file
cp config/config.template.php config/config.php

# 4. Edit config with your credentials
nano config/config.php
# or use your favorite editor

# 5. Create logs directory
mkdir -p logs
chmod 755 logs

# 6. Start server (options)
# Option A: PHP built-in server
php -S localhost:8000

# Option B: XAMPP
# Place folder in htdocs and start Apache

# Option C: Python (if no PHP)
python -m http.server 8000
```

---

## 📁 File Structure

```
BookBuzzz/
├── api/
│   ├── send-email.php         # Email API endpoint
│   ├── create-order.php       # Create payment order
│   └── verify-payment.php     # Verify payment
├── config/
│   ├── config.template.php    # Template (safe to commit)
│   └── config.php             # Real config (NEVER commit!)
├── js/
│   ├── email-service.js       # Frontend email service
│   └── payment-service.js     # Frontend payment service
├── logs/                      # Payment & error logs
├── vendor/                    # Composer dependencies
└── SETUP.md                   # This file
```

---

## 🔒 Security Checklist

- [ ] `config/config.php` is in `.gitignore`
- [ ] `logs/` directory is in `.gitignore`
- [ ] `vendor/` directory is in `.gitignore`
- [ ] Using test keys in development
- [ ] App passwords used (not main passwords)
- [ ] HTTPS enabled for production
- [ ] Input validation on all forms

---

## ⚙️ Environment Modes

### Development Mode
```php
define('APP_ENV', 'development');
```
- Shows detailed errors
- Logs to console
- Test emails shown in alerts

### Production Mode
```php
define('APP_ENV', 'production');
```
- Hides errors from users
- Sends real emails
- Processes real payments

---

## 🧪 Testing Guide

### Test Email
1. Open `index.html`
2. Click Register
3. Enter details → Submit
4. Check your email inbox
5. Enter OTP to verify

### Test Payment
1. Open `buy.html`
2. Login first (required)
3. Click "Buy Now"
4. Complete Razorpay checkout
5. Use test card details
6. Check `logs/payments.log`

### Test Cards (Razorpay Test Mode)

| Card Number       | Type       | CVV | Expiry       |
|-------------------|------------|-----|--------------|
| 5267 3181 8797 5449 | Mastercard | Any | Any future   |
| 4111 1111 1111 1111 | Visa       | Any | Any future   |
| 3782 822463 10005  | Amex       | Any | Any future   |

UPI: Use any UPI ID (e.g., `test@upi`)

---

## 🐛 Troubleshooting

### Email Not Sending
- Check SMTP credentials
- Verify app password (not regular password)
- Check firewall isn't blocking port 587
- Check spam folder

### Payment Not Working
- Verify Razorpay keys are correct
- Check if `checkout.js` loads (network tab)
- Verify order creation API returns success
- Check browser console for errors

### CORS Errors
- Ensure PHP headers are set correctly
- Check API URL matches your domain

### 500 Server Error
- Check PHP error logs
- Verify `vendor/` folder exists
- Check `config.php` syntax

---

## 📞 Support

**Razorpay Docs:** https://razorpay.com/docs

**PHPMailer Docs:** https://github.com/PHPMailer/PHPMailer

**Issues:** Check browser console and server logs first

---

## 📝 Next Steps

Once email and payment are working:

1. Set up MySQL database for persistent storage
2. Add webhook handling for payment notifications
3. Implement refund functionality
4. Add invoice generation
5. Set up production hosting

---

**Happy Building! 🚀**
