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

$availableCourses = [
    [
        "code" => "NUR 101",
        "title" => "Introduction to Foundations of Professional Nursing Practice",
        "units" => 3,
        "category" => "CORE",
        "status" => "REGISTERED",
        "lecturer" => "Dr. Emmanuel Adeyemi"
    ],
    [
        "code" => "ANA 102",
        "title" => "Human Anatomy & General Physiology I",
        "units" => 4,
        "category" => "CORE",
        "status" => "REGISTERED",
        "lecturer" => "Prof. Victoria Ojo"
    ],
    [
        "code" => "MLS 103",
        "title" => "Fundamentals of Medical Laboratory Sciences & Safety",
        "units" => 3,
        "category" => "CORE",
        "status" => "REGISTERED",
        "lecturer" => "Dr. Samuel Okonkwo"
    ],
    [
        "code" => "CHE 105",
        "title" => "Primary Healthcare Principles & Community Nursing",
        "units" => 3,
        "category" => "CORE",
        "status" => "PENDING",
        "lecturer" => "Nurse Grace Danladi"
    ],
    [
        "code" => "GST 111",
        "title" => "Communication in English & Use of Library",
        "units" => 2,
        "category" => "GENERAL",
        "status" => "REGISTERED",
        "lecturer" => "Dr. Mrs. Folake Bakare"
    ],
    [
        "code" => "COS 101",
        "title" => "Introduction to Computing & Medical Informatics",
        "units" => 3,
        "category" => "ELECTIVE",
        "status" => "PENDING",
        "lecturer" => "Engr. Timothy Chukwu"
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
    "courses" => $availableCourses
]);
exit();
