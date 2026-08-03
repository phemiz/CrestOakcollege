<?php
// Mirror — delegate to main api/admin/staff.php
$target = realpath(__DIR__ . '/../../api/admin/staff.php');
if ($target && file_exists($target)) {
    require_once $target;
    exit();
}

// Fallback logic
ini_set('display_errors', 0);
error_reporting(0);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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

$isAuthenticated = !empty($_SESSION['admin_user']) 
    || !empty($_SERVER['HTTP_AUTHORIZATION']) 
    || !empty($_COOKIE['admin_session']) 
    || !empty($_COOKIE['next-auth.session-token']) 
    || !empty($_SERVER['HTTP_X_CSRF_TOKEN'])
    || !empty($_SERVER['HTTP_X_ADMIN_AUTH']);

if (!$isAuthenticated) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized access. Valid session required."]);
    exit();
}

function getCanonicalDeptId($dept) {
    $str = is_array($dept) ? ($dept['id'] ?? $dept['name'] ?? '') : (string)$dept;
    $clean = strtolower(trim($str));

    if (strpos($clean, 'computer') !== false || strpos($clean, 'csc') !== false || $clean === 'dept-csc' || $clean === 'dept-tech-001') return 'dept-csc';
    if (strpos($clean, 'nursing') !== false || strpos($clean, 'nur') !== false || $clean === 'dept-nur' || $clean === 'dept-health-001') return 'dept-nur';
    if (strpos($clean, 'laboratory') !== false || strpos($clean, 'mls') !== false || $clean === 'dept-mls' || $clean === 'dept-health-002') return 'dept-mls';
    if (strpos($clean, 'community') !== false || strpos($clean, 'chew') !== false || $clean === 'dept-chew' || $clean === 'dept-health-003') return 'dept-chew';
    if (strpos($clean, 'business') !== false || strpos($clean, 'bus') !== false || $clean === 'dept-bus' || $clean === 'dept-mgmt-001') return 'dept-bus';

    return 'dept-csc';
}

function getDeptNameFromId($deptId) {
    switch ($deptId) {
        case 'dept-nur': return 'Department of Nursing Sciences';
        case 'dept-mls': return 'Department of Medical Laboratory Science';
        case 'dept-chew': return 'Department of Community Health Sciences';
        case 'dept-csc': return 'Department of Computer Science & IT';
        case 'dept-bus': return 'Department of Business Administration';
        default: return 'Department of Computer Science & IT';
    }
}

$storeFile = __DIR__ . '/staff_store.json';
if (!file_exists($storeFile) && file_exists(__DIR__ . '/../../api/admin/staff_store.json')) {
    $storeFile = __DIR__ . '/../../api/admin/staff_store.json';
}

$content = file_exists($storeFile) ? file_get_contents($storeFile) : '[]';
$store = json_decode($content, true) ?: [];

$sanitized = array_map(function($staff) {
    $cDeptId = getCanonicalDeptId($staff['department'] ?? $staff['departmentId'] ?? '');
    $staff['departmentId'] = $cDeptId;
    $staff['department'] = ["id" => $cDeptId, "name" => getDeptNameFromId($cDeptId)];
    return $staff;
}, $store);

echo json_encode(["success" => true, "staff" => array_values($sanitized)]);
