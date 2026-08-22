<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://admin.crestoakcollege.com.ng');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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

// Auto-create gallery table
$conn->query("CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'CAMPUS',
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch gallery media
if ($method === 'GET') {
    $res = $conn->query("SELECT * FROM gallery ORDER BY id DESC");
    $items = [];
    while ($row = $res->fetch_assoc()) { $items[] = $row; }
    echo json_encode(['success' => true, 'data' => $items]);
    $conn->close();
    exit;
}

// POST: Add new media entry
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $title = trim($input['title'] ?? '');
    $category = strtoupper(trim($input['category'] ?? 'CAMPUS'));
    $imageUrl = trim($input['image_url'] ?? '');

    if (empty($title) || empty($imageUrl)) {
        echo json_encode(['success' => false, 'message' => 'Title and image URL are required.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO gallery (title, category, image_url) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $title, $category, $imageUrl);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Media item added successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add media item.']);
    }
    $conn->close();
    exit;
}
