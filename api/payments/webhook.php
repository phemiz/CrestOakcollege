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

$conn = getDbConnection();
if (!$conn) { exit; }
$conn->set_charset('utf8mb4');

if ($event['event'] === 'charge.success') {
    $data = $event['data'];
    $amount = (float)($data['amount'] / 100); // Convert from kobo
    $email = $conn->real_escape_string($data['customer']['email']);
    $reference = $conn->real_escape_string($data['reference']);

    // Locate student by email
    $res = $conn->query("SELECT id FROM students WHERE email = '$email' LIMIT 1");
    if ($row = $res->fetch_assoc()) {
        $studentId = (int)$row['id'];
        
        // Update fee ledger to PAID
        $stmt = $conn->prepare("INSERT INTO fees (student_id, amount, status) VALUES (?, ?, 'PAID')");
        $stmt->bind_param("id", $studentId, $amount);
        $stmt->execute();

        // Write entry to Audit Trail
        $logDetails = "Verified gateway payment of NGN " . number_format($amount, 2) . " (Ref: $reference)";
        $auditStmt = $conn->prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (1, 'GATEWAY_PAYMENT', ?)");
        $auditStmt->bind_param("s", $logDetails);
        $auditStmt->execute();
    }
}

$conn->close();
echo json_encode(['success' => true]);
