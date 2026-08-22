<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once __DIR__ . '/../admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input) || empty($input)) { $input = $_POST; }

$firstName = trim($input['first_name'] ?? '');
$lastName = trim($input['last_name'] ?? '');
$email = trim($input['email'] ?? '');
$matricNo = trim($input['matric_no'] ?? '');
$department = trim($input['department'] ?? '');

if (!$firstName || !$lastName || !$email) {
    echo json_encode(['success' => false, 'message' => 'First name, last name, and email are required.']);
    exit;
}

// Generate fallback matric number if empty
if (!$matricNo) {
    $year = date('Y');
    $matricNo = "CCHMT/{$year}/" . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
}

// Inspect table columns dynamically
$colsRes = $conn->query("SHOW COLUMNS FROM students");
$cols = [];
while ($c = $colsRes->fetch_assoc()) { $cols[] = $c['Field']; }

$deptCol = in_array('department', $cols) ? 'department' : (in_array('program', $cols) ? 'program' : '');

if ($deptCol) {
    $stmt = $conn->prepare("INSERT INTO students (first_name, last_name, email, matric_no, {$deptCol}, cgpa) VALUES (?, ?, ?, ?, ?, 0.00)");
    $stmt->bind_param("sssss", $firstName, $lastName, $email, $matricNo, $department);
} else {
    $stmt = $conn->prepare("INSERT INTO students (first_name, last_name, email, matric_no, cgpa) VALUES (?, ?, ?, ?, 0.00)");
    $stmt->bind_param("ssss", $firstName, $lastName, $email, $matricNo);
}

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Student registered successfully.',
        'student_id' => $stmt->insert_id,
        'matric_no' => $matricNo
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
}

$conn->close();
