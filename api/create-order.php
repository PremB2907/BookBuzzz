<?php
/**
 * BookBuzz Razorpay Order Creation API
 * Creates a payment order for book purchases
 * 
 * Required: Razorpay PHP SDK (install via Composer)
 * composer require razorpay/razorpay
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
        'message' => 'Razorpay SDK not installed. Run: composer require razorpay/razorpay'
    ]);
    exit;
}

use Razorpay\Api\Api;

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

$amount = $data['amount'] ?? 0; // Amount in paise (multiply rupees by 100)
$currency = $data['currency'] ?? RAZORPAY_CURRENCY;
$receipt = $data['receipt'] ?? 'ORDER_' . time();
$notes = $data['notes'] ?? [];

if ($amount <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid amount']);
    exit;
}

try {
    $api = new Api(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);
    
    $orderData = [
        'amount' => $amount,
        'currency' => $currency,
        'receipt' => $receipt,
        'notes' => array_merge($notes, [
            'app' => 'BookBuzz',
            'environment' => APP_ENV
        ])
    ];
    
    $order = $api->order->create($orderData);
    
    echo json_encode([
        'success' => true,
        'order_id' => $order['id'],
        'amount' => $order['amount'],
        'currency' => $order['currency'],
        'receipt' => $order['receipt'],
        'status' => $order['status'],
        'key_id' => RAZORPAY_KEY_ID, // Send key_id to frontend
        'message' => 'Order created successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Order creation failed: ' . $e->getMessage()
    ]);
}
?>
