<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Load local config (supplies credentials on shared hosting where env vars aren't available)
$_configPath = __DIR__ . '/../config.php';
if (file_exists($_configPath)) {
    require_once $_configPath;
}

$allowedOrigins = [
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng',
    'https://staff.crestoakcollege.com.ng',
    'https://admissions.crestoakcollege.com.ng',
    'https://pay.crestoakcollege.com.ng',
    'https://register.crestoakcollege.com.ng',
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
    $dbHost = getenv('DB_HOST') ?: (defined('DB_CONFIG_HOST') ? DB_CONFIG_HOST : '127.0.0.1');
    $dbName = getenv('DB_NAME') ?: (defined('DB_CONFIG_NAME') ? DB_CONFIG_NAME : null);
    $dbUser = getenv('DB_USER') ?: (defined('DB_CONFIG_USER') ? DB_CONFIG_USER : null);
    $dbPass = getenv('DB_PASS') ?: (defined('DB_CONFIG_PASS') ? DB_CONFIG_PASS : null);

    if (!$dbName || !$dbUser || $dbPass === null || $dbName === 'YOUR_DB_NAME_HERE') {
        error_log('Database configuration error: Missing DB credentials in config.php or environment variables.');
        return null;
    }

    try {
        $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
        if ($conn->connect_error) {
            error_log("Database connection failed: " . $conn->connect_error);
            return null;
        }
        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Throwable $e) {
        error_log("Database connection exception: " . $e->getMessage());
        return null;
    }
}
