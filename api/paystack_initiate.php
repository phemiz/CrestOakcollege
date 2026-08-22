<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = ['https://pay.crestoakcollege.com.ng', 'https://portal.crestoakcollege.com.ng', 'https://crestoakcollege.com.ng'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://pay.crestoakcollege.com.ng"));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { ob_end_clean(); exit(0); }

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

$email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$amountKobo = (int)($input['amount'] ?? 0) * 100; // Paystack expects amount in Kobo
$reference = 'STU-PAY-' . time() . '-' . rand(1000, 9999);

if (empty($email) || $amountKobo <= 0) {
    http_response_code(400);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Valid student email and payment amount are required.']);
    exit(0);
}

// Load Paystack secret key from config
$configFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/api/config.php';
if (file_exists($configFile)) { require_once $configFile; }

$paystackKey = defined('PAYSTACK_SECRET_KEY') ? PAYSTACK_SECRET_KEY : getenv('PAYSTACK_SECRET_KEY');

// Fallback response for initialization or sandbox mode
if (empty($paystackKey) || $paystackKey === 'YOUR_PAYSTACK_SECRET_KEY_HERE') {
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'status' => 'success',
        'message' => 'Payment gateway initialized (Sandbox/Simulation Mode)',
        'data' => [
            'authorization_url' => 'https://pay.crestoakcollege.com.ng/checkout?ref=' . $reference,
            'access_code' => bin2hex(random_bytes(8)),
            'reference' => $reference
        ]
    ]);
    exit(0);
}

// Execute cURL request to Paystack API
$url = "https://api.paystack.co/transaction/initialize";
$fields = [
    'email' => $email,
    'amount' => $amountKobo,
    'reference' => $reference,
    'callback_url' => 'https://pay.crestoakcollege.com.ng/verify'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $paystackKey,
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

ob_end_clean();
echo $response;
exit(0);
