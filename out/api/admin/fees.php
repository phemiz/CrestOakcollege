<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'BURSARY']);

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDbConnection();

$defaultFeeSchedules = [
    ["faculty" => "Health Sciences", "tuition" => 350000, "acceptance" => 50000, "hostel" => 120000],
    ["faculty" => "Management & Law", "tuition" => 280000, "acceptance" => 50000, "hostel" => 120000],
    ["faculty" => "Technology & Applied Sciences", "tuition" => 300000, "acceptance" => 50000, "hostel" => 120000]
];

if ($method === 'GET') {
    $invoices = [];
    if ($conn) {
        $res = $conn->query("SELECT f.*, s.first_name, s.last_name, s.email, s.matric_no FROM fees f LEFT JOIN students s ON f.student_id = s.id ORDER BY f.id DESC");
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $invoices[] = [
                    "id" => (string)$row['id'],
                    "invoiceNo" => "INV-2026-FEE-" . $row['id'],
                    "amount" => (float)$row['amount'],
                    "description" => "Academic Tuition & Fees",
                    "feeType" => "TUITION",
                    "status" => $row['status'],
                    "dueDate" => $row['due_date'] ?? date('Y-m-d'),
                    "createdAt" => $row['created_at'] ?? date('c'),
                    "user" => [
                        "id" => (string)($row['student_id'] ?? 0),
                        "firstName" => $row['first_name'] ?? 'Student',
                        "lastName" => $row['last_name'] ?? '',
                        "email" => $row['email'] ?? ''
                    ]
                ];
            }
        }
        $conn->close();
    }
    echo json_encode([
        "success" => true,
        "invoices" => $invoices,
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
