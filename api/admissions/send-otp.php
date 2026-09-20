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
$phone = trim($data['phone'] ?? '');
$fullName = trim($data['fullName'] ?? '');
$purpose = 'admissions';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'A valid email is required.']);
    exit();
}

$conn = getDbConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$code = (string) random_int(100000, 999999);
$expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

$stmt = $conn->prepare("DELETE FROM otp_verifications WHERE email = ? AND purpose = ? AND verified = 0");
$stmt->bind_param("ss", $email, $purpose);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("INSERT INTO otp_verifications (email, phone, code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $email, $phone, $code, $purpose, $expiresAt);
$inserted = $stmt->execute();
$stmt->close();
$conn->close();

if (!$inserted) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not generate verification code.']);
    exit();
}

$cleanName = htmlspecialchars($fullName ?: 'Applicant', ENT_QUOTES, 'UTF-8');
$subject = 'Your CrestOak College Verification Code';
$body = "
<!DOCTYPE html><html><head><meta charset='utf-8'></head>
<body style='font-family: Arial, sans-serif; background:#f4f6f9; padding:20px; color:#333;'>
  <div style='max-width:600px;margin:0 auto;background:#fff;padding:25px;border-radius:12px;border:1px solid #e2e8f0;'>
    <h2 style='color:#1e3a8a;border-bottom:2px solid #dc2626;padding-bottom:10px;margin-top:0;'>Verify Your Application</h2>
    <p>Dear {$cleanName},</p>
    <p>Your verification code is:</p>
    <div style='font-size:28px;font-weight:bold;letter-spacing:4px;background:#f8fafc;border-left:4px solid #1e3a8a;padding:15px;border-radius:6px;text-align:center;'>{$code}</div>
    <p style='margin-top:20px;'>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    <p style='font-size:11px;color:#94a3b8;margin-top:25px;'>CrestOak College Admissions</p>
  </div>
</body></html>";

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: CrestOak College Admissions <info@crestoakcollege.com.ng>',
    'X-Mailer: PHP/' . phpversion()
];

$sent = mail($email, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Verification code sent.']);
} else {
    error_log("send-otp.php: failed to send OTP mail to $email");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not send verification email. Try again.']);
}