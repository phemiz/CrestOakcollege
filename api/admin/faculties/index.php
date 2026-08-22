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

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF']);
$conn = getDbConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$conn->set_charset('utf8mb4');

// Auto-create faculties table
$conn->query("CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch faculties
if ($method === 'GET') {
    $res = $conn->query("SELECT * FROM faculties ORDER BY name ASC");
    $faculties = [];
    while ($row = $res->fetch_assoc()) { $faculties[] = $row; }
    echo json_encode(['success' => true, 'data' => $faculties]);
    $conn->close();
    exit;
}

// POST: Add new faculty
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $name = trim($input['name'] ?? '');
    $code = strtoupper(trim($input['code'] ?? ''));

    if (empty($name) || empty($code)) {
        echo json_encode(['success' => false, 'message' => 'Faculty name and code are required.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO faculties (name, code) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $code);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Faculty created successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Faculty creation failed or duplicate code.']);
    }
    $conn->close();
    exit;
}
