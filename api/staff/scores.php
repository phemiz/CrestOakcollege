<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once __DIR__ . '/../admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input) || empty($input)) { $input = $_POST; }

$studentId = (int)($input['student_id'] ?? 0);
$courseInput = strtoupper(trim($input['course_code'] ?? ($input['course'] ?? '1')));
$caScore = (float)($input['ca_score'] ?? 0);
$examScore = (float)($input['exam_score'] ?? 0);

if (!$studentId) {
    echo json_encode(['success' => false, 'message' => 'Valid student ID required.']);
    exit;
}

$totalScore = $caScore + $examScore;

// Determine Grade & Grade Point
if ($totalScore >= 70) { $grade = 'A'; $gradePoint = 4.0; }
elseif ($totalScore >= 60) { $grade = 'B'; $gradePoint = 3.0; }
elseif ($totalScore >= 50) { $grade = 'C'; $gradePoint = 2.0; }
elseif ($totalScore >= 45) { $grade = 'D'; $gradePoint = 1.0; }
else { $grade = 'F'; $gradePoint = 0.0; }

// Resolve course_id (check if integer passed, else query courses table or default to 1)
if (is_numeric($courseInput)) {
    $courseId = (int)$courseInput;
} else {
    $cStmt = $conn->prepare("SELECT id FROM courses WHERE code = ? OR title = ?");
    if ($cStmt) {
        $cStmt->bind_param("ss", $courseInput, $courseInput);
        $cStmt->execute();
        $cRes = $cStmt->get_result()->fetch_assoc();
        $courseId = $cRes['id'] ?? 1;
    } else {
        $courseId = 1;
    }
}

// Direct insert matching exact schema (student_id, course_id, score, grade, grade_point)
$stmt = $conn->prepare("INSERT INTO results (student_id, course_id, score, grade, grade_point) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iidds", $studentId, $courseId, $totalScore, $grade, $gradePoint);

if ($stmt->execute()) {
    // Recalculate CGPA for student
    $cgpaRes = $conn->query("SELECT AVG(grade_point) as new_cgpa FROM results WHERE student_id = {$studentId}");
    $newCgpa = round((float)($cgpaRes->fetch_assoc()['new_cgpa'] ?? 0.0), 2);

    $conn->query("UPDATE students SET cgpa = {$newCgpa} WHERE id = {$studentId}");

    echo json_encode([
        'success' => true,
        'message' => "Scores recorded successfully.",
        'student_id' => $studentId,
        'course_id' => $courseId,
        'total_score' => $totalScore,
        'grade' => $grade,
        'updated_cgpa' => $newCgpa
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to record scores: ' . $conn->error]);
}

$conn->close();
