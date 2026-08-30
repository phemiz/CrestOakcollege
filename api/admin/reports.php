<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'BURSARY']);

$conn = getDbConnection();

$totalStudents = 0;
$totalRevenue = 0.0;
$avgCgpa = 0.0;
$studentCgpa = [];
$unpaidAmount = 0.0;
$deptDistribution = [];
$revenueByFeeType = [];
$rawStudents = [];
$rawPayments = [];

if ($conn) {
    // 1. Total Enrolled Students
    $res = @$conn->query("SELECT COUNT(*) as cnt FROM students WHERE isDeleted = 0 OR isDeleted IS NULL");
    if ($res && $row = $res->fetch_assoc()) {
        $totalStudents = intval($row['cnt']);
    }

    // 1b. Overall Average CGPA (from real results data)
    $res = @$conn->query("SELECT COALESCE(AVG(grade_point), 0) as avg_gpa FROM results");
    if ($res && $row = $res->fetch_assoc()) {
        $avgCgpa = round(floatval($row['avg_gpa']), 2);
    }

    // 1c. Per-Student Average CGPA (for rawStudents export)
    $res = @$conn->query("SELECT student_id, AVG(grade_point) as gpa FROM results GROUP BY student_id");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $studentCgpa[intval($row['student_id'])] = round(floatval($row['gpa']), 2);
        }
    }

    // 2. Total Settled Revenue
    $res = @$conn->query("SELECT COALESCE(SUM(amount), 0) as total FROM fees WHERE status = 'PAID'");
    if ($res && $row = $res->fetch_assoc()) {
        $totalRevenue = floatval($row['total']);
    }

    // 3. Receivables / Unpaid Amount
    $res = @$conn->query("SELECT COALESCE(SUM(amount), 0) as total FROM fees WHERE status IN ('PENDING', 'UNPAID', 'OVERDUE')");
    if ($res && $row = $res->fetch_assoc()) {
        $unpaidAmount = floatval($row['total']);
    }

    // 4. Students Distribution by Department
    $res = @$conn->query("SELECT COALESCE(department_name, 'General Studies') as name, COUNT(*) as count FROM students WHERE (isDeleted = 0 OR isDeleted IS NULL) GROUP BY COALESCE(department_name, 'General Studies')");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $deptDistribution[] = [
                "name" => $row['name'],
                "count" => intval($row['count'])
            ];
        }
    }

    // 5. Raw Students Dataset for Export
    $res = @$conn->query("SELECT id, matric_no, CONCAT(first_name, ' ', last_name) as name, department_name as department, level, email FROM students WHERE (isDeleted = 0 OR isDeleted IS NULL) LIMIT 500");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $rawStudents[] = [
                "matricNo" => $row['matric_no'] ?? 'COH/2026/001',
                "name" => trim($row['name']) ?: 'Student Record',
                "department" => $row['department'] ?? 'Health Sciences',
                "level" => intval($row['level'] ?? 100),
                "cgpa" => ($studentCgpa[intval($row['id'] ?? 0)] ?? 0.0),
                "email" => $row['email'] ?? 'student@crestoakcollege.com.ng'
            ];
        }
    }

    $conn->close();
}

echo json_encode([
    "success" => true,
    "summaryStats" => [
        "totalStudents" => $totalStudents,
        "totalRevenue" => $totalRevenue,
        "avgCgpa" => $avgCgpa,
        "unpaidAmount" => $unpaidAmount
    ],
    "deptDistribution" => $deptDistribution,
    "revenueByFeeType" => $revenueByFeeType,
    "rawStudents" => $rawStudents,
    "rawPayments" => $rawPayments
], JSON_UNESCAPED_SLASHES);
