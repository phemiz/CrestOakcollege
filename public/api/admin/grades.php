<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF', 'LECTURER']);

function calculateGradeAndPoint($score) {
    $score = floatval($score);
    if ($score >= 70) return ["grade" => "A", "point" => 5.0];
    if ($score >= 60) return ["grade" => "B", "point" => 4.0];
    if ($score >= 50) return ["grade" => "C", "point" => 3.0];
    if ($score >= 45) return ["grade" => "D", "point" => 2.0];
    if ($score >= 40) return ["grade" => "E", "point" => 1.0];
    return ["grade" => "F", "point" => 0.0];
}

$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? '');
    $grades = [];

    if ($conn) {
        if (!empty($matricNo)) {
            $stmt = $conn->prepare("SELECT g.*, s.matric_no, s.first_name, s.last_name FROM grades g JOIN students s ON g.student_id = s.id WHERE LOWER(s.matric_no) = LOWER(?) ORDER BY g.id DESC");
            if ($stmt) {
                $stmt->bind_param("s", $matricNo);
                $stmt->execute();
                $res = $stmt->get_result();
                while ($row = $res->fetch_assoc()) {
                    $grades[] = [
                        'id' => (string)$row['id'],
                        'studentId' => (string)$row['student_id'],
                        'matricNo' => $row['matric_no'],
                        'courseCode' => $row['course_code'],
                        'grade' => $row['grade'],
                        'term' => $row['term'] ?? 'First Semester',
                        'createdAt' => $row['created_at']
                    ];
                }
                $stmt->close();
            }
        } else {
            $res = $conn->query("SELECT g.*, s.matric_no FROM grades g JOIN students s ON g.student_id = s.id ORDER BY g.id DESC LIMIT 100");
            if ($res) {
                while ($row = $res->fetch_assoc()) {
                    $grades[] = [
                        'id' => (string)$row['id'],
                        'studentId' => (string)$row['student_id'],
                        'matricNo' => $row['matric_no'],
                        'courseCode' => $row['course_code'],
                        'grade' => $row['grade'],
                        'term' => $row['term'] ?? 'First Semester',
                        'createdAt' => $row['created_at']
                    ];
                }
            }
        }
        $conn->close();
    }

    echo json_encode(['success' => true, 'grades' => array_values($grades)], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'POST') {
    validate_csrf();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];

    $matricNo = trim($input['matricNo'] ?? '');
    $courseCode = trim($input['courseCode'] ?? '');
    $score = floatval($input['exam'] ?? $input['score'] ?? 0) + floatval($input['caTest'] ?? 0) + floatval($input['assignment'] ?? 0);
    $gpInfo = calculateGradeAndPoint($score);
    $grade = $gpInfo['grade'];
    $term = trim($input['semester'] ?? 'First Semester');

    if ($conn && !empty($matricNo) && !empty($courseCode)) {
        // Resolve student ID
        $sStmt = $conn->prepare("SELECT id FROM students WHERE LOWER(matric_no) = LOWER(?) LIMIT 1");
        if ($sStmt) {
            $sStmt->bind_param("s", $matricNo);
            $sStmt->execute();
            $sRes = $sStmt->get_result();
            if ($sRes && $sRow = $sRes->fetch_assoc()) {
                $studentId = (int)$sRow['id'];
                $gStmt = $conn->prepare("INSERT INTO grades (student_id, course_code, grade, term) VALUES (?, ?, ?, ?)");
                if ($gStmt) {
                    $gStmt->bind_param("isss", $studentId, $courseCode, $grade, $term);
                    $gStmt->execute();
                    $gStmt->close();
                }
            }
            $sStmt->close();
        }
        $conn->close();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Grade recorded successfully.',
        'grade' => $grade,
        'calculatedCgpa' => $gpInfo['point']
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
exit();
