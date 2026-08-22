<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: {$origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    ob_end_clean();
    exit(0); 
}

$dbFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/api/admin/db.php';
if (file_exists($dbFile)) {
    require_once $dbFile;
    $conn = getDbConnection();
} else {
    $conn = false;
}

if (!$conn) {
    ob_end_clean();
    echo json_encode(['success' => false, 'data' => [], 'students' => [], 'message' => 'Database connection failed.']);
    exit(0);
}
$conn->set_charset('utf8mb4');

$sql = "SELECT id, first_name, last_name, email, matric_no, cgpa, created_at FROM students ORDER BY id DESC";
$res = $conn->query($sql);

$students = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $row['student_id'] = $row['id'];
        $row['name'] = trim($row['first_name'] . ' ' . $row['last_name']);
        $students[] = $row;
    }
}

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'data' => $students,
    'students' => $students,
    'records' => $students
]);

$conn->close();
exit(0);
