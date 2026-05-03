<?php
/**
 * BookBuzz Email API
 * Handles sending emails via SMTP using PHPMailer
 * 
 * Required: PHPMailer library (install via Composer)
 * composer require phpmailer/phpmailer
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/config.php';

// Check if PHPMailer is installed
try {
    require_once '../vendor/autoload.php';
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'PHPMailer not installed. Run: composer require phpmailer/phpmailer'
    ]);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

$to = $data['to'] ?? '';
$subject = $data['subject'] ?? '';
$body = $data['body'] ?? '';
$type = $data['type'] ?? 'generic'; // otp, welcome, purchase, contact, etc.

if (empty($to) || empty($subject) || empty($body)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->SMTPDebug = APP_ENV === 'development' ? SMTP::DEBUG_SERVER : SMTP::DEBUG_OFF;
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;
    
    // Recipients
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress($to);
    
    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    
    // Add styled HTML wrapper
    $mail->Body = getEmailTemplate($body, $type);
    $mail->AltBody = strip_tags($body);
    
    $mail->send();
    
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully',
        'messageId' => $mail->getLastMessageID()
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Email sending failed: ' . $mail->ErrorInfo
    ]);
}

/**
 * Get styled HTML email template
 */
function getEmailTemplate($content, $type) {
    $logo = APP_URL . '/images/logo.png';
    $year = date('Y');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BookBuzz Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #e86c1f, #f2a93b); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .button { display: inline-block; padding: 12px 30px; background: #e86c1f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .otp-box { background: #f8f9fa; border: 2px dashed #e86c1f; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #e86c1f; margin: 20px 0; letter-spacing: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 BookBuzz</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${year} BookBuzz. All rights reserved.</p>
                <p>This email was sent from BookBuzz - Student Book Exchange Platform</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
?>
