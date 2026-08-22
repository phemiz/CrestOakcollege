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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

// 1. Fetch Students from MySQL Database
$students = [];
$dbFile = __DIR__ . '/db.php';
if (file_exists($dbFile)) {
    require_once $dbFile;
    if (function_exists('getDbConnection')) {
        $conn = @getDbConnection();
        if ($conn && !$conn->connect_error) {
            $conn->set_charset("utf8mb4");
            $res = $conn->query("SELECT * FROM students ORDER BY id DESC");
            if ($res && $res->num_rows > 0) {
                while ($row = $res->fetch_assoc()) {
                    $students[] = [
                        'id' => (int)$row['id'],
                        'studentId' => $row['student_id'] ?? ('STU-' . str_pad($row['id'], 4, '0', STR_PAD_LEFT)),
                        'matricNo' => $row['matric_no'] ?? '',
                        'firstName' => $row['first_name'] ?? '',
                        'lastName' => $row['last_name'] ?? '',
                        'email' => $row['email'] ?? '',
                        'department' => $row['department'] ?? 'Community Health (CHEW)',
                        'level' => (int)($row['level'] ?? 100),
                        'cgpa' => (float)($row['cgpa'] ?? 0.0),
                        'status' => $row['status'] ?? 'ACTIVE'
                    ];
                }
            }
            $conn->close();
        }
    }
}

// 2. Persistent Storage Fallback if DB returns empty
if (empty($students)) {
    $storageFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/students_data.json';
    if (file_exists($storageFile)) {
        $data = json_decode(file_get_contents($storageFile), true);
        if (is_array($data)) { $students = $data; }
    }
}

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'students' => $students,
    'data' => $students,
    'total' => count($students)
]);
exit(0);
