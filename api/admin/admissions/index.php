<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://admin.crestoakcollege.com.ng');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF']);
$conn = getDbConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: List applications
if ($method === 'GET') {
    $status = $_GET['status'] ?? 'PENDING';
    $stmt = $conn->prepare("SELECT * FROM admissions WHERE status = ? ORDER BY id DESC");
    $stmt->bind_param("s", $status);
    $stmt->execute();
    $res = $stmt->get_result();
    
    $applications = [];
    while ($row = $res->fetch_assoc()) {
        $applications[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $applications]);
    $conn->close();
    exit;
}

// POST/PUT: Process Approval/Rejection
if ($method === 'POST' || $method === 'PUT') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST;
    
    $id = (int)($input['id'] ?? 0);
    $action = strtoupper($input['action'] ?? ''); // ACCEPTED or REJECTED

    if (!$id || !in_array($action, ['ACCEPTED', 'REJECTED'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid ID or action provided.']);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM admissions WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $applicant = $stmt->get_result()->fetch_assoc();

    if (!$applicant) {
        echo json_encode(['success' => false, 'message' => 'Applicant not found.']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE admissions SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $action, $id);
    $stmt->execute();

    if ($action === 'ACCEPTED') {
        $nameParts = explode(' ', trim($applicant['applicant_name']), 2);
        $firstName = $nameParts[0] ?? $applicant['applicant_name'];
        $lastName = $nameParts[1] ?? 'Student';
        $email = $applicant['email'] ?? strtolower($firstName) . '@crestoakcollege.com.ng';

        $stmt = $conn->prepare("INSERT INTO students (first_name, last_name, email, isDeleted) VALUES (?, ?, ?, 0)");
        $stmt->bind_param("sss", $firstName, $lastName, $email);
        $stmt->execute();
    }

    echo json_encode([
        'success' => true,
        'message' => "Application successfully " . strtolower($action) . "."
    ]);
    $conn->close();
    exit;
}
