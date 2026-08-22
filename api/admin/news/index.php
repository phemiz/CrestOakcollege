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

// Ensure news table exists
$conn->query("CREATE TABLE IF NOT EXISTS news_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('NEWS', 'ALERT', 'EVENT') DEFAULT 'NEWS',
    content TEXT NOT NULL,
    status ENUM('PUBLISHED', 'DRAFT') DEFAULT 'PUBLISHED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch all news/alerts or a specific record
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id > 0) {
        $stmt = $conn->prepare("SELECT * FROM news_alerts WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        echo json_encode(['success' => true, 'data' => $res]);
    } else {
        $res = $conn->query("SELECT * FROM news_alerts ORDER BY id DESC");
        $items = [];
        while ($row = $res->fetch_assoc()) { $items[] = $row; }
        echo json_encode(['success' => true, 'data' => $items]);
    }
    $conn->close();
    exit;
}

// POST: Create new article or alert
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $title = trim($input['title'] ?? '');
    $category = strtoupper($input['category'] ?? 'NEWS');
    $content = trim($input['content'] ?? '');
    $status = strtoupper($input['status'] ?? 'PUBLISHED');

    if (empty($title) || empty($content)) {
        echo json_encode(['success' => false, 'message' => 'Title and content are required.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO news_alerts (title, category, content, status) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $title, $category, $content, $status);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'News item published successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to publish news item.']);
    }
    $conn->close();
    exit;
}

// DELETE: Remove news entry
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? ($_GET['id'] ?? 0));

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Invalid ID provided.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM news_alerts WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Record deleted successfully.']);
    $conn->close();
    exit;
}
