<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once __DIR__ . '/../admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    // Fetch all fee ledger records with student details
    $sql = "SELECT f.id, f.student_id, f.amount, f.status, f.created_at, 
                   CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.email 
            FROM fees f 
            JOIN students s ON f.student_id = s.id 
            ORDER BY f.id DESC";
    $res = $conn->query($sql);
    $ledger = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $row['receipt_number'] = "CCHMT-RCT-" . str_pad($row['id'], 6, '0', STR_PAD_LEFT);
            $ledger[] = $row;
        }
    }
    echo json_encode(['success' => true, 'ledger' => $ledger]);
} elseif ($method === 'POST') {
    // Record or verify a payment manually
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $studentId = (int)($input['student_id'] ?? 0);
    $amount = (float)($input['amount'] ?? 0);
    $status = strtoupper(trim($input['status'] ?? 'PAID'));

    if (!$studentId || $amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Valid student ID and amount are required.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO fees (student_id, amount, status) VALUES (?, ?, ?)");
    $stmt->bind_param("ids", $studentId, $amount, $status);

    if ($stmt->execute()) {
        $feeId = $stmt->insert_id;
        $receiptNo = "CCHMT-RCT-" . str_pad($feeId, 6, '0', STR_PAD_LEFT);
        echo json_encode([
            'success' => true, 
            'message' => 'Payment recorded successfully.',
            'receipt_number' => $receiptNo
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to log fee payment.']);
    }
}

$conn->close();
