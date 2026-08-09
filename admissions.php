<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = ['https://admin.crestoakcollege.com.ng', 'https://crestoakcollege.com.ng'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://admin.crestoakcollege.com.ng"));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { ob_end_clean(); exit(0); }

$admissions = [];

ob_end_clean();
echo json_encode(['success' => true, 'status' => 'success', 'admissions' => $admissions, 'data' => $admissions]);
exit(0);
