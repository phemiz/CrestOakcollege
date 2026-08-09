<?php
require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['STAFF', 'LECTURER', 'HOD', 'DEAN', 'REGISTRAR', 'ADMIN', 'SUPERADMIN']);

$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $grades = [];
    if ($conn) {
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
        $conn->close();
    }
    echo json_encode(['success' => true, 'grades' => $grades], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    validate_csrf();
    require_once __DIR__ . '/../admin/grades.php';
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
exit();
