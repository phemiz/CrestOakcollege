<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/admin/db.php';
require_once __DIR__ . '/auth/session.php';

// CORS headers
$allowedOrigins = [
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng',
    'https://staff.crestoakcollege.com.ng',
    'https://admissions.crestoakcollege.com.ng',
    'https://pay.crestoakcollege.com.ng',
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
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$session = get_active_session();

if ($session) {
    echo json_encode([
        'success'       => true,
        'authenticated' => true,
        'user'          => $session
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        'success'       => true,
        'authenticated' => false,
        'user'          => null
    ]);
}
exit();
