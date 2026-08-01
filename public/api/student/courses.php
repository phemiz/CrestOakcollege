<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?? $_POST ?? [];

$matricNo = trim($_GET['matricNo'] ?? $data['matricNo'] ?? '');

$timetableStoreFile = __DIR__ . '/../admin/timetable_store.json';
$timetable = [];
if (file_exists($timetableStoreFile)) {
    $content = @file_get_contents($timetableStoreFile);
    $timetable = @json_decode($content, true) ?? [];
}

$availableCourses = [
    [
        "code" => "NUR 101",
        "title" => "Foundations of Professional Nursing Practice",
        "units" => 3,
        "category" => "CORE",
        "status" => "REGISTERED",
        "lecturer" => "Dr. Emmanuel Adeyemi",
        "venue" => "Lecture Theatre A (Health Sci)",
        "schedule" => "Mon 08:00 AM - 10:00 AM, Wed 08:00 AM"
    ],
    [
        "code" => "ANA 102",
        "title" => "Human Anatomy & General Physiology I",
        "units" => 4,
        "category" => "CORE",
        "status" => "REGISTERED",
        "lecturer" => "Prof. Victoria Ojo",
        "venue" => "Anatomy Lab 2",
        "schedule" => "Mon 10:30 AM - 12:30 PM, Thu 09:00 AM"
    ],
    [
        "code" => "MLS 103",
        "title" => "Fundamentals of Medical Lab Science & Safety",
        "units" => 3,
        "category" => "CORE",
        "status" => "REGISTERED",
        "lecturer" => "Dr. Samuel Okonkwo",
        "venue" => "Medical Lab 1",
        "schedule" => "Tue 09:00 AM - 11:30 AM, Thu 02:00 PM"
    ],
    [
        "code" => "CHE 105",
        "title" => "Primary Healthcare Principles & Hygiene",
        "units" => 3,
        "category" => "CORE",
        "status" => "PENDING",
        "lecturer" => "Nurse Grace Danladi",
        "venue" => "Community Health Block B",
        "schedule" => "Tue 01:00 PM - 03:00 PM, Fri 08:30 AM"
    ],
    [
        "code" => "GST 111",
        "title" => "Communication in English & Use of Library",
        "units" => 2,
        "category" => "GENERAL",
        "status" => "REGISTERED",
        "lecturer" => "Dr. Mrs. Folake Bakare",
        "venue" => "Auditorium Hall",
        "schedule" => "Mon 02:00 PM - 04:00 PM, Fri 02:00 PM"
    ],
    [
        "code" => "COS 101",
        "title" => "Introduction to Computing & Medical Informatics",
        "units" => 3,
        "category" => "ELECTIVE",
        "status" => "PENDING",
        "lecturer" => "Engr. Timothy Chukwu",
        "venue" => "E-Library Computer Lab",
        "schedule" => "Wed 12:00 PM - 02:00 PM"
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $registeredCodes = $data['courseCodes'] ?? [];
    echo json_encode([
        "success" => true,
        "message" => "Course registration submitted successfully for active semester.",
        "registeredCourses" => $registeredCodes,
        "totalUnits" => 18
    ]);
    exit();
}

echo json_encode([
    "success" => true,
    "matricNo" => $matricNo,
    "semester" => "First Semester, 2026/2027",
    "totalCreditUnits" => 18,
    "courses" => $availableCourses,
    "timetable" => $timetable
]);
exit();
