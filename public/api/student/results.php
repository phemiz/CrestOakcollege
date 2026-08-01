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

function normalizeMatric($matric) {
    return strtoupper(trim(str_replace('\\', '', $matric)));
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
if (!empty($matricNo) && file_exists($gradesStoreFile)) {
    $c = @file_get_contents($gradesStoreFile);
    $d = @json_decode($c, true);
    if (is_array($d)) {
        foreach ($d as $g) {
            if (normalizeMatric($g['matricNo'] ?? '') === normalizeMatric($matricNo)) {
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
}

// Clean Zero State response when no recorded grades exist
echo json_encode([
    "success" => true,
    "matricNo" => $matricNo,
    "cgpa" => "0.00",
    "totalQualityPoints" => 0,
    "totalUnits" => 0,
    "results" => [
        "summary" => [
            "cgpa" => 0.00,
            "gpa" => 0.00,
            "totalUnitsRegistered" => 0,
            "totalUnitsEarned" => 0,
            "totalQualityPoints" => 0,
            "classOfDegree" => "N/A"
        ],
        "semesters" => []
    ]
]);
exit();
