<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(0);

$allowedOrigins = [
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng',
    'https://staff.crestoakcollege.com.ng',
    'https://admissions.crestoakcollege.com.ng',
    'https://pay.crestoakcollege.com.ng',
    'https://crestoakcollege.com.ng',
    'http://localhost:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

// Ensure session is valid
$session = get_active_session();

$conn = getDbConnection();
if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed.'
    ]);
    exit;
}

// 1. Total Students Count
$studentsCount = 0;
$res = $conn->query("SELECT COUNT(*) as cnt FROM students WHERE isDeleted = 0 OR isDeleted IS NULL");
if ($res) {
    $row = $res->fetch_assoc();
    $studentsCount = (int)($row['cnt'] ?? 0);
}

// 2. Total Staff Count
$staffCount = 0;
$res = $conn->query("SELECT COUNT(*) as cnt FROM staff WHERE isDeleted = 0 OR isDeleted IS NULL");
if ($res) {
    $row = $res->fetch_assoc();
    $staffCount = (int)($row['cnt'] ?? 0);
}

// 3. Pending Admissions Count
$pendingCount = 0;
$res = $conn->query("SELECT COUNT(*) as cnt FROM admissions WHERE status = 'PENDING'");
if ($res) {
    $row = $res->fetch_assoc();
    $pendingCount = (int)($row['cnt'] ?? 0);
}

// 4. Programmes / Active Courses Count
$coursesCount = 0;
$res = $conn->query("SELECT COUNT(*) as cnt FROM programmes");
if ($res) {
    $row = $res->fetch_assoc();
    $coursesCount = (int)($row['cnt'] ?? 0);
}
if ($coursesCount === 0) {
    $coursesCount = 6; // default baseline programmes if empty
}

// 5. Total Settled Revenue
$totalRevenue = 0.00;
$res = $conn->query("SELECT SUM(amount) as total FROM fees WHERE status = 'PAID'");
if ($res) {
    $row = $res->fetch_assoc();
    $totalRevenue = (float)($row['total'] ?? 0.00);
}

$conn->close();

echo json_encode([
    'success' => true,
    'stats' => [
        'totalStaff' => $staffCount,
        'totalStudents' => $studentsCount,
        'activeCourses' => $coursesCount,
        'departments' => 5,
        'pendingAdmissions' => $pendingCount
    ],
    'data' => [
        'staffCount' => $staffCount,
        'studentsCount' => $studentsCount,
        'coursesCount' => $coursesCount,
        'pendingAppsCount' => $pendingCount,
        'totalRevenue' => $totalRevenue,
        'activeSession' => ['name' => '2026/2027 Academic Session'],
        'recentAudits' => []
    ]
], JSON_UNESCAPED_SLASHES);
