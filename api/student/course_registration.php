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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { ob_end_clean(); exit(0); }

$storageFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/course_registrations.json';

// GET: Fetch registered courses for a student
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $studentId = $_GET['student_id'] ?? $_GET['studentId'] ?? '';
    $allRegistrations = file_exists($storageFile) ? json_decode(file_get_contents($storageFile), true) : [];
    
    $studentCourses = [];
    if (!empty($studentId) && is_array($allRegistrations)) {
        foreach ($allRegistrations as $reg) {
            if ((string)($reg['studentId'] ?? '') === (string)$studentId || (string)($reg['student_id'] ?? '') === (string)$studentId) {
                $studentCourses[] = $reg;
            }
        }
    }
    
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'status' => 'success',
        'courses' => $studentCourses,
        'data' => $studentCourses
    ]);
    exit(0);
}

// POST: Submit new course registration
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST;

    $studentId = $input['studentId'] ?? $input['student_id'] ?? '';
    $courses   = $input['courses'] ?? [];
    $session   = $input['session'] ?? '2025/2026';
    $semester  = $input['semester'] ?? 'First Semester';

    if (empty($studentId) || empty($courses)) {
        http_response_code(400);
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Student ID and selected courses are required.']);
        exit(0);
    }

    $existingRegistrations = file_exists($storageFile) ? json_decode(file_get_contents($storageFile), true) : [];
    if (!is_array($existingRegistrations)) { $existingRegistrations = []; }

    $record = [
        'id' => time() . rand(10, 99),
        'studentId' => $studentId,
        'session' => $session,
        'semester' => $semester,
        'courses' => $courses,
        'registeredAt' => date('Y-m-d H:i:s')
    ];

    array_unshift($existingRegistrations, $record);
    file_put_contents($storageFile, json_encode($existingRegistrations, JSON_PRETTY_PRINT));

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'status' => 'success',
        'message' => 'Course registration submitted successfully',
        'registration' => $record
    ]);
    exit(0);
}

http_response_code(405);
ob_end_clean();
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
exit(0);
