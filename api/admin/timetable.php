<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$storeFile = __DIR__ . '/timetable_store.json';

function readTimetableStore($file) {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $data = @json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function writeTimetableStore($file, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT);
    return @file_put_contents($file, $json) !== false;
}

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
    ],
    [
        "day" => "Wednesday",
        "slots" => [
            ["time" => "08:00 AM - 11:00 AM", "courseCode" => "NUR 101", "courseTitle" => "Clinical Nursing Simulation Lab", "venue" => "Demonstration Ward A", "lecturer" => "Dr. Emmanuel Adeyemi"],
            ["time" => "12:00 PM - 02:00 PM", "courseCode" => "COS 101", "courseTitle" => "Introduction to Medical Informatics", "venue" => "E-Library Computer Lab", "lecturer" => "Engr. Timothy Chukwu"]
        ]
    ],
    [
        "day" => "Thursday",
        "slots" => [
            ["time" => "09:00 AM - 11:00 AM", "courseCode" => "ANA 102", "courseTitle" => "Anatomy Practical & Histology", "venue" => "Histology Lab", "lecturer" => "Prof. Victoria Ojo"],
            ["time" => "02:00 PM - 04:00 PM", "courseCode" => "MLS 103", "courseTitle" => "Med Lab Practical & Staining", "venue" => "Medical Lab 2", "lecturer" => "Dr. Samuel Okonkwo"]
        ]
    ],
    [
        "day" => "Friday",
        "slots" => [
            ["time" => "08:30 AM - 11:00 AM", "courseCode" => "CHE 105", "courseTitle" => "Community Field Posting & Hygiene", "venue" => "Clinic Annex 1", "lecturer" => "Nurse Grace Danladi"],
            ["time" => "02:00 PM - 04:00 PM", "courseCode" => "GST 111", "courseTitle" => "Use of Library & Study Skills", "venue" => "Main Library Hall", "lecturer" => "Dr. Mrs. Folake Bakare"]
        ]
    ]
];

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?? $_POST ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($data['schedule'])) {
        writeTimetableStore($storeFile, $data['schedule']);
        echo json_encode(["success" => true, "message" => "Timetable schedule updated successfully."]);
        exit();
    }
}

$storedSchedule = readTimetableStore($storeFile);
if (empty($storedSchedule)) {
    $storedSchedule = $defaultSchedule;
    writeTimetableStore($storeFile, $defaultSchedule);
}

echo json_encode([
    "success" => true,
    "semester" => "First Semester, 2026/2027",
    "department" => "Nursing & Medical Sciences",
    "timetable" => $storedSchedule
]);
exit();
