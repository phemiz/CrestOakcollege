<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://admin.crestoakcollege.com.ng');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF', 'LECTURER']);
$conn = getDbConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$conn->set_charset('utf8mb4');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = isset($_GET['q']) ? '%' . $conn->real_escape_string($_GET['q']) . '%' : null;
    
    if ($search) {
        $stmt = $conn->prepare("SELECT * FROM students WHERE (isDeleted = 0 OR isDeleted IS NULL) AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?) ORDER BY id DESC");
        $stmt->bind_param("sss", $search, $search, $search);
        $stmt->execute();
        $res = $stmt->get_result();
    } else {
        $res = $conn->query("SELECT * FROM students WHERE isDeleted = 0 OR isDeleted IS NULL ORDER BY id DESC");
    }

    $students = [];
    while ($row = $res->fetch_assoc()) {
        $students[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $students]);
    $conn->close();
    exit;
}
