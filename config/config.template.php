<?php
/**
 * BookBuzz Configuration Template
 * Copy this file to config.php and add your real credentials
 * IMPORTANT: Never commit config.php with real credentials to GitHub
 */

// SMTP Email Configuration
define('SMTP_HOST', 'smtp.gmail.com');           // Your SMTP host (e.g., smtp.gmail.com, smtp.office365.com)
define('SMTP_PORT', 587);                         // SMTP port (usually 587 for TLS, 465 for SSL)
define('SMTP_USERNAME', 'your-email@gmail.com');  // Your email address
define('SMTP_PASSWORD', 'your-app-password');      // Your email app password (NOT your regular password)
define('SMTP_FROM_EMAIL', 'noreply@bookbuzz.com'); // From email address
define('SMTP_FROM_NAME', 'BookBuzz');              // From name

// Razorpay Payment Configuration
define('RAZORPAY_KEY_ID', 'rzp_test_YourKeyID');      // Razorpay Test Key ID
define('RAZORPAY_KEY_SECRET', 'YourSecretKey');        // Razorpay Test Secret Key
define('RAZORPAY_CURRENCY', 'INR');                    // Currency code

// Application Configuration
define('APP_URL', 'http://localhost/BookBuzzz');       // Your app URL
define('APP_NAME', 'BookBuzz');                        // App name
define('APP_ENV', 'development');                      // environment: development/production

// Database Configuration (for future use)
define('DB_HOST', 'localhost');
define('DB_NAME', 'bookbuzz');
define('DB_USER', 'root');
define('DB_PASS', '');

// Security
define('ENCRYPTION_KEY', 'your-random-32-char-key-here');  // Change this to a random string
?>
