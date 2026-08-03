<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(0);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Try to delegate to the main api/staff/gradebook.php
$target = __DIR__ . '/../../api/staff/gradebook.php';
if (file_exists($target)) {
    require_once $target;
    exit();
}

// Inline fallback logic
echo json_encode(['success' => false, 'message' => 'Gradebook API not configured. Please contact support.']);
