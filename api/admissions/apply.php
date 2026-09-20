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

$email = trim($data['email'] ?? '');

$purpose = 'admissions';
$stmt = $conn->prepare("SELECT id FROM otp_verifications WHERE email = ? AND purpose = ? AND verified = 1 AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
$stmt->bind_param("ss", $email, $purpose);
$stmt->execute();
$otpRow = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$otpRow) {
    echo json_encode(["success" => false, "message" => "Email not verified. Please complete OTP verification first."]);
    exit();
}

$appNo = 'CCHSMT-' . date('Y') . '-' . rand(1000, 9999);
$fullName = trim($data['fullName'] ?? '');
$phone = trim($data['phone'] ?? '');
$gender = trim($data['gender'] ?? '');
$level = trim($data['level'] ?? 'undergraduate');
$faculty = trim($data['faculty'] ?? '');
$course = trim($data['course'] ?? '');
$jambScore = trim($data['jambScore'] ?? '');
$olevelCredits = trim($data['olevelCredits'] ?? '');
$firstDegreeInstitution = trim($data['firstDegreeInstitution'] ?? '');
$firstDegreeClass = trim($data['firstDegreeClass'] ?? '');
$olevelUrl = trim($data['olevelUrl'] ?? '');
$jambUrl = trim($data['jambUrl'] ?? '');
$passportUrl = trim($data['passportUrl'] ?? '');
$status = 'PENDING';
$date = date('Y-m-d H:i:s');

$stmt = $conn->prepare("INSERT INTO Application
    (appNo, fullName, email, phone, gender, level, faculty, course, jambScore, olevelCredits, firstDegreeInstitution, firstDegreeClass, olevelUrl, jambUrl, passportUrl, status, dateSubmitted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    "sssssssssssssssss",
    $appNo, $fullName, $email, $phone, $gender, $level, $faculty, $course,
    $jambScore, $olevelCredits, $firstDegreeInstitution, $firstDegreeClass,
    $olevelUrl, $jambUrl, $passportUrl, $status, $date
);
$ok = $stmt->execute();
$stmt->close();
$conn->close();

if (!$ok) {
    echo json_encode(["success" => false, "message" => "Failed to save application. Please try again."]);
    exit();
}

echo json_encode([
    "success" => true,
    "message" => "Application submitted successfully!",
    "appNumber" => $appNo,
    "applicationId" => $appNo
]);