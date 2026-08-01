<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$storeFile = __DIR__ . '/../admin/results_store.json';
function readResultsStore($file) {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $data = @json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function getGradePoint($score) {
    if ($score >= 70) return ["grade" => "A", "point" => 5.0];
    if ($score >= 60) return ["grade" => "B", "point" => 4.0];
    if ($score >= 50) return ["grade" => "C", "point" => 3.0];
    if ($score >= 45) return ["grade" => "D", "point" => 2.0];
    if ($score >= 40) return ["grade" => "E", "point" => 1.0];
    return ["grade" => "F", "point" => 0.0];
}

$matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? '');

$rawSemesters = [
    [
        "semesterName" => "First Semester, 2025/2026",
        "courses" => [
            ["code" => "NUR 101", "title" => "Foundations of Professional Nursing Practice", "units" => 3, "score" => 84],
            ["code" => "ANA 102", "title" => "Human Anatomy & General Physiology I", "units" => 4, "score" => 78],
            ["code" => "MLS 103", "title" => "Fundamentals of Medical Laboratory Science", "units" => 3, "score" => 72],
            ["code" => "GST 111", "title" => "Communication in English & Use of Library", "units" => 2, "score" => 68]
        ]
    ],
    [
        "semesterName" => "Second Semester, 2025/2026",
        "courses" => [
            ["code" => "NUR 104", "title" => "Clinical Nursing Practice Simulation", "units" => 4, "score" => 81],
            ["code" => "ANA 104", "title" => "Human Anatomy & Physiology II", "units" => 4, "score" => 75],
            ["code" => "CHE 106", "title" => "Primary Healthcare & Environmental Hygiene", "units" => 3, "score" => 69],
            ["code" => "GST 112", "title" => "Nigerian Peoples, History & Culture", "units" => 2, "score" => 76]
        ]
    ]
];

$processedSemesters = [];
$totalQualityPointsSum = 0.0;
$totalCreditUnitsSum = 0;

foreach ($rawSemesters as $sem) {
    $semQualityPoints = 0.0;
    $semCreditUnits = 0;
    $computedCourses = [];

    foreach ($sem['courses'] as $c) {
        $gp = getGradePoint($c['score']);
        $points = floatval($c['units']) * $gp['point'];
        $computedCourses[] = [
            "code" => $c['code'],
            "title" => $c['title'],
            "units" => intval($c['units']),
            "score" => intval($c['score']),
            "grade" => $gp['grade'],
            "gradePoint" => $gp['point'],
            "qualityPoints" => $points
        ];
        $semQualityPoints += $points;
        $semCreditUnits += intval($c['units']);
    }

    $semGpa = $semCreditUnits > 0 ? round($semQualityPoints / $semCreditUnits, 2) : 0.0;
    $processedSemesters[] = [
        "semesterName" => $sem['semesterName'],
        "gpa" => $semGpa,
        "totalUnits" => $semCreditUnits,
        "totalQualityPoints" => $semQualityPoints,
        "courses" => $computedCourses
    ];

    $totalQualityPointsSum += $semQualityPoints;
    $totalCreditUnitsSum += $semCreditUnits;
}

$calculatedCgpa = $totalCreditUnitsSum > 0 ? round($totalQualityPointsSum / $totalCreditUnitsSum, 2) : 0.0;

$classOfDegree = "Pass";
if ($calculatedCgpa >= 3.50) {
    $classOfDegree = "First Class Honours";
} else if ($calculatedCgpa >= 3.00) {
    $classOfDegree = "Second Class Upper";
} else if ($calculatedCgpa >= 2.40) {
    $classOfDegree = "Second Class Lower";
} else if ($calculatedCgpa >= 1.50) {
    $classOfDegree = "Third Class";
}

echo json_encode([
    "success" => true,
    "matricNo" => $matricNo,
    "results" => [
        "summary" => [
            "cgpa" => $calculatedCgpa,
            "gpa" => $processedSemesters[count($processedSemesters) - 1]['gpa'] ?? $calculatedCgpa,
            "totalUnitsRegistered" => $totalCreditUnitsSum,
            "totalUnitsEarned" => $totalCreditUnitsSum,
            "totalQualityPoints" => $totalQualityPointsSum,
            "classOfDegree" => $classOfDegree
        ],
        "semesters" => $processedSemesters
    ]
]);
exit();
