<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://admin.crestoakcollege.com.ng');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'BURSARY', 'STAFF']);
$conn = getDbConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

// Auto-create audit_logs table if not existing
$conn->query("CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = $conn->query("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10");
    $logs = [];
    while ($row = $res->fetch_assoc()) {
        $logs[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $logs]);
    $conn->close();
    exit;
}
