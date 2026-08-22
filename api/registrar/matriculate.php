<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../registrar_auth.php';
if (empty($_SESSION['registrar_authenticated']) || $_SESSION['registrar_authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'You must be logged in as a registrar/admin to matriculate students.']);
    exit();
}
$role = strtoupper($_SESSION['user']['role'] ?? '');
if (!in_array($role, ['REGISTRAR', 'ADMIN', 'SUPERADMIN'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You do not have permission to matriculate students.']);
    exit();
}

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!is_array($input) || empty($input)) {
    $input = $_POST;
}

$appId = (int)($input['application_id'] ?? 0);

if (!$appId) {
    echo json_encode(['success' => false, 'message' => 'Valid application ID required.']);
    exit;
}

// 1. Fetch applicant details
$stmt = $conn->prepare("SELECT applicant_name, email, phone, program_applied, status FROM admissions WHERE id = ?");
$stmt->bind_param("i", $appId);
$stmt->execute();
$app = $stmt->get_result()->fetch_assoc();

if (!$app || $app['status'] !== 'ACCEPTED') {
    echo json_encode(['success' => false, 'message' => 'Applicant must have ACCEPTED status to be matriculated.']);
    exit;
}

// Split name into first and last
$nameParts = explode(' ', trim($app['applicant_name']), 2);
$firstName = $nameParts[0];
$lastName = $nameParts[1] ?? 'Student';

// Generate Matric Number: CCHMT/2026/000X
$year = date('Y');
$matricNo = "CCHMT/{$year}/" . str_pad($appId, 4, '0', STR_PAD_LEFT);

// Check column names in students table to accommodate schema variations (department vs program)
$colsRes = $conn->query("SHOW COLUMNS FROM students");
$cols = [];
while ($c = $colsRes->fetch_assoc()) {
    $cols[] = $c['Field'];
}

$progCol = in_array('department', $cols) ? 'department' : (in_array('program_applied', $cols) ? 'program_applied' : 'program');

$sql = "INSERT INTO students (first_name, last_name, email, matric_no, {$progCol}, cgpa) VALUES (?, ?, ?, ?, ?, 0.00)";
$stmtIns = $conn->prepare($sql);
$stmtIns->bind_param("sssss", $firstName, $lastName, $app['email'], $matricNo, $app['program_applied']);

if ($stmtIns->execute()) {
    $studentId = $stmtIns->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'Student matriculated successfully.',
        'student_id' => $studentId,
        'matric_no' => $matricNo
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to matriculate student. ' . $conn->error]);
}

$conn->close();
