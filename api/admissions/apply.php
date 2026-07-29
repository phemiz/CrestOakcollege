<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../admin/db.php';
$conn = getDbConnection();

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid application payload."]);
    exit();
}

$appNo = 'CCHSMT-' . date('Y') . '-' . rand(1000, 9999);
$fullName = trim(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? ''));
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$faculty = trim($data['faculty'] ?? 'health');
$course = trim($data['course'] ?? 'Community Health Extension Worker (CHEW)');
$status = 'PENDING';
$date = date('Y-m-d H:i:s');

if ($conn) {
    $stmt = $conn->prepare("INSERT INTO Application (appNo, fullName, email, phone, faculty, course, status, dateSubmitted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("ssssssss", $appNo, $fullName, $email, $phone, $faculty, $course, $status, $date);
        $stmt->execute();
        $stmt->close();
    }
    $conn->close();
}

echo json_encode([
    "success" => true,
    "message" => "Application submitted successfully!",
    "appNumber" => $appNo
]);
