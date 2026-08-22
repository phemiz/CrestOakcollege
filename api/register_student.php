<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = ['https://admin.crestoakcollege.com.ng', 'https://crestoakcollege.com.ng'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://admin.crestoakcollege.com.ng"));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { ob_end_clean(); exit(0); }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit(0);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

$firstName  = trim($input['firstName'] ?? $input['first_name'] ?? '');
$lastName   = trim($input['lastName'] ?? $input['last_name'] ?? '');
$email      = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$department = trim($input['department'] ?? 'Department of Nursing Sciences');
$level      = (int)($input['level'] ?? 100);

if (empty($firstName) || empty($lastName) || empty($email)) {
    http_response_code(400);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'First Name, Last Name, and Email are required.']);
    exit(0);
}

$year = date('Y');
$randNum = str_pad((string)rand(1, 9999), 4, '0', STR_PAD_LEFT);
$matricNo = "CCHMT/{$year}/{$randNum}";
$studentId = "STU-{$randNum}";
$defaultPasswordHash = password_hash('Student@2026!', PASSWORD_BCRYPT);

$newId = rand(1000, 9999);

// 1. Safe MySQL Attempt
try {
    $dbFile = __DIR__ . '/db.php';
    if (file_exists($dbFile)) {
        include_once $dbFile;
        if (function_exists('getDbConnection')) {
            $conn = @getDbConnection();
            if ($conn && !$conn->connect_error) {
                $conn->set_charset("utf8mb4");

                $escStudentId  = $conn->real_escape_string($studentId);
                $escMatricNo   = $conn->real_escape_string($matricNo);
                $escFirstName  = $conn->real_escape_string($firstName);
                $escLastName   = $conn->real_escape_string($lastName);
                $escEmail      = $conn->real_escape_string($email);
                $escDept       = $conn->real_escape_string($department);
                $escPassword   = $conn->real_escape_string($defaultPasswordHash);

                $sql = "INSERT INTO students (student_id, matric_no, first_name, last_name, email, department, level, password, cgpa, status) 
                        VALUES ('$escStudentId', '$escMatricNo', '$escFirstName', '$escLastName', '$escEmail', '$escDept', $level, '$escPassword', 0.0, 'ACTIVE')";

                if ($conn->query($sql) === TRUE) {
                    $insertId = $conn->insert_id;
                    if ($insertId > 0) { $newId = $insertId; }
                }
                $conn->close();
            }
        }
    }
} catch (Throwable $e) {
    // Suppress DB errors to allow JSON sync fallback
}

// 2. Persistent Storage Sync
$storageFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/students_data.json';
$existingData = [];
if (file_exists($storageFile)) {
    $existingData = json_decode(file_get_contents($storageFile), true) ?? [];
}

$newStudent = [
    'id' => (int)$newId,
    'studentId' => $studentId,
    'matricNo' => $matricNo,
    'firstName' => $firstName,
    'lastName' => $lastName,
    'email' => $email,
    'department' => $department,
    'level' => $level,
    'cgpa' => 0,
    'status' => 'ACTIVE'
];

array_unshift($existingData, $newStudent);
file_put_contents($storageFile, json_encode($existingData, JSON_PRETTY_PRINT));

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'message' => 'Student registered successfully',
    'student' => $newStudent
]);
exit(0);
