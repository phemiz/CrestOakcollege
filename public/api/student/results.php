<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$gradesStoreFile = __DIR__ . '/../admin/grades_store.json';
if (!file_exists($gradesStoreFile) && file_exists(__DIR__ . '/grades_store.json')) {
    $gradesStoreFile = __DIR__ . '/grades_store.json';
}

function getGradePoint($score) {
    $score = floatval($score);
    if ($score >= 70) return ["grade" => "A", "point" => 5.0];
    if ($score >= 60) return ["grade" => "B", "point" => 4.0];
    if ($score >= 50) return ["grade" => "C", "point" => 3.0];
    if ($score >= 45) return ["grade" => "D", "point" => 2.0];
    if ($score >= 40) return ["grade" => "E", "point" => 1.0];
    return ["grade" => "F", "point" => 0.0];
}

$matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? '');

// Check if dynamic grades exist in grades_store.json
$dynamicGrades = [];
if (file_exists($gradesStoreFile)) {
    $c = @file_get_contents($gradesStoreFile);
    $d = @json_decode($c, true);
    if (is_array($d)) {
        foreach ($d as $g) {
            if (strtolower(trim($g['matricNo'] ?? '')) === strtolower(trim($matricNo))) {
                $dynamicGrades[] = $g;
            }
        }
    }
}

if (!empty($dynamicGrades)) {
    // Group by semester
    $grouped = [];
    foreach ($dynamicGrades as $g) {
        $sem = $g['semester'] ?? 'First Semester, 2025/2026';
        if (!isset($grouped[$sem])) {
            $grouped[$sem] = [];
        }
        $grouped[$sem][] = $g;
    }

    $processedSemesters = [];
    $totalQualityPointsSum = 0.0;
    $totalCreditUnitsSum = 0;

    foreach ($grouped as $semName => $gList) {
        $semQualityPoints = 0.0;
        $semCreditUnits = 0;
        $computedCourses = [];

        foreach ($gList as $c) {
            $units = intval($c['units'] ?? 3);
            $score = floatval($c['score'] ?? 0);
            $gp = getGradePoint($score);
            $points = floatval($c['qualityPoints'] ?? ($units * $gp['point']));
            $computedCourses[] = [
                "code" => $c['courseCode'],
                "title" => $c['courseTitle'] ?? $c['code'] ?? 'Course Title',
                "units" => $units,
                "assignment" => floatval($c['assignment'] ?? 0),
                "caTest" => floatval($c['caTest'] ?? 0),
                "project" => floatval($c['project'] ?? 0),
                "exam" => floatval($c['exam'] ?? 0),
                "score" => intval($score),
                "grade" => $gp['grade'],
                "gradePoint" => $gp['point'],
                "qualityPoints" => $points
            ];
            $semQualityPoints += $points;
            $semCreditUnits += $units;
        }

        $semGpa = $semCreditUnits > 0 ? round($semQualityPoints / $semCreditUnits, 2) : 0.0;
        $processedSemesters[] = [
            "semesterName" => $semName,
            "gpa" => $semGpa,
            "totalUnits" => $semCreditUnits,
            "totalQualityPoints" => $semQualityPoints,
            "courses" => $computedCourses
        ];

        $totalQualityPointsSum += $semQualityPoints;
        $totalCreditUnitsSum += $semCreditUnits;
    }

    $calculatedCgpa = $totalCreditUnitsSum > 0 ? round($totalQualityPointsSum / $totalCreditUnitsSum, 2) : 0.0;
} else {
    $rawSemesters = [
        [
            "semesterName" => "First Semester, 2025/2026",
            "courses" => [
                ["code" => "NUR 101", "title" => "Foundations of Professional Nursing Practice", "units" => 3, "assignment" => 8, "caTest" => 17, "project" => 9, "exam" => 50, "score" => 84],
                ["code" => "ANA 102", "title" => "Human Anatomy & General Physiology I", "units" => 4, "assignment" => 9, "caTest" => 16, "project" => 8, "exam" => 45, "score" => 78],
                ["code" => "MLS 103", "title" => "Fundamentals of Medical Laboratory Science", "units" => 3, "assignment" => 7, "caTest" => 14, "project" => 8, "exam" => 43, "score" => 72],
                ["code" => "GST 111", "title" => "Communication in English & Use of Library", "units" => 2, "assignment" => 6, "caTest" => 15, "project" => 7, "exam" => 40, "score" => 68]
            ]
        ],
        [
            "semesterName" => "Second Semester, 2025/2026",
            "courses" => [
                ["code" => "NUR 104", "title" => "Clinical Nursing Practice Simulation", "units" => 4, "assignment" => 9, "caTest" => 17, "project" => 8, "exam" => 47, "score" => 81],
                ["code" => "ANA 104", "title" => "Human Anatomy & Physiology II", "units" => 4, "assignment" => 8, "caTest" => 15, "project" => 8, "exam" => 44, "score" => 75],
                ["code" => "CHE 106", "title" => "Primary Healthcare & Environmental Hygiene", "units" => 3, "assignment" => 7, "caTest" => 13, "project" => 7, "exam" => 42, "score" => 69],
                ["code" => "GST 112", "title" => "Nigerian Peoples, History & Culture", "units" => 2, "assignment" => 8, "caTest" => 16, "project" => 7, "exam" => 45, "score" => 76]
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
                "assignment" => floatval($c['assignment'] ?? 8),
                "caTest" => floatval($c['caTest'] ?? 16),
                "project" => floatval($c['project'] ?? 8),
                "exam" => floatval($c['exam'] ?? 45),
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
}

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
    "cgpa" => number_format($calculatedCgpa, 2, '.', ''),
    "totalQualityPoints" => $totalQualityPointsSum,
    "totalUnits" => $totalCreditUnitsSum,
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
