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

$studentId = $_GET['student_id'] ?? $_GET['studentId'] ?? '';

$mockResults = [
    'studentId' => $studentId ?: 'STU-0001',
    'gpa' => 3.65,
    'cgpa' => 3.65,
    'session' => '2025/2026',
    'semester' => 'First Semester',
    'courses' => [
        ['code' => 'NUR101', 'title' => 'Foundations of Nursing', 'units' => 3, 'grade' => 'A', 'score' => 82],
        ['code' => 'CHE102', 'title' => 'Community Health Care', 'units' => 2, 'grade' => 'A', 'score' => 78],
        ['code' => 'ANA101', 'title' => 'Human Anatomy I', 'units' => 3, 'grade' => 'B', 'score' => 68],
        ['code' => 'PHY101', 'title' => 'Human Physiology I', 'units' => 3, 'grade' => 'A', 'score' => 75]
    ]
];

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'results' => $mockResults,
    'data' => $mockResults
]);
exit(0);
