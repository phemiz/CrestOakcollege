<?php
// CrestOak Unified Database Connection Loader
if (!defined('DB_HOST')) {
    $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? __DIR__;
    $paths = array_unique([
        __DIR__ . '/config.php',
        __DIR__ . '/../api/config.php',
        __DIR__ . '/../public/api/config.php',
        $docRoot . '/api/config.php',
        $docRoot . '/public/api/config.php',
        $docRoot . '/config.php'
    ]);
    foreach ($paths as $p) {
        if (file_exists($p)) {
            require_once $p;
            break;
        }
    }
}

$host = defined('DB_HOST') ? DB_HOST : (getenv('DB_HOST') ?: 'localhost');
$db   = defined('DB_NAME') ? DB_NAME : (getenv('DB_NAME') ?: 'crestoa2_crest_db');
$user = defined('DB_USER') ? DB_USER : (getenv('DB_USER') ?: 'crestoa2_crest_db');
$pass = defined('DB_PASS') ? DB_PASS : (getenv('DB_PASS') ?: '');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(503);
    echo json_encode([
        "success" => false,
        "message" => "Database service unavailable."
    ]);
    exit;
}
