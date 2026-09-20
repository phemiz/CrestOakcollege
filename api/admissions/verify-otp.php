<?php
$allowedOrigins = [
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng',
    'https://staff.crestoakcollege.com.ng',
    'https://admissions.crestoakcollege.com.ng',
    'https://crestoakcollege.com.ng',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../admin/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$code = trim($data['code'] ?? '');
$purpose = 'admissions';

if (!$email || !$code) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and code are required.']);
    exit();
}

$conn = getDbConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$stmt = $conn->prepare("SELECT id FROM otp_verifications WHERE email = ? AND purpose = ? AND code = ? AND verified = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
$stmt->bind_param("sss", $email, $purpose, $code);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    $conn->close();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or expired code.']);
    exit();
}

$stmt = $conn->prepare("UPDATE otp_verifications SET verified = 1 WHERE id = ?");
$stmt->bind_param("i", $row['id']);
$stmt->execute();
$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'message' => 'Verified successfully.']);