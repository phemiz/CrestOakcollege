<?php
error_reporting(0);
ini_set('display_errors', 0);
while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/api/admin/db.php';
$conn = getDbConnection();

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
echo json_encode(['success' => true, 'status' => 'success', 'data' => $students, 'students' => $students, 'records' => $students]);
$conn->close();
exit(0);
