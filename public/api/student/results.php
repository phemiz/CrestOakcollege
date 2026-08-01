<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? '');

$resultsData = [
    "summary" => [
        "cgpa" => 4.25,
        "gpa" => 4.30,
        "totalUnitsRegistered" => 36,
        "totalUnitsEarned" => 36,
        "classOfDegree" => "First Class Honours"
    ],
    "semesters" => [
        [
            "semesterName" => "First Semester, 2025/2026",
            "gpa" => 4.30,
            "courses" => [
                ["code" => "NUR 101", "title" => "Foundations of Professional Nursing", "units" => 3, "score" => 84, "grade" => "A", "points" => 15.0],
                ["code" => "ANA 102", "title" => "Human Anatomy & Physiology I", "units" => 4, "score" => 78, "grade" => "A", "points" => 20.0],
                ["code" => "MLS 103", "title" => "Fundamentals of Medical Lab Science", "units" => 3, "score" => 72, "grade" => "A", "points" => 15.0],
                ["code" => "GST 111", "title" => "Communication in English", "units" => 2, "score" => 68, "grade" => "B", "points" => 8.0]
            ]
        ],
        [
            "semesterName" => "Second Semester, 2025/2026",
            "gpa" => 4.20,
            "courses" => [
                ["code" => "NUR 104", "title" => "Clinical Nursing Practice I", "units" => 4, "score" => 81, "grade" => "A", "points" => 20.0],
                ["code" => "ANA 104", "title" => "Human Anatomy & Physiology II", "units" => 4, "score" => 75, "grade" => "A", "points" => 20.0],
                ["code" => "CHE 106", "title" => "Community Health Nursing & Hygiene", "units" => 3, "score" => 69, "grade" => "B", "points" => 12.0],
                ["code" => "GST 112", "title" => "Nigerian Peoples & Culture", "units" => 2, "score" => 76, "grade" => "A", "points" => 10.0]
            ]
        ]
    ]
];

echo json_encode([
    "success" => true,
    "matricNo" => $matricNo,
    "results" => $resultsData
]);
exit();
