<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?? $_POST ?? [];

$matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? $data['matricNo'] ?? '');
$isPaidDemo = isset($_GET['demo_paid']) || isset($_GET['paid']);

// Bursar Fee Engine Configuration (Total ₦770,000 breakdown)
if ($isPaidDemo) {
    $invoices = [
        [
            "id" => "INV-001",
            "description" => "Acceptance Fee & Clearance Token *",
            "amount" => 50000,
            "paidAmount" => 50000,
            "status" => "Paid",
            "category" => "Acceptance",
            "isMandatoryFullUpfront" => true,
            "date" => "June 01, 2026"
        ],
        [
            "id" => "INV-002",
            "description" => "Medical Examination & Health Insurance *",
            "amount" => 35000,
            "paidAmount" => 35000,
            "status" => "Paid",
            "category" => "Medical",
            "isMandatoryFullUpfront" => true,
            "date" => "June 02, 2026"
        ],
        [
            "id" => "INV-003",
            "description" => "Administrative & Matriculation Charges *",
            "amount" => 25000,
            "paidAmount" => 25000,
            "status" => "Paid",
            "category" => "Administrative",
            "isMandatoryFullUpfront" => true,
            "date" => "June 03, 2026"
        ],
        [
            "id" => "INV-004",
            "description" => "First Semester Tuition Fee (70% Upfront Requirement)",
            "amount" => 280000,
            "paidAmount" => 280000,
            "status" => "Paid",
            "category" => "School Fees",
            "isMandatoryFullUpfront" => false,
            "installmentStage" => "FIRST_70_PERCENT",
            "date" => "June 04, 2026"
        ],
        [
            "id" => "INV-005",
            "description" => "Second Installment Tuition Fee (30% Exam Balance)",
            "amount" => 120000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "School Fees",
            "isMandatoryFullUpfront" => false,
            "installmentStage" => "SECOND_30_PERCENT",
            "date" => "June 05, 2026"
        ],
        [
            "id" => "INV-006",
            "description" => "Hostel Accommodation & Facilities (Optional)",
            "amount" => 260000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "Hostel",
            "isMandatoryFullUpfront" => false,
            "date" => "June 06, 2026"
        ]
    ];
    $receipts = [
        [
            "receiptNo" => "RCP-2026-9041",
            "invoiceId" => "INV-001",
            "description" => "Acceptance Fee & Clearance Token *",
            "amount" => 50000,
            "date" => "2026-06-01 10:15:22",
            "gateway" => "Paystack (Card)",
            "refCode" => "pstk_ref_904182741",
            "verificationCode" => "VER-9041-OK"
        ],
        [
            "receiptNo" => "RCP-2026-9082",
            "invoiceId" => "INV-002",
            "description" => "Medical Examination & Health Insurance *",
            "amount" => 35000,
            "date" => "2026-06-02 14:22:05",
            "gateway" => "Paystack (Bank Transfer)",
            "refCode" => "pstk_ref_908200192",
            "verificationCode" => "VER-9082-OK"
        ],
        [
            "receiptNo" => "RCP-2026-9115",
            "invoiceId" => "INV-003",
            "description" => "Administrative & Matriculation Charges *",
            "amount" => 25000,
            "date" => "2026-06-03 11:05:40",
            "gateway" => "Direct Bank Transfer",
            "refCode" => "trn_ref_91158204",
            "verificationCode" => "VER-9115-OK"
        ],
        [
            "receiptNo" => "RCP-2026-9180",
            "invoiceId" => "INV-004",
            "description" => "First Semester Tuition Fee (70% Upfront Requirement)",
            "amount" => 280000,
            "date" => "2026-06-04 16:30:10",
            "gateway" => "Paystack (Card)",
            "refCode" => "pstk_ref_91800412",
            "verificationCode" => "VER-9180-OK"
        ]
    ];
    $totalPaid = 390000;
} else {
    $invoices = [
        [
            "id" => "INV-001",
            "description" => "Acceptance Fee & Clearance Token *",
            "amount" => 50000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "Acceptance",
            "isMandatoryFullUpfront" => true,
            "date" => "June 01, 2026"
        ],
        [
            "id" => "INV-002",
            "description" => "Medical Examination & Health Insurance *",
            "amount" => 35000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "Medical",
            "isMandatoryFullUpfront" => true,
            "date" => "June 02, 2026"
        ],
        [
            "id" => "INV-003",
            "description" => "Administrative & Matriculation Charges *",
            "amount" => 25000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "Administrative",
            "isMandatoryFullUpfront" => true,
            "date" => "June 03, 2026"
        ],
        [
            "id" => "INV-004",
            "description" => "First Semester Tuition Fee (70% Upfront Requirement)",
            "amount" => 280000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "School Fees",
            "isMandatoryFullUpfront" => false,
            "installmentStage" => "FIRST_70_PERCENT",
            "date" => "June 04, 2026"
        ],
        [
            "id" => "INV-005",
            "description" => "Second Installment Tuition Fee (30% Exam Balance)",
            "amount" => 120000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "School Fees",
            "isMandatoryFullUpfront" => false,
            "installmentStage" => "SECOND_30_PERCENT",
            "date" => "June 05, 2026"
        ],
        [
            "id" => "INV-006",
            "description" => "Hostel Accommodation & Facilities (Optional)",
            "amount" => 260000,
            "paidAmount" => 0,
            "status" => "Pending",
            "category" => "Hostel",
            "isMandatoryFullUpfront" => false,
            "date" => "June 06, 2026"
        ]
    ];
    $receipts = [];
    $totalPaid = 0;
}

$totalBilled = 770000;
$outstandingBalance = $totalBilled - $totalPaid;
$minimumRequiredUpfront = 390000;
$is70PercentPaid = $totalPaid >= $minimumRequiredUpfront;
$isExamEligible = $totalPaid >= $minimumRequiredUpfront;

$status = $totalPaid == 0 ? "UNPAID" : ($outstandingBalance <= 0 ? "PAID" : ($isExamEligible ? "EXAM_ELIGIBLE" : "PARTIAL_70_PERCENT"));

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data['payInvoiceId'])) {
    $payId = $data['payInvoiceId'];
    $payAmount = floatval($data['amount'] ?? 0);
    echo json_encode([
        "success" => true,
        "message" => "Payment transaction processed successfully.",
        "receipt" => [
            "receiptNo" => "RCP-2026-" . rand(1000, 9999),
            "invoiceId" => $payId,
            "description" => "Installment Payment Clearing",
            "amount" => $payAmount,
            "date" => date('Y-m-d H:i:s'),
            "gateway" => "Paystack",
            "refCode" => "pstk_ref_" . rand(1000000, 9999999),
            "verificationCode" => "VER-" . rand(1000, 9999) . "-OK"
        ]
    ]);
    exit();
}

echo json_encode([
    "success" => true,
    "matricNo" => $matricNo,
    "totalBilled" => $totalBilled,
    "totalPaid" => $totalPaid,
    "outstandingBalance" => $outstandingBalance,
    "status" => $status,
    "minimumUpfrontRequired" => $minimumRequiredUpfront,
    "financialSummary" => [
        "totalBilled" => $totalBilled,
        "totalPaid" => $totalPaid,
        "outstandingBalance" => $outstandingBalance,
        "minimumRequiredUpfront" => $minimumRequiredUpfront,
        "mandatoryFullUpfrontTotal" => 110000,
        "tuitionTotal" => 400000,
        "tuition70PercentAmount" => 280000,
        "tuition30PercentAmount" => 120000,
        "isExamEligible" => $isExamEligible,
        "is70PercentPaid" => $is70PercentPaid,
        "paymentStatus" => $status,
        "currency" => "NGN",
        "symbol" => "₦"
    ],
    "invoices" => $invoices,
    "receipts" => $receipts
]);
exit();
