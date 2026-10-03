<?php
require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['STAFF', 'LECTURER', 'HOD', 'DEAN', 'REGISTRAR', 'ADMIN', 'SUPERADMIN']);

// No course-allocation data exists yet, so no courses or counts are invented here.
// Real courses will come from the database once lecturers are linked to courses.
$courses = [];

echo json_encode([
    'success' => true,
    'lecturerName' => $session['name'] ?? 'Lecturer',
    'department' => '',
    'activeStudents' => 0,
    'assignedCourses' => $courses,
    'courses' => $courses,
    'totalCourses' => 0
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
exit();
