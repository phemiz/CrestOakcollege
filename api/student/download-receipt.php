<?php
require_once __DIR__ . '/../admin/db.php';

$studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
$feeId = isset($_GET['fee_id']) ? (int)$_GET['fee_id'] : 0;

if (!$studentId) {
    die("Student ID required.");
}

$conn = getDbConnection();
if (!$conn) { die("Database connection failed."); }
$conn->set_charset('utf8mb4');

// Fetch student details
$stmt = $conn->prepare("SELECT first_name, last_name, email FROM students WHERE id = ?");
$stmt->bind_param("i", $studentId);
$stmt->execute();
$student = $stmt->get_result()->fetch_assoc();

// Fetch fee record
if ($feeId > 0) {
    $stmtFee = $conn->prepare("SELECT * FROM fees WHERE id = ? AND student_id = ?");
    $stmtFee->bind_param("ii", $feeId, $studentId);
} else {
    $stmtFee = $conn->prepare("SELECT * FROM fees WHERE student_id = ? AND status = 'PAID' ORDER BY id DESC LIMIT 1");
    $stmtFee->bind_param("i", $studentId);
}
$stmtFee->execute();
$fee = $stmtFee->get_result()->fetch_assoc();

if (!$fee || !$student) {
    die("Receipt record not found.");
}

$fullName = strtoupper($student['first_name'] . ' ' . $student['last_name']);
$receiptNo = "CCHMT-RCT-" . str_pad($fee['id'], 6, '0', STR_PAD_LEFT);
$amountFormatted = "NGN " . number_format($fee['amount'], 2);
$dateFormatted = date('M d, Y', strtotime($fee['created_at']));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Official Fee Receipt - <?php echo $receiptNo; ?></title>
    <style>
        body { font-family: 'Helvetica', Arial, sans-serif; background: #f4f6f9; padding: 20px; }
        .receipt-card { max-width: 650px; margin: 0 auto; background: #fff; padding: 30px; border: 1px solid #e1e8ed; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { color: #003366; margin: 0; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; color: #555; font-size: 13px; }
        .receipt-title { text-align: center; background: #eef4fc; color: #003366; font-weight: bold; padding: 8px; font-size: 14px; letter-spacing: 1px; margin-bottom: 20px; border-radius: 4px; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .details-table td { padding: 10px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .details-table td.label { font-weight: bold; color: #444; width: 40%; }
        .status-paid { color: #2e7d32; font-weight: bold; background: #e8f5e9; padding: 4px 8px; border-radius: 4px; }
        .footer { text-align: center; border-top: 1px solid #eee; padding-top: 15px; font-size: 12px; color: #888; }
        .btn-print { display: block; width: 100%; text-align: center; padding: 10px; background: #003366; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        @media print { .btn-print { display: none; } body { background: #fff; padding: 0; } }
    </style>
</head>
<body>
    <div class="receipt-card">
        <div class="header">
            <h1>CrestOak College</h1>
            <p>Office of the Bursar • Official Payment Slip</p>
        </div>
        <div class="receipt-title">OFFICIAL BURSARY RECEIPT</div>
        <table class="details-table">
            <tr><td class="label">Receipt Number:</td><td><strong><?php echo $receiptNo; ?></strong></td></tr>
            <tr><td class="label">Student Name:</td><td><?php echo $fullName; ?></td></tr>
            <tr><td class="label">Email Address:</td><td><?php echo $student['email']; ?></td></tr>
            <tr><td class="label">Amount Paid:</td><td><strong style="font-size:16px; color:#003366;"><?php echo $amountFormatted; ?></strong></td></tr>
            <tr><td class="label">Payment Date:</td><td><?php echo $dateFormatted; ?></td></tr>
            <tr><td class="label">Payment Status:</td><td><span class="status-paid"><?php echo strtoupper($fee['status']); ?></span></td></tr>
        </table>
        <div class="footer">
            <p>This is a computer-generated official receipt issued by CrestOak College Bursary.</p>
        </div>
        <a href="#" onclick="window.print(); return false;" class="btn-print">Print / Download PDF Receipt</a>
    </div>
</body>
</html>
<?php $conn->close(); ?>
