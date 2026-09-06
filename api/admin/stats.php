<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

// Ensure session is valid
$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF', 'LECTURER', 'BURSARY']);

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
$res = $conn->query("SELECT SUM(amount) as total FROM fee_payments WHERE status = 'success'");
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
