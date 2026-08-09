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

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    ob_end_clean();
    exit(0); 
}

$deptDistribution = [
    ['name' => 'Community Health (CHEW)', 'count' => 1],
    ['name' => 'Computer Science', 'count' => 1],
    ['name' => 'Medical Laboratory Science', 'count' => 1],
    ['name' => 'Business Administration', 'count' => 1]
];

$revenueByFeeType = [
    ['type' => 'Tuition Fees', 'amount' => 0.00],
    ['type' => 'Application & Screening', 'amount' => 0.00]
];

$rawStudents = [
    ['matricNo' => 'CCHSMT/2026/001', 'name' => 'Adebayo Okonkwo', 'department' => 'Community Health (CHEW)', 'level' => 200, 'email' => 'a.okonkwo@student.crestoakcollege.com.ng', 'cgpa' => 3.65],
    ['matricNo' => 'CCHSMT/2026/002', 'name' => 'Fatima Bello', 'department' => 'Computer Science', 'level' => 100, 'email' => 'f.bello@student.crestoakcollege.com.ng', 'cgpa' => 3.80],
    ['matricNo' => 'CCHSMT/2026/003', 'name' => 'Chinedu Eze', 'department' => 'Medical Laboratory Science', 'level' => 300, 'email' => 'c.eze@student.crestoakcollege.com.ng', 'cgpa' => 3.42],
    ['matricNo' => 'CCHSMT/2026/004', 'name' => 'Blessing Adeyemi', 'department' => 'Business Administration', 'level' => 100, 'email' => 'b.adeyemi@student.crestoakcollege.com.ng', 'cgpa' => 3.55]
];

$rawPayments = [];

$summaryStats = [
    'totalStudents' => 4,
    'totalRevenue' => 0.00,
    'avgCgpa' => 3.61,
    'unpaidAmount' => 0.00
];

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'summaryStats' => $summaryStats,
    'deptDistribution' => $deptDistribution,
    'revenueByFeeType' => $revenueByFeeType,
    'rawStudents' => $rawStudents,
    'rawPayments' => $rawPayments,
    'data' => [
        'summaryStats' => $summaryStats,
        'deptDistribution' => $deptDistribution,
        'revenueByFeeType' => $revenueByFeeType,
        'rawStudents' => $rawStudents,
        'rawPayments' => $rawPayments
    ]
]);
exit(0);
