<?php
require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../auth/session.php';
// Returns the logged-in student's matric number. Ignores anything in the URL.
function current_student_matric(): string {
    $s = require_session(['STUDENT']);
    if (isset($s['role']) && strtoupper((string)$s['role']) !== 'STUDENT') {
        http_response_code(403);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => false, 'message' => 'Student access only.']);
        exit;
    }
    $m = '';
    $conn = getDbConnection();
    if ($conn) {
        $st = $conn->prepare('SELECT matric_no FROM students WHERE id = ? LIMIT 1');
        if ($st) {
            $id = (int)$s['user_id'];
            $st->bind_param('i', $id);
            $st->execute();
            $r = $st->get_result();
            if ($r && $row = $r->fetch_assoc()) { $m = (string)$row['matric_no']; }
            $st->close();
        }
    }
    if ($m === '') {
        http_response_code(403);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => false, 'message' => 'Student record not found.']);
        exit;
    }
    return $m;
}
