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

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$id = (int)($input['id'] ?? 0);
$status = strtoupper(trim($input['status'] ?? ''));

if ($status === 'APPROVED') {
    $status = 'ACCEPTED';
}

$validStatuses = ['ACCEPTED', 'REJECTED', 'PENDING'];

if (!$id || !in_array($status, $validStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Valid application ID and status (ACCEPTED/REJECTED/PENDING) required.']);
    exit;
}

$stmt = $conn->prepare("SELECT application_ref, applicant_name, email, status AS old_status FROM admissions WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$applicant = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$applicant) {
    echo json_encode(['success' => false, 'message' => 'Application not found.']);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("UPDATE admissions SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to update application status.']);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

$actorId = $_SESSION['user']['id'] ?? 'unknown';
$actorName = $_SESSION['user']['name'] ?? 'unknown';
$logStmt = $conn->prepare("INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, details, created_at) VALUES (?, ?, ?, 'admission', ?, ?, NOW())");
if ($logStmt) {
    $action = 'status_change';
    $details = "Status changed from {$applicant['old_status']} to {$status}";
    $logStmt->bind_param("sssis", $actorId, $actorName, $action, $id, $details);
    @$logStmt->execute();
    $logStmt->close();
}

$conn->close();

if (in_array($status, ['ACCEPTED', 'REJECTED'], true) && !empty($applicant['email'])) {
    send_admission_decision_email($applicant['email'], $applicant['applicant_name'], $applicant['application_ref'], $status);
}

echo json_encode(['success' => true, 'message' => "Application {$applicant['application_ref']} status updated to {$status}."]);

function send_admission_decision_email(string $toEmail, string $name, string $ref, string $status): void {
    $subject = $status === 'ACCEPTED'
        ? "CrestOak College - Admission Offer ({$ref})"
        : "CrestOak College - Application Update ({$ref})";

    if ($status === 'ACCEPTED') {
        $body = "Dear {$name},\n\n"
              . "Congratulations! You have been provisionally admitted to CrestOak College of Health Sciences, Management and Technology.\n\n"
              . "Application Reference: {$ref}\n\n"
              . "Please log in to the Application Status Checker on our website to view your admission letter and next steps for document verification and fee payment.\n\n"
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
