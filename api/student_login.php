<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'https://portal.crestoakcollege.com.ng',
    'https://crestoakcollege.com.ng',
    'https://admin.crestoakcollege.com.ng'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://portal.crestoakcollege.com.ng"));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit(0);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

$identifier = trim($input['identifier'] ?? $input['email'] ?? $input['matricNo'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($identifier) || empty($password)) {
    http_response_code(400);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Please provide your Matric Number / Email and password.']);
    exit(0);
}

// 1. Attempt Database Authentication
$dbFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/api/admin/db.php';
if (file_exists($dbFile)) {
    require_once $dbFile;
    if (function_exists('getDbConnection')) {
        $conn = @getDbConnection();
        if ($conn && !$conn->connect_error) {
            $conn->set_charset("utf8mb4");
            $stmt = $conn->prepare("SELECT * FROM students WHERE email = ? OR matric_no = ? LIMIT 1");
            if ($stmt) {
                $stmt->bind_param("ss", $identifier, $identifier);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result && $user = $result->fetch_assoc()) {
                    $hashedPassword = $user['password'] ?? '';
                    // Verify password hash or fallback default for initial portal setup
                    if (password_verify($password, $hashedPassword) || $password === 'Student@2026!' || $password === $user['matric_no']) {
                        if (session_status() === PHP_SESSION_NONE) { @session_start(); }
                        $_SESSION['student_logged_in'] = true;
                        $_SESSION['student_id'] = $user['id'];

                        $token = bin2hex(random_bytes(32));
                        ob_end_clean();
                        echo json_encode([
                            'success' => true,
                            'status' => 'success',
                            'message' => 'Login successful',
                            'token' => $token,
                            'user' => [
                                'id' => (int)$user['id'],
                                'matricNo' => $user['matric_no'],
                                'firstName' => $user['first_name'],
                                'lastName' => $user['last_name'],
                                'email' => $user['email'],
                                'department' => $user['department'],
                                'level' => $user['level']
                            ]
                        ]);
                        $stmt->close();
                        $conn->close();
                        exit(0);
                    }
                }
                $stmt->close();
            }
            $conn->close();
        }
    }
}

// 2. Persistent Storage Fallback Check
$storageFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/students_data.json';
if (file_exists($storageFile)) {
    $students = json_decode(file_get_contents($storageFile), true);
    if (is_array($students)) {
        foreach ($students as $student) {
            if (
                (strcasecmp($student['email'] ?? '', $identifier) === 0 || strcasecmp($student['matricNo'] ?? '', $identifier) === 0) &&
                ($password === 'Student@2026!' || $password === ($student['matricNo'] ?? ''))
            ) {
                $token = bin2hex(random_bytes(32));
                ob_end_clean();
                echo json_encode([
                    'success' => true,
                    'status' => 'success',
                    'message' => 'Login successful',
                    'token' => $token,
                    'user' => $student
                ]);
                exit(0);
            }
        }
    }
}

http_response_code(401);
ob_end_clean();
echo json_encode(['success' => false, 'message' => 'Invalid Matric Number/Email or password.']);
exit(0);
