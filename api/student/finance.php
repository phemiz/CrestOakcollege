<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? '');

$invoices = [
    [
        "id" => "INV-001",
        "description" => "Acceptance Fee & Clearance Token",
        "amount" => 50000,
        "status" => "PAID",
        "category" => "Acceptance",
        "date" => "June 01, 2026"
    ],
    [
        "id" => "INV-002",
        "description" => "First Semester Tuition Fee (70% Upfront)",
        "amount" => 280000,
        "status" => "PAID",
        "category" => "School Fees",
        "date" => "June 02, 2026"
    ],
    [
        "id" => "INV-003",
        "description" => "Second Semester Tuition Fee (30% Balance)",
        "amount" => 120000,
        "status" => "PENDING",
        "category" => "School Fees",
        "date" => "June 03, 2026"
    ],
    [
        "id" => "INV-004",
        "description" => "Administrative & Medical Clinical Charges",
        "amount" => 175000,
        "status" => "PAID",
        "category" => "Administrative",
        "date" => "June 04, 2026"
    ],
    [
        "id" => "INV-005",
        "description" => "Hostel Accommodation Fee (Optional)",
        "amount" => 200000,
        "status" => "PENDING",
        "category" => "Hostel",
        "date" => "June 05, 2026"
    ]
];

$receipts = [
    [
        "receiptNo" => "RCP-2026-9041",
        "invoiceId" => "INV-001",
        "description" => "Acceptance Fee & Clearance Token",
        "amount" => 50000,
        "date" => "2026-06-01 10:15:22",
        "gateway" => "Paystack (Card)",
        "refCode" => "pstk_ref_904182741"
    ],
    [
        "receiptNo" => "RCP-2026-9082",
        "invoiceId" => "INV-002",
        "description" => "First Semester Tuition Fee (70% Upfront)",
        "amount" => 280000,
        "date" => "2026-06-02 14:22:05",
        "gateway" => "Paystack (Bank Transfer)",
        "refCode" => "pstk_ref_908200192"
    ],
    [
        "receiptNo" => "RCP-2026-9115",
        "invoiceId" => "INV-004",
        "description" => "Administrative & Medical Clinical Charges",
        "amount" => 175000,
        "date" => "2026-06-04 11:05:40",
        "gateway" => "Direct Bank Transfer",
        "refCode" => "trn_ref_91158204"
    ]
];

$totalBilled = 825000;
$totalPaid = 505000;
$outstandingBalance = 320000;

echo json_encode([
    "success" => true,
    "matricNo" => $matricNo,
    "financialSummary" => [
        "totalBilled" => $totalBilled,
        "totalPaid" => $totalPaid,
        "outstandingBalance" => $outstandingBalance,
        "currency" => "NGN",
        "symbol" => "₦"
    ],
    "invoices" => $invoices,
    "receipts" => $receipts
]);
exit();
