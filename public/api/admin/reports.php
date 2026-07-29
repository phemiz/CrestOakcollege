<?php
require_once __DIR__ . '/db.php';

$summaryStats = [
    "totalStudents" => 1250,
    "totalRevenue" => 42500000.00,
    "avgCgpa" => 4.12,
    "unpaidAmount" => 8500000.00
];

$deptDistribution = [
    ["name" => "Department of Nursing Sciences", "count" => 450],
    ["name" => "Department of Medical Laboratory Science", "count" => 320],
    ["name" => "Department of Community Health Sciences", "count" => 280],
    ["name" => "Department of Computer Science & IT", "count" => 120],
    ["name" => "Department of Business Administration", "count" => 80]
];

$revenueByFeeType = [
    ["type" => "TUITION", "amount" => 32000000.00],
    ["type" => "ACCEPTANCE", "amount" => 6500000.00],
    ["type" => "ACCOMMODATION", "amount" => 4000000.00]
];

$rawStudents = [
    ["matricNo" => "UG/2026/NUR/1042", "name" => "Azeez Okunola", "department" => "Nursing Sciences", "level" => 100, "cgpa" => 4.25, "email" => "azeez.okunola@crestoakcollege.com.ng"],
    ["matricNo" => "UG/2026/CHEW/2081", "name" => "Fatima Abubakar", "department" => "Community Health Sciences", "level" => 200, "cgpa" => 3.85, "email" => "fatima.abubakar@crestoakcollege.com.ng"]
];

$rawPayments = [
    ["reference" => "PAY-2026-NUR-001", "amountPaid" => 350000, "method" => "PAYSTACK", "status" => "SUCCESS", "paidAt" => "2026-07-20", "studentName" => "Azeez Okunola", "matricNo" => "UG/2026/NUR/1042", "feeType" => "TUITION"],
    ["reference" => "PAY-2026-CHEW-002", "amountPaid" => 50000, "method" => "PAYSTACK", "status" => "SUCCESS", "paidAt" => "2026-07-21", "studentName" => "Fatima Abubakar", "matricNo" => "UG/2026/CHEW/2081", "feeType" => "ACCEPTANCE"]
];

echo json_encode([
    "success" => true,
    "summaryStats" => $summaryStats,
    "deptDistribution" => $deptDistribution,
    "revenueByFeeType" => $revenueByFeeType,
    "rawStudents" => $rawStudents,
    "rawPayments" => $rawPayments
]);
