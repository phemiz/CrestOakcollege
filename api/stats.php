<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: {$origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { ob_end_clean(); exit(0); }

$storageFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/students_data.json';
$studentCount = 4;

if (file_exists($storageFile)) {
    $list = json_decode(file_get_contents($storageFile), true);
    if (is_array($list) && !empty($list)) {
        $studentCount = count($list);
    }
}

$data = [
    'studentsCount' => $studentCount,
    'totalStudents' => $studentCount,
    'enrolledStudents' => $studentCount,
    'staffCount' => 1,
    'coursesCount' => 4,
    'pendingAppsCount' => 2,
    'totalRevenue' => 0.00,
    'activeSession' => [
        'name' => '2026/2027 Academic Session'
    ],
    'recentAudits' => []
];

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'stats' => $data,
    'data' => $data
]);
exit(0);
