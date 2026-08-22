<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch student fee invoices, receipt data, and account balance
if ($method === 'GET') {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
    
    if (!$studentId) {
        echo json_encode(['success' => false, 'message' => 'Student ID required.']);
        exit;
    }

    // Fetch student info
    $stmtStudent = $conn->prepare("SELECT id, first_name, last_name, email FROM students WHERE id = ?");
    $stmtStudent->bind_param("i", $studentId);
    $stmtStudent->execute();
    $studentInfo = $stmtStudent->get_result()->fetch_assoc();

    // Fetch fee ledger entries
    $stmt = $conn->prepare("SELECT id, amount, status, created_at FROM fees WHERE student_id = ? ORDER BY id DESC");
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $res = $stmt->get_result();

    $invoices = [];
    $totalPaid = 0.00;
    $totalPending = 0.00;

    while ($row = $res->fetch_assoc()) {
        $amount = (float)$row['amount'];
        if (strtoupper($row['status']) === 'PAID') {
            $totalPaid += $amount;
        } else {
            $totalPending += $amount;
        }
        $invoices[] = $row;
    }

    echo json_encode([
        'success' => true,
        'student' => $studentInfo,
        'summary' => [
            'total_paid' => number_format($totalPaid, 2),
            'total_pending' => number_format($totalPending, 2),
            'account_status' => $totalPending > 0 ? 'OUTSTANDING_BALANCE' : 'CLEARED'
        ],
        'invoices' => $invoices
    ]);
    $conn->close();
    exit;
}
