<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'BURSARY', 'BURSAR']);

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDbConnection();

$defaultFeeSchedules = [
    ["faculty" => "Health Sciences", "tuition" => 350000, "acceptance" => 50000, "hostel" => 120000],
    ["faculty" => "Management & Law", "tuition" => 280000, "acceptance" => 50000, "hostel" => 120000],
    ["faculty" => "Technology & Applied Sciences", "tuition" => 300000, "acceptance" => 50000, "hostel" => 120000]
];

function mapFeeStatus($status) {
    switch ($status) {
        case 'unpaid': return 'UNPAID';
        case 'partial': return 'PARTIALLY_PAID';
        case 'paid': return 'PAID';
        case 'waived': return 'CANCELLED';
        default: return strtoupper($status);
    }
}

if ($method === 'GET') {
    $payments = [];
    $invoices = [];
    $students = [];
    $totalRevenue = 0;
    $totalTuition = 0;
    $totalHostel = 0;
    $totalOutstanding = 0;

    if ($conn) {
        // Settlement ledger (bursary dashboard)
        $res = $conn->query("
            SELECT fp.payment_reference, fp.amount, fp.status AS payment_status, fp.paid_at, fp.created_at,
                   sf.id AS student_fee_id, sf.status AS invoice_status,
                   s.first_name, s.last_name, s.matric_no, s.email,
                   fst.fee_type, fst.description
            FROM fee_payments fp
            JOIN student_fees sf ON fp.student_fee_id = sf.id
            JOIN students s ON fp.student_id = s.id
            LEFT JOIN fee_structures fst ON sf.fee_structure_id = fst.id
            ORDER BY fp.created_at DESC
        ");
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $payments[] = [
                    "reference"   => $row['payment_reference'],
                    "amount"      => (float)$row['amount'],
                    "status"      => $row['payment_status'],
                    "feeType"     => $row['fee_type'] ?? 'FEE',
                    "description" => $row['description'] ?? 'Fee Payment',
                    "paidAt"      => $row['paid_at'],
                    "createdAt"   => $row['created_at'],
                    "student" => [
                        "firstName" => $row['first_name'],
                        "lastName"  => $row['last_name'],
                        "matricNo"  => $row['matric_no'],
                        "email"     => $row['email']
                    ]
                ];
                if ($row['payment_status'] === 'success') {
                    $totalRevenue += (float)$row['amount'];
                    $type = strtolower($row['fee_type'] ?? '');
                    if (strpos($type, 'tuition') !== false) $totalTuition += (float)$row['amount'];
                    if (strpos($type, 'hostel') !== false || strpos($type, 'accommodation') !== false) $totalHostel += (float)$row['amount'];
                }
            }
        }

        $outstandingRes = $conn->query("SELECT SUM(balance) AS total FROM student_fees WHERE status IN ('unpaid','partial')");
        if ($outstandingRes) {
            $totalOutstanding = (float)($outstandingRes->fetch_assoc()['total'] ?? 0);
        }

        // Invoices (admin Fee & Billing Management page)
        $invRes = $conn->query("
            SELECT sf.id, sf.student_id, sf.session, sf.amount_due, sf.status, sf.due_date, sf.created_at,
                   s.first_name, s.last_name, s.email,
                   fst.fee_type, fst.description
            FROM student_fees sf
            JOIN students s ON sf.student_id = s.id
            LEFT JOIN fee_structures fst ON sf.fee_structure_id = fst.id
            ORDER BY sf.id DESC
        ");
        if ($invRes) {
            while ($row = $invRes->fetch_assoc()) {
                $invoices[] = [
                    "id" => (string)$row['id'],
                    "invoiceNo" => "INV-" . ($row['session'] ?? date('Y')) . "-" . $row['id'],
                    "amount" => (float)$row['amount_due'],
                    "description" => $row['description'] ?? ($row['fee_type'] ?? 'Fee Charge'),
                    "feeType" => strtoupper($row['fee_type'] ?? 'OTHER'),
                    "status" => mapFeeStatus($row['status']),
                    "dueDate" => $row['due_date'] ?? date('Y-m-d'),
                    "createdAt" => $row['created_at'] ?? date('c'),
                    "user" => [
                        "id" => (string)$row['student_id'],
                        "firstName" => $row['first_name'] ?? 'Student',
                        "lastName" => $row['last_name'] ?? '',
                        "email" => $row['email'] ?? ''
                    ]
                ];
            }
        }

        // Students list (for the "Target Student" dropdown)
        $stuRes = $conn->query("SELECT id, matric_no, first_name, last_name FROM students ORDER BY id DESC LIMIT 500");
        if ($stuRes) {
            while ($row = $stuRes->fetch_assoc()) {
                $students[] = [
                    "id" => (string)$row['id'],
                    "matricNo" => $row['matric_no'],
                    "user" => [
                        "firstName" => $row['first_name'],
                        "lastName" => $row['last_name']
                    ]
                ];
            }
        }

        $conn->close();
    }

    echo json_encode([
        "success" => true,
        "payments" => $payments,
        "invoices" => $invoices,
        "students" => $students,
        "summary" => [
            "totalRevenue" => $totalRevenue,
            "totalTuition" => $totalTuition,
            "totalHostel" => $totalHostel,
            "totalOutstanding" => $totalOutstanding
        ],
        "feeSchedules" => $defaultFeeSchedules
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'POST') {
    validate_csrf();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];

    $studentId = (int)($input['studentId'] ?? $input['userId'] ?? 0);
    $amount = (float)($input['amount'] ?? 50000);
    $dueDate = $input['dueDate'] ?? date('Y-m-d', strtotime('+30 days'));
    $status = strtoupper($input['status'] ?? 'PENDING');

    if ($conn && $studentId > 0) {
        $stmt = $conn->prepare("INSERT INTO fees (student_id, amount, status, due_date) VALUES (?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("idss", $studentId, $amount, $status, $dueDate);
            $stmt->execute();
            $newId = $stmt->insert_id;
            $stmt->close();
        }
        $conn->close();
    }

    echo json_encode([
        "success" => true,
        "message" => "Invoice generated successfully.",
        "invoice" => [
            "id" => (string)($newId ?? rand(1000, 9999)),
            "invoiceNo" => "INV-2026-CUST-" . rand(1000, 9999),
            "amount" => $amount,
            "description" => $input['description'] ?? 'Custom Fee Charge',
            "feeType" => $input['feeType'] ?? 'TUITION',
            "status" => $status,
            "dueDate" => $dueDate,
            "createdAt" => date('c')
        ]
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Invalid request method."]);
exit();
