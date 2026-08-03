<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

$allowedOrigins = [
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng',
    'https://crestoakcollege.com.ng',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getDbConnection() {
    $dbHost = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? '127.0.0.1');
    $dbName = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'crestoa2_crestoak_db');
    $dbUser = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'crestoa2_crestoak_db');
    $dbPass = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? 'CrestOak2026!DB');

    $conn = @new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($conn->connect_error) {
        return null;
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}
