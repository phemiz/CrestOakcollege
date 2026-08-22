<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

function calculateGrade($score) {
    if ($score >= 70) return ['A', 4.00];
    if ($score >= 60) return ['B', 3.00];
    if ($score >= 50) return ['C', 2.00];
    if ($score >= 45) return ['D', 1.00];
    return ['F', 0.00];
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$grades = $input['grades'] ?? [];

if (empty($grades) || !is_array($grades)) {
    echo json_encode(['success' => false, 'message' => 'No grade entries provided.']);
    exit;
}

$updated = 0;
foreach ($grades as $entry) {
    $studentId = (int)($entry['student_id'] ?? 0);
    $courseId = (int)($entry['course_id'] ?? 0);
    $score = (float)($entry['score'] ?? 0);

    if ($studentId && $courseId) {
        list($grade, $gradePoint) = calculateGrade($score);
        $stmt = $conn->prepare("INSERT INTO results (student_id, course_id, score, grade, grade_point) 
                                VALUES (?, ?, ?, ?, ?) 
                                ON DUPLICATE KEY UPDATE score=?, grade=?, grade_point=?");
        $stmt->bind_param("iidsddsd", $studentId, $courseId, $score, $grade, $gradePoint, $score, $grade, $gradePoint);
        if ($stmt->execute()) { $updated++; }
    }
}

echo json_encode([
    'success' => true,
    'message' => "Successfully updated $updated grade entries."
]);
$conn->close();
