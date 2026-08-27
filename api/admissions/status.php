<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../admin/db.php';

$query = '';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = isset($_GET['query']) ? trim($_GET['query']) : (isset($_GET['appId']) ? trim($_GET['appId']) : '');
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    if (!$data) $data = $_POST;
    $query = isset($data['query']) ? trim($data['query']) : (isset($data['appId']) ? trim($data['appId']) : (isset($data['phone']) ? trim($data['phone']) : ''));
}

if (empty($query)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide an Application ID or Phone Number to check status.'
    ]);
    exit();
}

$conn = getDbConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$stmt = $conn->prepare(
    "SELECT appNo, fullName, email, phone, faculty, course, status, dateSubmitted
     FROM Application
     WHERE appNo = ? OR phone = ? OR email = ?
     LIMIT 1"
);
$stmt->bind_param("sss", $query, $query, $query);
$stmt->execute();
$res = $stmt->get_result();
$record = $res ? $res->fetch_assoc() : null;
$stmt->close();
$conn->close();

if (!$record) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'found' => false,
        'message' => 'No application found matching that Application ID or Phone Number.'
    ]);
    exit();
}

echo json_encode([
    'success' => true,
    'found' => true,
    'record' => [
        'applicationId' => $record['appNo'],
        'fullName' => $record['fullName'],
        'phone' => $record['phone'],
        'email' => $record['email'],
        'course' => $record['course'],
        'faculty' => $record['faculty'],
        'status' => $record['status'],
        'submittedAt' => $record['dateSubmitted']
    ]
]);
exit();
