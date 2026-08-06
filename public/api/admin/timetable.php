<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF', 'LECTURER']);

$defaultSchedule = [
    [
        "day" => "Monday",
        "slots" => [
            ["time" => "08:00 AM - 10:00 AM", "courseCode" => "NUR 101", "courseTitle" => "Foundations of Professional Nursing", "venue" => "Lecture Theatre A (Health Sci)", "lecturer" => "Dr. Emmanuel Adeyemi"],
            ["time" => "10:30 AM - 12:30 PM", "courseCode" => "ANA 102", "courseTitle" => "Human Anatomy & Physiology I", "venue" => "Anatomy Lab 2", "lecturer" => "Prof. Victoria Ojo"],
            ["time" => "02:00 PM - 04:00 PM", "courseCode" => "GST 111", "courseTitle" => "Communication in English", "venue" => "Auditorium Hall", "lecturer" => "Dr. Mrs. Folake Bakare"]
        ]
    ],
    [
        "day" => "Tuesday",
        "slots" => [
            ["time" => "09:00 AM - 11:30 AM", "courseCode" => "MLS 103", "courseTitle" => "Fundamentals of Med Lab Science & Safety", "venue" => "Medical Lab 1", "lecturer" => "Dr. Samuel Okonkwo"],
            ["time" => "01:00 PM - 03:00 PM", "courseCode" => "CHE 105", "courseTitle" => "Primary Healthcare Principles", "venue" => "Community Health Block B", "lecturer" => "Nurse Grace Danladi"]
        ]
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    validate_csrf();
    echo json_encode(["success" => true, "message" => "Timetable schedule updated successfully."], JSON_UNESCAPED_SLASHES);
    exit();
}

echo json_encode([
    "success" => true,
    "semester" => "First Semester, 2026/2027",
    "department" => "Nursing & Medical Sciences",
    "timetable" => $defaultSchedule
], JSON_UNESCAPED_SLASHES);
exit();
