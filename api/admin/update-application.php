<?php
http_response_code(200);
header('Content-Type: application/json');

require_once __DIR__ . '/../registrar_auth.php';

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (empty($_SESSION['registrar_authenticated']) || $_SESSION['registrar_authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'You must be logged in as a registrar/admin to update application status.']);
    exit();
}
$role = strtoupper($_SESSION['user']['role'] ?? '');
if (!in_array($role, ['REGISTRAR', 'ADMIN', 'SUPERADMIN'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You do not have permission to update application status.']);
    exit();
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../includes/mailer.php';
require_once __DIR__ . '/../includes/matric.php';

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$id = (int)($input['id'] ?? 0);
$rawStatus = strtolower(trim($input['status'] ?? ''));

if (in_array($rawStatus, ['approved', 'accepted', 'approve'], true)) {
    $status = 'approved';
} elseif (in_array($rawStatus, ['rejected', 'reject', 'declined'], true)) {
    $status = 'rejected';
} elseif ($rawStatus === 'pending') {
    $status = 'pending';
} else {
    $status = '';
}

$validStatuses = ['approved', 'rejected', 'pending'];

if (!$id || !in_array($status, $validStatuses, true)) {
    echo json_encode(['success' => false, 'message' => 'Valid application ID and status (approved/rejected/pending) required.']);
    exit;
}

$stmt = $conn->prepare("SELECT appNo AS application_ref, fullName AS applicant_name, email, phone, faculty, course, status AS old_status FROM Application WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$applicant = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$applicant) {
    echo json_encode(['success' => false, 'message' => 'Application not found.']);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("UPDATE Application SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to update application status.']);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

$actorId = $_SESSION['user']['id'] ?? null;
$actorIdNum = is_numeric($actorId) ? (int)$actorId : null;
$actorName = $_SESSION['user']['name'] ?? 'unknown';
$action = 'status_change';
$details = "Status changed from {$applicant['old_status']} to {$status} by {$actorName}";
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
try {
    $logStmt = $conn->prepare("INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())");
    if ($logStmt) {
        $logStmt->bind_param("isss", $actorIdNum, $action, $details, $ipAddress);
        $logStmt->execute();
        $logStmt->close();
    }
} catch (Throwable $e) {
    error_log("Audit log insert failed: " . $e->getMessage());
}

$studentCredentials = null;

if ($status === 'approved' && !empty($applicant['email'])) {
    $studentCredentials = create_or_activate_student_account($conn, $id, $applicant);
    send_admission_decision_email($applicant['email'], $applicant['applicant_name'], $applicant['application_ref'], $status);
}

if ($status === 'rejected' && !empty($applicant['email'])) {
    send_admission_decision_email($applicant['email'], $applicant['applicant_name'], $applicant['application_ref'], $status);
}

$conn->close();

echo json_encode([
    'success' => true,
    'message' => "Application {$applicant['application_ref']} status updated to {$status}." .
        ($studentCredentials ? " Student account created ({$studentCredentials['matricNo']})." : "")
]);

/**
 * Creates a new student account for an approved applicant (or skips if one
 * already exists for this application/email), generates a temp password,
 * flags force_password_change, and emails the credentials via the existing
 * working SMTP mailer. Returns the new credentials array, or null if a
 * student already existed / creation failed.
 */
function create_or_activate_student_account(mysqli $conn, int $applicationId, array $applicant): ?array {
    $check = $conn->prepare("SELECT id, matric_no FROM students WHERE application_id = ? LIMIT 1");
    $check->bind_param("i", $applicationId);
    $check->execute();
    $existing = $check->get_result()->fetch_assoc();
    $check->close();
    if ($existing) {
        error_log("create_or_activate_student_account: skipped — student already exists for application_id={$applicationId} (existing matric_no={$existing['matric_no']})");
        return null;
    }

    $nameParts = preg_split('/\s+/', trim($applicant['applicant_name']), 2);
    $firstName = $nameParts[0] ?? 'Student';
    $lastName = $nameParts[1] ?? '';

    $facultyMap = [
        'nursing' => 'Department of Nursing Sciences',
        'medical laboratory' => 'Department of Medical Laboratory Science',
        'community health' => 'Department of Community Health Sciences',
        'business' => 'Department of Business Administration',
        'computer' => 'Department of Computer Science & IT',
    ];
    $deptCodeMap = [
        'Department of Nursing Sciences' => 'NUR',
        'Department of Medical Laboratory Science' => 'MLS',
        'Department of Community Health Sciences' => 'CHEW',
        'Department of Business Administration' => 'BUS',
        'Department of Computer Science & IT' => 'CSC',
    ];
    $rawFaculty = strtolower($applicant['faculty'] ?? '');
    $departmentName = $applicant['faculty'] ?: 'General Studies';
    foreach ($facultyMap as $needle => $mapped) {
        if (str_contains($rawFaculty, $needle)) {
            $departmentName = $mapped;
            break;
        }
    }
    $deptCode = $deptCodeMap[$departmentName] ?? 'GEN';

    $matricNo = get_next_matric_number($conn, $deptCode);

    $tempPassword = generate_temp_password();
    $passwordHash = password_hash($tempPassword, PASSWORD_BCRYPT);

    $stmt = $conn->prepare(
        "INSERT INTO students (first_name, last_name, email, phone_number, matric_no, password_hash, department_name, level, isDeleted, force_password_change, application_id, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 100, 0, 1, ?, 'pending')"
    );
    if (!$stmt) {
        error_log('create_or_activate_student_account prepare failed: ' . $conn->error);
        return null;
    }
    $stmt->bind_param(
        "sssssssi",
        $firstName,
        $lastName,
        $applicant['email'],
        $applicant['phone'],
        $matricNo,
        $passwordHash,
        $departmentName,
        $applicationId
    );

    try {
        $stmt->execute();
    } catch (mysqli_sql_exception $e) {
        $stmt->close();
        error_log('create_or_activate_student_account INSERT error: ' . $e->getMessage());
        return null;
    }
    $stmt->close();

    $mailSent = sendWelcomeEmail($applicant['email'], $applicant['applicant_name'], $matricNo, 'STUDENT', $tempPassword);
    if (!$mailSent) {
        error_log('Approval welcome email failed to send for: ' . $applicant['email']);
    }

    return ['matricNo' => $matricNo, 'tempPassword' => $tempPassword];
}

function generate_temp_password(): string {
    $words = ['Crest', 'Oak', 'Scholar', 'Bright', 'Rise', 'Learn'];
    $word = $words[array_rand($words)];
    return $word . random_int(1000, 9999) . '!';
}

function send_admission_decision_email(string $toEmail, string $name, string $ref, string $status): void {
    $subject = "CrestOak College - Application Update ({$ref})";

    if ($status === 'approved') {
        $body = "Dear {$name},\n\n"
              . "Congratulations! We are pleased to inform you that your application to CrestOak College of Health Sciences, Management and Technology has been APPROVED.\n\n"
              . "Application Reference: {$ref}\n\n"
              . "You will receive a separate email shortly with your Student Portal login details.\n\n"
              . "We look forward to welcoming you to CrestOak College.\n\n"
              . "Regards,\nCrestOak College Admissions Office";
    } else {
        $body = "Dear {$name},\n\n"
              . "Thank you for your interest in CrestOak College of Health Sciences, Management and Technology.\n\n"
              . "After careful review, we regret to inform you that we are unable to offer you admission this session.\n\n"
              . "Application Reference: {$ref}\n\n"
              . "We wish you the best in your future academic pursuits.\n\n"
              . "Regards,\nCrestOak College Admissions Office";
    }

    $headers = "From: CrestOak College Admissions <" . (defined('SMTP_CONFIG_USER') ? SMTP_CONFIG_USER : 'info@crestoakcollege.com.ng') . ">\r\n";
    @mail($toEmail, $subject, $body, $headers);
}