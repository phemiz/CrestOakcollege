<?php
http_response_code(200);
header('Content-Type: application/json');

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../admin/db.php';

$input = file_get_contents('php://input');
$event = json_decode($input, true);

// Fallback for gateway verification test
if (!$event || !isset($event['event'])) {
    echo json_encode(['status' => 'listener_active', 'timestamp' => time()]);
    exit;
}

// Verify the request really came from Paystack (HMAC-SHA512 of the raw body).
$cfgFile = __DIR__ . '/../config.php';
if (file_exists($cfgFile)) { require_once $cfgFile; }
$psKey = defined('PAYSTACK_SECRET_KEY') ? PAYSTACK_SECRET_KEY : (string)getenv('PAYSTACK_SECRET_KEY');
$psSig = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
if ($psKey === '') {
    error_log('webhook: PAYSTACK_SECRET_KEY not configured');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Webhook not configured.']);
    exit;
}
if ($psSig === '' || !hash_equals(hash_hmac('sha512', $input, $psKey), $psSig)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid signature.']);
    exit;
}

$conn = getDbConnection();
if (!$conn) { exit; }
$conn->set_charset('utf8mb4');

if ($event['event'] === 'charge.success') {
    $data = $event['data'] ?? [];
    $amount = (float)(($data['amount'] ?? 0) / 100); // kobo to naira
    $reference = (string)($data['reference'] ?? '');

    // Receipt log only. The fee ledger is updated by the verified flow
    // in api/bursary/dashboard.php (verify_payment), not here.
    try {
        $logDetails = "Paystack charge.success received for NGN " . number_format($amount, 2) . " (Ref: $reference)";
        $auditStmt = $conn->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (1, 'GATEWAY_EVENT', ?)");
        if ($auditStmt) {
            $auditStmt->bind_param("s", $logDetails);
            $auditStmt->execute();
        }
    } catch (Throwable $e) {
        error_log('webhook audit log failed: ' . $e->getMessage());
    }
}

$conn->close();
echo json_encode(['success' => true]);
