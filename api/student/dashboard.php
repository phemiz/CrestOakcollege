<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../admin/db.php';
$conn = getDbConnection();

$regNumber = $_GET['regNumber'] ?? $_GET['username'] ?? '';

$student = null;
$courses = [];
$results = [];
$invoices = [];

if ($conn && !empty($regNumber)) {
    $stmt = $conn->prepare("SELECT * FROM Student WHERE regNumber = ? OR username = ? LIMIT 1");
    if ($stmt) {
        $stmt->bind_param("ss", $regNumber, $regNumber);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res && $row = $res->fetch_assoc()) {
            $student = $row;
        }
        $stmt->close();
    }
    
    if ($student) {
        $stuId = $student['id'];
        
        // Courses registered
        $resC = @$conn->query("SELECT * FROM CourseRegistration WHERE studentId = '$stuId'");
        if ($resC) {
            while ($c = $resC->fetch_assoc()) {
                $courses[] = $c;
            }
        }

        // Results
        $resR = @$conn->query("SELECT * FROM Result WHERE studentId = '$stuId'");
        if ($resR) {
            while ($r = $resR->fetch_assoc()) {
                $results[] = $r;
            }
        }

        // Invoices
        $resI = @$conn->query("SELECT * FROM Invoice WHERE userId = '$stuId'");
        if ($resI) {
            while ($i = $resI->fetch_assoc()) {
                $invoices[] = $i;
            }
        }
    }
    
    $conn->close();
}

echo json_encode([
    "success" => true,
    "student" => $student,
    "courses" => $courses,
    "results" => $results,
    "invoices" => $invoices
]);
