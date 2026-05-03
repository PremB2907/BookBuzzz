<?php
/**
 * BookBuzz Razorpay Payment Verification API
 * Verifies payment signature after successful payment
 * 
 * Required: Razorpay PHP SDK
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/config.php';

// Check if Razorpay SDK is installed
try {
    require_once '../vendor/autoload.php';
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Razorpay SDK not installed'
    ]);
    exit;
}

use Razorpay\Api\Api;
use Razorpay\Api\Utility;

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

$orderId = $data['razorpay_order_id'] ?? '';
$paymentId = $data['razorpay_payment_id'] ?? '';
$signature = $data['razorpay_signature'] ?? '';

if (empty($orderId) || empty($paymentId) || empty($signature)) {
    echo json_encode(['success' => false, 'message' => 'Missing payment details']);
    exit;
}

try {
    $api = new Api(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);
    
    // Verify signature
    $attributes = [
        'razorpay_order_id' => $orderId,
        'razorpay_payment_id' => $paymentId,
        'razorpay_signature' => $signature
    ];
    
    $api->utility->verifyPaymentSignature($attributes);
    
    // Fetch payment details
    $payment = $api->payment->fetch($paymentId);
    
    // Log successful payment (you can save to database here)
    logPayment($payment);
    
    echo json_encode([
        'success' => true,
        'message' => 'Payment verified successfully',
        'payment_id' => $paymentId,
        'order_id' => $orderId,
        'amount' => $payment->amount / 100, // Convert paise to rupees
        'currency' => $payment->currency,
        'status' => $payment->status,
        'method' => $payment->method,
        'email' => $payment->email ?? '',
        'contact' => $payment->contact ?? ''
    ]);
    
    // Send confirmation email
    sendPaymentConfirmationEmail($payment);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Payment verification failed: ' . $e->getMessage()
    ]);
}

/**
 * Log payment to database or file
 */
function logPayment($payment) {
    $logData = [
        'payment_id' => $payment->id,
        'order_id' => $payment->order_id,
        'amount' => $payment->amount / 100,
        'currency' => $payment->currency,
        'status' => $payment->status,
        'method' => $payment->method,
        'email' => $payment->email ?? '',
        'contact' => $payment->contact ?? '',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    // Log to file (in production, save to database)
    $logFile = __DIR__ . '/../logs/payments.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);
}

/**
 * Send payment confirmation email
 */
function sendPaymentConfirmationEmail($payment) {
    // Use your email API to send confirmation
    // This would typically call your send-email.php endpoint
    
    $amount = $payment->amount / 100;
    $email = $payment->email ?? '';
    
    if (empty($email)) return;
    
    $subject = 'Payment Successful - BookBuzz Order #' . $payment->order_id;
    $body = '
        <h2>Payment Successful!</h2>
        <p>Thank you for your purchase on BookBuzz.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Payment ID:</strong> ' . $payment->id . '</p>
            <p><strong>Order ID:</strong> ' . $payment->order_id . '</p>
            <p><strong>Amount:</strong> ₹' . $amount . '</p>
            <p><strong>Status:</strong> ' . ucfirst($payment->status) . '</p>
            <p><strong>Method:</strong> ' . ucfirst($payment->method) . '</p>
        </div>
        <p>You can view your order details in your <a href="' . APP_URL . '/dashboard.html">Dashboard</a>.</p>
    ';
    
    // Send email via your API
    $ch = curl_init(APP_URL . '/api/send-email.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'to' => $email,
        'subject' => $subject,
        'body' => $body,
        'type' => 'purchase'
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_exec($ch);
    curl_close($ch);
}
?>
