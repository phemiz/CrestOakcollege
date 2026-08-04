<?php
require_once __DIR__.'/../auth/session.php';
require_session(['ADMIN','SUPERADMIN']);
require_once __DIR__ . '/db.php';


$storeFile = __DIR__ . '/grades_store.json';
if (!file_exists($storeFile) && file_exists(__DIR__ . '/../admin/grades_store.json')) {
    $storeFile = __DIR__ . '/../admin/grades_store.json';
}

function readGradesStore($file) {
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        $data = @json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return [];
}

function writeGradesStore($file, array $grades) {
    @file_put_contents($file, json_encode($grades, JSON_PRETTY_PRINT));
    @chmod($file, 0644);
}

function calculateGradeAndPoint($score) {
    $score = floatval($score);
    if ($score >= 70) return ["grade" => "A", "point" => 5.0];
    if ($score >= 60) return ["grade" => "B", "point" => 4.0];
    if ($score >= 50) return ["grade" => "C", "point" => 3.0];
    if ($score >= 45) return ["grade" => "D", "point" => 2.0];
    if ($score >= 40) return ["grade" => "E", "point" => 1.0];
    return ["grade" => "F", "point" => 0.0];
}

$currentGrades = readGradesStore($storeFile);

$rawInput = file_get_contents('php://input');
$requestData = json_decode($rawInput, true) ?? $_POST ?? [];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? '');
    $courseCode = trim($_GET['courseCode'] ?? '');

    if ($matricNo) {
        $studentGrades = array_filter($currentGrades, function($g) use ($matricNo) {
            return strtolower(trim($g['matricNo'] ?? '')) === strtolower(trim($matricNo));
        });

        $totalUnits = 0;
        $totalQualityPoints = 0.0;
        foreach ($studentGrades as $g) {
            $u = intval($g['units'] ?? 3);
            $qp = floatval($g['qualityPoints'] ?? (floatval($g['units']) * floatval($g['gradePoint'])));
            $totalUnits += $u;
            $totalQualityPoints += $qp;
        }

        $cgpa = $totalUnits > 0 ? round($totalQualityPoints / $totalUnits, 2) : 0.00;

        echo json_encode([
            "success" => true,
            "matricNo" => $matricNo,
            "cgpa" => number_format($cgpa, 2, '.', ''),
            "totalUnits" => $totalUnits,
            "totalQualityPoints" => $totalQualityPoints,
            "grades" => array_values($studentGrades)
        ]);
        exit();
    }

    if ($courseCode) {
        $courseGrades = array_filter($currentGrades, function($g) use ($courseCode) {
            return strtolower(str_replace(' ', '', $g['courseCode'] ?? '')) === strtolower(str_replace(' ', '', $courseCode));
        });
        echo json_encode([
            "success" => true,
            "courseCode" => $courseCode,
            "grades" => array_values($courseGrades)
        ]);
        exit();
    }

    echo json_encode([
        "success" => true,
        "grades" => $currentGrades
    ]);
    exit();
}

if ($method === 'POST') {
    validate_csrf();
    $action = $requestData['action'] ?? 'save_grade';
    $matricNo = trim($requestData['matricNo'] ?? '');
    $courseCode = trim($requestData['courseCode'] ?? '');
    $courseTitle = trim($requestData['courseTitle'] ?? 'Registered Course');
    $units = intval($requestData['units'] ?? 3);
    $semester = trim($requestData['semester'] ?? 'First Semester, 2025/2026');
    $session = trim($requestData['session'] ?? '2025/2026');

    // Breakdown scores
    $assignment = min(10, max(0, floatval($requestData['assignment'] ?? 0)));
    $caTest = min(20, max(0, floatval($requestData['caTest'] ?? 0)));
    $project = min(10, max(0, floatval($requestData['project'] ?? 0)));
    $exam = min(60, max(0, floatval($requestData['exam'] ?? 0)));
    $totalScore = min(100, max(0, $assignment + $caTest + $project + $exam));

    $gradeInfo = calculateGradeAndPoint($totalScore);
    $gradePoint = $gradeInfo['point'];
    $letterGrade = $gradeInfo['grade'];
    $qualityPoints = $units * $gradePoint;

    if (!$matricNo || !$courseCode) {
        echo json_encode(["success" => false, "message" => "Matriculation number and Course Code are required."]);
        exit();
    }

    $existingIndex = -1;
    foreach ($currentGrades as $idx => $g) {
        if (strtolower(trim($g['matricNo'])) === strtolower(trim($matricNo)) &&
            strtolower(str_replace(' ', '', $g['courseCode'])) === strtolower(str_replace(' ', '', $courseCode))) {
            $existingIndex = $idx;
            break;
        }
    }

    $gradeRecord = [
        "id" => $existingIndex >= 0 ? $currentGrades[$existingIndex]['id'] : ("GRD-" . rand(1000, 9999)),
        "matricNo" => $matricNo,
        "courseCode" => $courseCode,
        "courseTitle" => $courseTitle,
        "units" => $units,
        "semester" => $semester,
        "session" => $session,
        "assignment" => $assignment,
        "caTest" => $caTest,
        "project" => $project,
        "exam" => $exam,
        "score" => $totalScore,
        "grade" => $letterGrade,
        "gradePoint" => $gradePoint,
        "qualityPoints" => $qualityPoints,
        "recordedBy" => $requestData['recordedBy'] ?? 'Course Lecturer',
        "updatedAt" => date('Y-m-d H:i:s')
    ];

    if ($existingIndex >= 0) {
        $currentGrades[$existingIndex] = $gradeRecord;
    } else {
        $currentGrades[] = $gradeRecord;
    }

    writeGradesStore($storeFile, $currentGrades);

    // Compute updated student CGPA
    $studentGrades = array_filter($currentGrades, function($g) use ($matricNo) {
        return strtolower(trim($g['matricNo'])) === strtolower(trim($matricNo));
    });
    $totalUnitsSum = 0;
    $totalQualityPointsSum = 0.0;
    foreach ($studentGrades as $g) {
        $totalUnitsSum += intval($g['units']);
        $totalQualityPointsSum += floatval($g['qualityPoints']);
    }
    $newCgpa = $totalUnitsSum > 0 ? round($totalQualityPointsSum / $totalUnitsSum, 2) : 0.00;

    echo json_encode([
        "success" => true,
        "message" => "Grade saved successfully.",
        "grade" => $gradeRecord,
        "calculatedCgpa" => number_format($newCgpa, 2, '.', ''),
        "totalQualityPoints" => $totalQualityPointsSum,
        "totalUnits" => $totalUnitsSum
    ]);
    exit();
}
