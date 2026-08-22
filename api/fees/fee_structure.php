<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'https://portal.crestoakcollege.com.ng',
    'https://crestoakcollege.com.ng',
    'https://admin.crestoakcollege.com.ng'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://portal.crestoakcollege.com.ng"));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { ob_end_clean(); exit(0); }

$department = $_GET['department'] ?? 'Department of Nursing Sciences';
$level = (int)($_GET['level'] ?? 100);

$feeSchedule = [
    'tuition'        => 120000,
    'development'    => 15000,
    'laboratory'     => 20000,
    'library'        => 5000,
    'portalAccess'   => 5000,
    'totalAmount'    => 165000,
    'currency'       => 'NGN',
    'session'        => '2025/2026',
    'department'     => $department,
    'level'          => $level
];

ob_end_clean();
echo json_encode([
    'success' => true,
    'status'  => 'success',
    'feeStructure' => $feeSchedule,
    'data'    => $feeSchedule
]);
exit(0);
