<?php
require_once __DIR__ . '/db.php';


$conn = getDbConnection();

$totalStudents = 0;
$totalRevenue = 0.0;
$avgCgpa = 0.00;
$unpaidAmount = 0.0;
$deptDistribution = [];
$revenueByFeeType = [];
$rawStudents = [];
$rawPayments = [];

if ($conn) {
    // 1. Total Enrolled Students
    $res = @$conn->query("SELECT COUNT(*) as cnt FROM Student WHERE isDeleted = 0 OR isDeleted IS NULL");
    if ($res && $row = $res->fetch_assoc()) {
        $totalStudents = intval($row['cnt']);
    }

    // 2. Total Settled Revenue
    $res = @$conn->query("SELECT COALESCE(SUM(amountPaid), 0) as total FROM Payment WHERE status IN ('PAID', 'SUCCESS') AND (isDeleted = 0 OR isDeleted IS NULL)");
    if ($res && $row = $res->fetch_assoc()) {
        $totalRevenue = floatval($row['total']);
    }
    if ($totalRevenue == 0.0) {
        $resInv = @$conn->query("SELECT COALESCE(SUM(amount), 0) as total FROM Invoice WHERE status = 'PAID' AND (isDeleted = 0 OR isDeleted IS NULL)");
        if ($resInv && $rowInv = $resInv->fetch_assoc()) {
            $totalRevenue = floatval($rowInv['total']);
        }
    }

    // 3. Average CGPA / GPA
    $res = @$conn->query("SELECT COALESCE(AVG(CAST(gpa AS DECIMAL(4,2))), 0.00) as avgGpa FROM Student WHERE (isDeleted = 0 OR isDeleted IS NULL) AND gpa IS NOT NULL AND gpa > 0");
    if ($res && $row = $res->fetch_assoc()) {
        $avgCgpa = round(floatval($row['avgGpa']), 2);
    }

    // 4. Receivables / Unpaid Amount
    $res = @$conn->query("SELECT COALESCE(SUM(amount), 0) as total FROM Invoice WHERE status IN ('PENDING', 'UNPAID') AND (isDeleted = 0 OR isDeleted IS NULL)");
    if ($res && $row = $res->fetch_assoc()) {
        $unpaidAmount = floatval($row['total']);
    }

    // 5. Students Distribution by Department
    $res = @$conn->query("SELECT COALESCE(department, 'General Health') as name, COUNT(*) as count FROM Student WHERE (isDeleted = 0 OR isDeleted IS NULL) GROUP BY department");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $deptDistribution[] = [
                "name" => $row['name'],
                "count" => intval($row['count'])
            ];
        }
    }

    // 6. Revenue by Fee Type
    $res = @$conn->query("SELECT COALESCE(i.feeType, 'TUITION') as type, COALESCE(SUM(p.amountPaid), 0) as amount FROM Payment p LEFT JOIN Invoice i ON p.invoiceId = i.id WHERE p.status IN ('PAID', 'SUCCESS') GROUP BY i.feeType");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $revenueByFeeType[] = [
                "type" => $row['type'],
                "amount" => floatval($row['amount'])
            ];
        }
    }

    // 7. Raw Students Dataset for Export
    $res = @$conn->query("SELECT regNumber as matricNo, CONCAT(firstName, ' ', lastName) as name, department, level, gpa as cgpa, email FROM Student WHERE (isDeleted = 0 OR isDeleted IS NULL) LIMIT 500");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $rawStudents[] = [
                "matricNo" => $row['matricNo'] ?? 'STU-2026',
                "name" => trim($row['name']) ?: 'Student Record',
                "department" => $row['department'] ?? 'Health Sciences',
                "level" => intval($row['level'] ?? 100),
                "cgpa" => floatval($row['cgpa'] ?? 0.0),
                "email" => $row['email'] ?? 'student@crestoakcollege.com.ng'
            ];
        }
    }

    // 8. Raw Payments Dataset for Export
    $res = @$conn->query("SELECT p.reference, p.amountPaid, p.method, p.status, p.paidAt, CONCAT(u.firstName, ' ', u.lastName) as studentName, i.feeType FROM Payment p LEFT JOIN Invoice i ON p.invoiceId = i.id LEFT JOIN User u ON i.userId = u.id ORDER BY p.createdAt DESC LIMIT 500");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $rawPayments[] = [
                "reference" => $row['reference'] ?? 'PAY-REF',
                "amountPaid" => floatval($row['amountPaid']),
                "method" => $row['method'] ?? 'PAYSTACK',
                "status" => $row['status'] ?? 'SUCCESS',
                "paidAt" => $row['paidAt'] ?? date('Y-m-d'),
                "studentName" => trim($row['studentName']) ?: 'Student Account',
                "feeType" => $row['feeType'] ?? 'TUITION'
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
]);
