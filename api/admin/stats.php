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
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function readStore($path) {
    if (!file_exists($path)) return [];
    $data = @json_decode(@file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

$dir = __DIR__;

// Staff
$staffData   = readStore($dir . '/staff_store.json');
// Filter out any PENDING/invalid records
$staffData   = array_values(array_filter($staffData, function($s) {
    $sin = $s['sin'] ?? $s['staffNo'] ?? $s['staffId'] ?? '';
    return !empty($sin) && $sin !== 'STAFF-PENDING';
}));
$staffCount  = count($staffData);

// Students
$studentData  = readStore($dir . '/students_store.json');
$studentsCount = count($studentData);

// Admissions — count PENDING from admissions_store
$admissionsStorePaths = [
    $dir . '/admissions_store.json',
    $dir . '/../admissions/admissions_store.json',
];
$admissionsData = [];
foreach ($admissionsStorePaths as $p) {
    if (file_exists($p)) { $admissionsData = readStore($p); break; }
}
$pendingAdmissions = count(array_filter($admissionsData, function($a) {
    $status = strtoupper($a['status'] ?? '');
    return $status === 'PENDING' || $status === 'SUBMITTED';
}));

// Programmes
$programmesStorePaths = [
    $dir . '/programmes_store.json',
];
$programmesData = [];
foreach ($programmesStorePaths as $p) {
    if (file_exists($p)) { $programmesData = readStore($p); break; }
}
$activeCourses = count($programmesData) > 0 ? count($programmesData) : 6;

// Departments — derive from staff or use fixed canonical set
$departments = 5;

// Revenue — sum fee amounts from students_store if available
$totalRevenue = 0;
foreach ($studentData as $s) {
    $fees = $s['feesPaid'] ?? $s['totalPaid'] ?? 0;
    $totalRevenue += floatval($fees);
}

// Audit logs from file
$auditLogFile = $dir . '/audit_logs.json';
$recentAudits = [];
if (file_exists($auditLogFile)) {
    $logs = readStore($auditLogFile);
    $recentAudits = array_slice(array_reverse($logs), 0, 10);
}

echo json_encode([
    'success' => true,
    'stats'   => [
        'totalStaff'       => $staffCount,
        'totalStudents'    => $studentsCount,
        'activeCourses'    => $activeCourses,
        'departments'      => $departments,
        'pendingAdmissions'=> $pendingAdmissions,
    ],
    'data'    => [
        'staffCount'       => $staffCount,
        'studentsCount'    => $studentsCount,
        'coursesCount'     => $activeCourses,
        'pendingAppsCount' => $pendingAdmissions,
        'totalRevenue'     => $totalRevenue,
        'activeSession'    => ['name' => '2026/2027 Academic Session'],
        'recentAudits'     => $recentAudits,
    ]
], JSON_UNESCAPED_SLASHES);
exit;
