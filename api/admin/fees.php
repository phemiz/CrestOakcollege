<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$conn = getDbConnection();

$defaultInvoices = [
    [
        "id" => "inv-001",
        "invoiceNo" => "INV-2026-ACC-819",
        "amount" => 50000,
        "description" => "Admissions Acceptance Fee - 2026/2027",
        "feeType" => "ACCEPTANCE",
        "status" => "PAID",
        "dueDate" => "2026-08-01",
        "createdAt" => "2026-07-21T09:00:00Z",
        "user" => [
            "id" => "user-app-102",
            "firstName" => "Bisi",
            "lastName" => "Akindele",
            "email" => "bisi.akindele@yahoo.com"
        ]
    ],
    [
        "id" => "inv-002",
        "invoiceNo" => "INV-2026-TUI-902",
        "amount" => 350000,
        "description" => "School Tuition Fee - Year 1 First Semester",
        "feeType" => "TUITION",
        "status" => "UNPAID",
        "dueDate" => "2026-09-15",
        "createdAt" => "2026-07-22T11:00:00Z",
        "user" => [
            "id" => "user-app-102",
            "firstName" => "Bisi",
            "lastName" => "Akindele",
            "email" => "bisi.akindele@yahoo.com"
        ]
    ]
];

$defaultFeeSchedules = [
    ["faculty" => "Health Sciences", "tuition" => 350000, "acceptance" => 50000, "hostel" => 120000],
    ["faculty" => "Management & Law", "tuition" => 280000, "acceptance" => 50000, "hostel" => 120000],
    ["faculty" => "Technology & Applied Sciences", "tuition" => 300000, "acceptance" => 50000, "hostel" => 120000]
];

if ($method === 'GET') {
    echo json_encode([
        "success" => true,
        "invoices" => $defaultInvoices,
        "feeSchedules" => $defaultFeeSchedules
    ]);
    exit();
}

if ($method === 'POST') {
    $invNo = "INV-2026-CUST-" . rand(1000, 9999);
    echo json_encode([
        "success" => true,
        "message" => "Invoice generated successfully.",
        "invoice" => [
            "id" => "inv-" . rand(1000, 9999),
            "invoiceNo" => $invNo,
            "amount" => floatval($input['amount'] ?? 50000),
            "description" => $input['description'] ?? 'Custom Fee Charge',
            "feeType" => $input['feeType'] ?? 'TUITION',
            "status" => "UNPAID",
            "dueDate" => $input['dueDate'] ?? date('Y-m-d', strtotime('+30 days')),
            "createdAt" => date('c'),
            "user" => [
                "id" => $input['userId'] ?? "user-001",
                "firstName" => "Student",
                "lastName" => "Recipient",
                "email" => "student@crestoakcollege.com.ng"
            ]
        ]
    ]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
