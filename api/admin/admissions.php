<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN']);

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection unavailable.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $apps = [];
    $res = $conn->query("SELECT * FROM Application ORDER BY id DESC");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $apps[] = [
                'id' => (string)$row['id'],
                'applicationId' => (string)$row['id'],
                'appNo' => $row['appNo'] ?? '',
                'applicant_name' => $row['fullName'] ?? '',
                'fullName' => $row['fullName'] ?? '',
                'email' => $row['email'] ?? '',
                'phone' => $row['phone'] ?? '',
                'program_applied' => $row['course'] ?? '',
                'programme' => $row['course'] ?? '',
                'faculty' => $row['faculty'] ?? '',
                'status' => $row['status'] ?? 'pending',
                'created_at' => $row['dateSubmitted'] ?? ''
            ];
        }
    }
    $conn->close();
    echo json_encode([
        'success' => true,
        'applications' => $apps,
        'total' => count($apps)
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    validate_csrf();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];

    $appId = (int)($input['applicationId'] ?? $input['id'] ?? 0);
    $rawStatus = strtolower(trim($input['decision'] ?? $input['status'] ?? 'approved'));
    if (in_array($rawStatus, ['accepted', 'approve', 'approved'], true)) {
        $status = 'approved';
    } elseif (in_array($rawStatus, ['reject', 'rejected', 'declined'], true)) {
        $status = 'rejected';
    } else {
        $status = 'pending';
    }

    if ($appId <= 0) {
        $conn->close();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid application ID.']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE Application SET status = ? WHERE id = ?");
    if ($stmt) {
        $stmt->bind_param("si", $status, $appId);
        $stmt->execute();
        $stmt->close();
    }
    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'Application status updated to ' . $status,
        'applicationId' => (string)$appId,
        'status' => $status
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

$conn->close();
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
exit();
