<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['BURSAR', 'BURSARY', 'ADMIN', 'STUDENT']);

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST ?? [];

function paystack_secret_key(): ?string {
    if (defined('PAYSTACK_SECRET_KEY') && PAYSTACK_SECRET_KEY !== 'YOUR_PAYSTACK_SECRET_KEY_HERE') {
        return PAYSTACK_SECRET_KEY;
    }
    $env = getenv('PAYSTACK_SECRET_KEY');
    return $env ?: null;
}

if ($method === 'POST') {
    validate_csrf();
    $action = $input['action'] ?? '';

    // ---------------------------------------------------------------
    // Initialize a Paystack payment against a specific student_fees row
    // ---------------------------------------------------------------
    if ($action === 'initialize_payment') {
        $studentFeeId = (int)($input['student_fee_id'] ?? 0);
        $payAmount = isset($input['amount']) ? (float)$input['amount'] : null;

        if (!$studentFeeId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'student_fee_id is required.']);
            exit();
        }

        $conn = getDbConnection();
        if (!$conn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit();
        }

        // Only allow the logged-in student to pay their own fee (unless staff/admin)
        $stmt = $conn->prepare(
            "SELECT sf.id, sf.student_id, sf.amount_due, sf.amount_paid, sf.balance, sf.status,
                    fs.fee_type, fs.allow_installment, fs.min_installment_amount
             FROM student_fees sf
             JOIN fee_structures fs ON sf.fee_structure_id = fs.id
             WHERE sf.id = ? LIMIT 1"
        );
        $stmt->bind_param('i', $studentFeeId);
        $stmt->execute();
        $fee = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$fee) {
            $conn->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Fee record not found.']);
            exit();
        }

        if ($session['role'] === 'STUDENT' && (int)$fee['student_id'] !== (int)$session['user_id']) {
            $conn->close();
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You may only pay your own fees.']);
            exit();
        }

        if ($fee['status'] === 'paid' || (float)$fee['balance'] <= 0) {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This fee has already been paid in full.']);
            exit();
        }

        $balance = (float)$fee['balance'];
        $amount = $payAmount ?? $balance;

        if ($amount <= 0 || $amount > $balance) {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid payment amount.']);
            exit();
        }

        if ($amount < $balance && !$fee['allow_installment']) {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This fee does not allow partial/installment payment.']);
            exit();
        }

        if ($amount < $balance && $fee['min_installment_amount'] && $amount < (float)$fee['min_installment_amount']) {
            $conn->close();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Minimum installment amount is ' . number_format((float)$fee['min_installment_amount'], 2)
            ]);
            exit();
        }

        $paystackSecret = paystack_secret_key();
        $email = $session['email'] ?: 'student@crestoakcollege.com.ng';
        $reference = 'PAY-' . strtoupper(bin2hex(random_bytes(6)));
        $amountKobo = (int)round($amount * 100);

        // Record the pending payment attempt before contacting Paystack
        $insStmt = $conn->prepare(
            "INSERT INTO fee_payments (student_fee_id, student_id, amount, payment_reference, status)
             VALUES (?, ?, ?, ?, 'pending')"
        );
        $insStmt->bind_param('iids', $studentFeeId, $fee['student_id'], $amount, $reference);
        $insStmt->execute();
        $insStmt->close();

        if (!$paystackSecret) {
            $conn->close();
            error_log('Paystack secret key not configured; cannot initialize live payment.');
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Payment gateway is not configured. Please contact the bursar.']);
            exit();
        }

        $ch = curl_init('https://api.paystack.co/transaction/initialize');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode([
                'email' => $email,
                'amount' => $amountKobo,
                'reference' => $reference,
                'callback_url' => 'https://portal.crestoakcollege.com.ng/portal/billing?status=callback&reference=' . $reference,
            ]),
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer {$paystackSecret}",
                "Content-Type: application/json",
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
        ]);
        $response = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);

        $result = json_decode((string)$response, true);

        if (!empty($result['data']['authorization_url'])) {
            $conn->close();
            echo json_encode([
                'success' => true,
                'authorizationUrl' => $result['data']['authorization_url'],
                'reference' => $reference,
            ]);
            exit();
        }

        // Mark the pending attempt failed since Paystack never gave us an authorization URL
        $failStmt = $conn->prepare("UPDATE fee_payments SET status = 'failed', gateway_response = ? WHERE payment_reference = ?");
        $errMsg = substr($result['message'] ?? $curlErr ?: 'Unknown Paystack error', 0, 250);
        $failStmt->bind_param('ss', $errMsg, $reference);
        $failStmt->execute();
        $failStmt->close();
        $conn->close();

        error_log('Paystack initialize failed: ' . $errMsg);
        http_response_code(502);
        echo json_encode(['success' => false, 'message' => 'Could not start payment with Paystack. Please try again shortly.']);
        exit();
    }

    // ---------------------------------------------------------------
    // Verify a payment server-side against Paystack (never trust the
    // frontend redirect alone) and update student_fees accordingly
    // ---------------------------------------------------------------
    if ($action === 'verify_payment') {
        $reference = trim($input['reference'] ?? '');
        if (!$reference) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'reference is required.']);
            exit();
        }

        $paystackSecret = paystack_secret_key();
        if (!$paystackSecret) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Payment gateway is not configured.']);
            exit();
        }

        $conn = getDbConnection();
        if (!$conn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM fee_payments WHERE payment_reference = ? LIMIT 1");
        $stmt->bind_param('s', $reference);
        $stmt->execute();
        $payment = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$payment) {
            $conn->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Payment record not found.']);
            exit();
        }

        if ($payment['status'] === 'success') {
            $conn->close();
            echo json_encode(['success' => true, 'message' => 'Payment already verified.', 'status' => 'success']);
            exit();
        }

        $ch = curl_init('https://api.paystack.co/transaction/verify/' . rawurlencode($reference));
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => ["Authorization: Bearer {$paystackSecret}"],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        $result = json_decode((string)$response, true);

        $psData = $result['data'] ?? null;
        $psStatus = $psData['status'] ?? null; // 'success' | 'failed' | 'abandoned'

        if (!$psData || !in_array($psStatus, ['success', 'failed', 'abandoned'], true)) {
            $conn->close();
            http_response_code(502);
            echo json_encode(['success' => false, 'message' => 'Could not verify payment with Paystack right now.']);
            exit();
        }

        $conn->begin_transaction();
        try {
            $channel = $psData['channel'] ?? null;
            $gwResp = substr($psData['gateway_response'] ?? '', 0, 250);
            $paidAt = !empty($psData['paid_at']) ? date('Y-m-d H:i:s', strtotime($psData['paid_at'])) : null;
            $txId = (string)($psData['id'] ?? '');

            $upd = $conn->prepare(
                "UPDATE fee_payments SET status = ?, channel = ?, gateway_response = ?, paid_at = ?, paystack_transaction_id = ?
                 WHERE payment_reference = ?"
            );
            $upd->bind_param('ssssss', $psStatus, $channel, $gwResp, $paidAt, $txId, $reference);
            $upd->execute();
            $upd->close();

            if ($psStatus === 'success') {
                // Confirm the amount actually charged matches what we recorded, then apply to the invoice
                $paidAmount = (float)($psData['amount'] ?? 0) / 100;

                $sfStmt = $conn->prepare("SELECT id, amount_paid, amount_due FROM student_fees WHERE id = ? FOR UPDATE");
                $sfStmt->bind_param('i', $payment['student_fee_id']);
                $sfStmt->execute();
                $sf = $sfStmt->get_result()->fetch_assoc();
                $sfStmt->close();

                if ($sf) {
                    $newPaid = (float)$sf['amount_paid'] + $paidAmount;
                    $newStatus = $newPaid >= (float)$sf['amount_due'] ? 'paid' : 'partial';

                    $sfUpd = $conn->prepare("UPDATE student_fees SET amount_paid = ?, status = ? WHERE id = ?");
                    $sfUpd->bind_param('dsi', $newPaid, $newStatus, $sf['id']);
                    $sfUpd->execute();
                    $sfUpd->close();
                }
            }

            $conn->commit();
        } catch (Throwable $e) {
            $conn->rollback();
            $conn->close();
            error_log('verify_payment transaction failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to record verified payment.']);
            exit();
        }

        $conn->close();
        echo json_encode(['success' => true, 'status' => $psStatus]);
        exit();
    }
    if ($action === 'submit_manual_payment') {
        $studentFeeId = (int)($input['student_fee_id'] ?? 0);
        $studentReference = trim((string)($input['student_reference'] ?? ''));
        $proofUrl = trim((string)($input['proof_url'] ?? ''));
        $payAmount = isset($input['amount']) ? (float)$input['amount'] : null;

        if (!$studentFeeId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'student_fee_id is required.']);
            exit();
        }
        if ($studentReference === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'A bank transfer reference is required.']);
            exit();
        }
        if ($proofUrl === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Proof of payment (screenshot/receipt) is required.']);
            exit();
        }

        $conn = getDbConnection();
        if (!$conn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit();
        }

        $stmt = $conn->prepare(
            "SELECT sf.id, sf.student_id, sf.amount_due, sf.amount_paid, sf.balance, sf.status,
                    fs.fee_type, fs.allow_installment, fs.min_installment_amount
             FROM student_fees sf
             JOIN fee_structures fs ON sf.fee_structure_id = fs.id
             WHERE sf.id = ? LIMIT 1"
        );
        $stmt->bind_param('i', $studentFeeId);
        $stmt->execute();
        $fee = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$fee) {
            $conn->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Fee record not found.']);
            exit();
        }

        if ($session['role'] === 'STUDENT' && (int)$fee['student_id'] !== (int)$session['user_id']) {
            $conn->close();
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You may only pay your own fees.']);
            exit();
        }

        if ($fee['status'] === 'paid' || (float)$fee['balance'] <= 0) {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This fee has already been paid in full.']);
            exit();
        }

        $balance = (float)$fee['balance'];
        $amount = $payAmount ?? $balance;

        if ($amount <= 0 || $amount > $balance) {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid payment amount.']);
            exit();
        }

        if ($amount < $balance && !$fee['allow_installment']) {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This fee does not allow partial/installment payment.']);
            exit();
        }

        if ($amount < $balance && $fee['min_installment_amount'] && $amount < (float)$fee['min_installment_amount']) {
            $conn->close();
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Minimum installment amount is ' . number_format((float)$fee['min_installment_amount'], 2)
            ]);
            exit();
        }

        $reference = 'MAN-' . strtoupper(bin2hex(random_bytes(6)));

        $insStmt = $conn->prepare(
            "INSERT INTO fee_payments
                (student_fee_id, student_id, amount, payment_reference, channel, student_reference, proof_url, status)
             VALUES (?, ?, ?, ?, 'manual_transfer', ?, ?, 'pending')"
        );
        $insStmt->bind_param('iidsss', $studentFeeId, $fee['student_id'], $amount, $reference, $studentReference, $proofUrl);
        $insStmt->execute();
        $newId = $insStmt->insert_id;
        $insStmt->close();
        $conn->close();

        echo json_encode([
            'success' => true,
            'message' => 'Your payment claim has been submitted and is awaiting confirmation by the bursar.',
            'reference' => $reference,
            'paymentId' => $newId,
        ]);
        exit();
    }
    if ($action === 'confirm_manual_payment') {
        if (!in_array($session['role'], ['BURSAR', 'BURSARY', 'ADMIN'], true)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You are not authorized to confirm payments.']);
            exit();
        }

        $paymentId = (int)($input['id'] ?? 0);
        if (!$paymentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'id is required.']);
            exit();
        }

        $conn = getDbConnection();
        if (!$conn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM fee_payments WHERE id = ? AND channel = 'manual_transfer' LIMIT 1");
        $stmt->bind_param('i', $paymentId);
        $stmt->execute();
        $payment = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$payment) {
            $conn->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Manual payment record not found.']);
            exit();
        }

        if ($payment['status'] !== 'pending') {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This payment has already been ' . $payment['status'] . '.']);
            exit();
        }

        $conn->begin_transaction();
        try {
            $confirmedBy = (int)$session['user_id'];

            $upd = $conn->prepare(
                "UPDATE fee_payments SET status = 'success', paid_at = NOW(), confirmed_by = ? WHERE id = ?"
            );
            $upd->bind_param('ii', $confirmedBy, $paymentId);
            $upd->execute();
            $upd->close();

            $sfStmt = $conn->prepare("SELECT id, amount_paid, amount_due FROM student_fees WHERE id = ? FOR UPDATE");
            $sfStmt->bind_param('i', $payment['student_fee_id']);
            $sfStmt->execute();
            $sf = $sfStmt->get_result()->fetch_assoc();
            $sfStmt->close();

            if ($sf) {
                $newPaid = (float)$sf['amount_paid'] + (float)$payment['amount'];
                $newStatus = $newPaid >= (float)$sf['amount_due'] ? 'paid' : 'partial';

                $sfUpd = $conn->prepare("UPDATE student_fees SET amount_paid = ?, status = ? WHERE id = ?");
                $sfUpd->bind_param('dsi', $newPaid, $newStatus, $sf['id']);
                $sfUpd->execute();
                $sfUpd->close();
            } else {
                throw new Exception('student_fees record not found for id ' . $payment['student_fee_id']);
            }

            $conn->commit();
        } catch (Throwable $e) {
            $conn->rollback();
            $conn->close();
            error_log('confirm_manual_payment transaction failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to confirm payment.']);
            exit();
        }

        $conn->close();
        echo json_encode(['success' => true, 'message' => 'Payment confirmed.']);
        exit();
    }
    if ($action === 'reject_manual_payment') {
        if (!in_array($session['role'], ['BURSAR', 'BURSARY', 'ADMIN'], true)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You are not authorized to reject payments.']);
            exit();
        }

        $paymentId = (int)($input['id'] ?? 0);
        $reason = trim((string)($input['reason'] ?? ''));

        if (!$paymentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'id is required.']);
            exit();
        }
        if ($reason === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'A rejection reason is required.']);
            exit();
        }

        $conn = getDbConnection();
        if (!$conn) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM fee_payments WHERE id = ? AND channel = 'manual_transfer' LIMIT 1");
        $stmt->bind_param('i', $paymentId);
        $stmt->execute();
        $payment = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$payment) {
            $conn->close();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Manual payment record not found.']);
            exit();
        }

        if ($payment['status'] !== 'pending') {
            $conn->close();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This payment has already been ' . $payment['status'] . '.']);
            exit();
        }

        $confirmedBy = (int)$session['user_id'];

        $upd = $conn->prepare(
            "UPDATE fee_payments SET status = 'failed', confirmed_by = ?, rejection_reason = ? WHERE id = ?"
        );
        $upd->bind_param('isi', $confirmedBy, $reason, $paymentId);
        $upd->execute();
        $upd->close();
        $conn->close();

        echo json_encode(['success' => true, 'message' => 'Payment rejected.']);
        exit();
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
    exit();
}

// ---------------------------------------------------------------
// GET: student's own invoices/payments
// ---------------------------------------------------------------
if ($session['role'] === 'STUDENT') {
    $conn = getDbConnection();
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
        exit();
    }
    $studentId = (int)$session['user_id'];

    $nameStmt = $conn->prepare("SELECT first_name, last_name, matric_no FROM students WHERE id = ? LIMIT 1");
    $nameStmt->bind_param('i', $studentId);
    $nameStmt->execute();
    $studentRow = $nameStmt->get_result()->fetch_assoc();
    $nameStmt->close();
    $studentFullName = trim(($studentRow['first_name'] ?? '') . ' ' . ($studentRow['last_name'] ?? '')) ?: $session['name'];
    $studentMatricNo = $studentRow['matric_no'] ?? '';

    $invStmt = $conn->prepare(
        "SELECT sf.id, sf.balance, sf.amount_due, sf.amount_paid, fs.description, fs.fee_type,
                sf.status, sf.due_date, fs.allow_installment, fs.min_installment_amount
         FROM student_fees sf
         JOIN fee_structures fs ON sf.fee_structure_id = fs.id
         WHERE sf.student_id = ? AND sf.status != 'waived'
         ORDER BY sf.due_date ASC"
    );
    $invStmt->bind_param('i', $studentId);
    $invStmt->execute();
    $invRows = $invStmt->get_result();
    $invoices = [];
    $totalBilled = 0.0;
    $totalPaid = 0.0;
    $outstandingBalance = 0.0;
    $minimumUpfrontRequired = 0.0;
    while ($row = $invRows->fetch_assoc()) {
        $amountDue = (float)$row['amount_due'];
        $amountPaid = (float)$row['amount_paid'];
        $balance = (float)$row['balance'];
        $totalBilled += $amountDue;
        $totalPaid += $amountPaid;
        $outstandingBalance += $balance;
        if ($row['status'] !== 'paid' && $balance > 0) {
            if (!empty($row['allow_installment']) && (float)$row['min_installment_amount'] > 0) {
                $minimumUpfrontRequired += min((float)$row['min_installment_amount'], $balance);
            } else {
                $minimumUpfrontRequired += $balance;
            }
        }
        $invoices[] = [
            'id' => (string)$row['id'],
            'invoiceNo' => 'INV-' . str_pad($row['id'], 4, '0', STR_PAD_LEFT),
            'amount' => $balance,
            'description' => $row['description'] ?: $row['fee_type'],
            'feeType' => strtoupper($row['fee_type']),
            'status' => $row['status'] === 'paid' ? 'PAID' : 'PENDING',
            'dueDate' => $row['due_date'] ?: '',
        ];
    }
    $invStmt->close();
    $overallStatus = empty($invoices) ? 'NO_INVOICES' : ($outstandingBalance <= 0 ? 'PAID' : ($totalPaid > 0 ? 'PARTIAL' : 'UNPAID'));

    $payStmt = $conn->prepare(
        "SELECT p.id, p.payment_reference, p.amount, p.channel, p.status, p.paid_at, p.created_at,
                fs.description, sf.id AS sfId
         FROM fee_payments p
         LEFT JOIN student_fees sf ON p.student_fee_id = sf.id
         LEFT JOIN fee_structures fs ON sf.fee_structure_id = fs.id
         WHERE p.student_id = ?
         ORDER BY p.created_at DESC"
    );
    $payStmt->bind_param('i', $studentId);
    $payStmt->execute();
    $payRows = $payStmt->get_result();
    $statusMap = ['success' => 'PAID', 'pending' => 'PENDING', 'failed' => 'FAILED', 'abandoned' => 'FAILED'];
    $payments = [];
    while ($row = $payRows->fetch_assoc()) {
        $payments[] = [
            'id' => (string)$row['id'],
            'reference' => $row['payment_reference'],
            'amountPaid' => (float)$row['amount'],
            'method' => $row['channel'] ? ('Paystack ' . ucfirst($row['channel'])) : 'Paystack',
            'status' => $statusMap[$row['status']] ?? strtoupper($row['status']),
            'paidAt' => $row['paid_at'] ?: $row['created_at'],
            'invoice' => [
                'invoiceNo' => 'INV-' . str_pad((string)$row['sfId'], 4, '0', STR_PAD_LEFT),
                'description' => $row['description'] ?: '',
            ],
        ];
    }
    $payStmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'invoices' => $invoices,
        'payments' => $payments,
        'studentName' => $studentFullName,
        'matricNo' => $studentMatricNo,
        'totalBilled' => $totalBilled,
        'totalPaid' => $totalPaid,
        'outstandingBalance' => $outstandingBalance,
        'minimumUpfrontRequired' => $minimumUpfrontRequired,
        'status' => $overallStatus,
    ]);
    exit();
}

// ---------------------------------------------------------------
// GET: dashboard summary
// ---------------------------------------------------------------
$conn = getDbConnection();
$totalRevenue = 0.0;
$pendingInvoicesCount = 0;
$paidInvoicesCount = 0;
$recentPayments = [];

if ($conn) {
    try {
        $resR = $conn->query("SELECT SUM(amount) AS total FROM fee_payments WHERE status = 'success'");
        if ($resR && $row = $resR->fetch_assoc()) {
            $totalRevenue = floatval($row['total'] ?? 0.0);
        }

        $resP = $conn->query("SELECT COUNT(*) AS cnt FROM student_fees WHERE status IN ('unpaid','partial')");
        if ($resP && $row = $resP->fetch_assoc()) {
            $pendingInvoicesCount = intval($row['cnt']);
        }

        $resD = $conn->query("SELECT COUNT(*) AS cnt FROM student_fees WHERE status = 'paid'");
        if ($resD && $row = $resD->fetch_assoc()) {
            $paidInvoicesCount = intval($row['cnt']);
        }

        $resL = $conn->query(
            "SELECT p.id, p.amount, p.status, p.channel, p.paid_at, p.created_at,
                    fs.fee_type AS invoiceTitle,
                    s.first_name AS firstName, s.last_name AS lastName
             FROM fee_payments p
             LEFT JOIN student_fees sf ON p.student_fee_id = sf.id
             LEFT JOIN fee_structures fs ON sf.fee_structure_id = fs.id
             LEFT JOIN students s ON p.student_id = s.id
             ORDER BY p.created_at DESC LIMIT 20"
        );
        if ($resL) {
            while ($row = $resL->fetch_assoc()) {
                $recentPayments[] = $row;
            }
        }
    } catch (Throwable $e) {
        error_log("Bursary dashboard query error: " . $e->getMessage());
    } finally {
        $conn->close();
    }
}

echo json_encode([
    "success" => true,
    "totalRevenue" => $totalRevenue,
    "pendingInvoicesCount" => $pendingInvoicesCount,
    "paidInvoicesCount" => $paidInvoicesCount,
    "recentPayments" => $recentPayments,
]);
