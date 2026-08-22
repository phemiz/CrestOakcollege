<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://admin.crestoakcollege.com.ng');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'BURSARY', 'STAFF']);
$conn = getDbConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch Fee Records
if ($method === 'GET') {
    $status = $_GET['status'] ?? 'ALL';
    $sql = "SELECT * FROM fees";
    if ($status !== 'ALL') {
        $sql .= " WHERE status = '" . $conn->real_escape_string($status) . "'";
    }
    $sql .= " ORDER BY id DESC";
    
    $res = $conn->query($sql);
    $records = [];
    while ($row = $res->fetch_assoc()) { $records[] = $row; }
    
    echo json_encode(['success' => true, 'data' => $records]);
    $conn->close();
    exit;
}

// POST: Create New Fee Record / Invoice
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $studentId = (int)($input['student_id'] ?? 1);
    $amount = (float)($input['amount'] ?? 0.00);
    $status = $input['status'] ?? 'PENDING';

    if ($amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid fee amount.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO fees (student_id, amount, status) VALUES (?, ?, ?)");
    $stmt->bind_param("ids", $studentId, $amount, $status);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Fee record created successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to record fee entry.']);
    }
    $conn->close();
    exit;
}

// DELETE: Void or Remove Fee Record (Admin Control Portal)
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? ($_GET['id'] ?? 0));

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Invalid invoice ID provided.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM fees WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Fee record removed successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete fee record.']);
    }
    $conn->close();
    exit;
}
