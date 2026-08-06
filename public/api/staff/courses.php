<?php
require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['STAFF', 'LECTURER', 'HOD', 'DEAN', 'REGISTRAR', 'ADMIN', 'SUPERADMIN']);

$courses = [
    [
        'code' => 'CSC 201',
        'title' => 'Introduction to Computer Science',
        'name' => 'Introduction to Computer Science',
        'units' => 3,
        'studentsEnrolled' => 145,
        'students' => 145,
        'schedule' => 'Mon/Wed 9:00 AM',
        'venue' => 'Lecture Hall A',
        'room' => 'Lecture Hall A'
    ],
    [
        'code' => 'CSC 205',
        'title' => 'Data Structures & Algorithms',
        'name' => 'Data Structures & Algorithms',
        'units' => 3,
        'studentsEnrolled' => 92,
        'students' => 92,
        'schedule' => 'Tue/Thu 11:00 AM',
        'venue' => 'Lab 3',
        'room' => 'Lab 3'
    ],
    [
        'code' => 'CSC 311',
        'title' => 'Software Engineering Principles',
        'name' => 'Software Engineering Principles',
        'units' => 3,
        'studentsEnrolled' => 78,
        'students' => 78,
        'schedule' => 'Friday 2:00 PM',
        'venue' => 'Seminar Room 2',
        'room' => 'Seminar Room 2'
    ]
];

echo json_encode([
    'success' => true,
    'lecturerName' => $session['name'] ?? 'Lecturer',
    'department' => 'Department of Computer Science & IT',
    'activeStudents' => 315,
    'assignedCourses' => $courses,
    'courses' => $courses,
    'totalCourses' => count($courses)
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
exit();
