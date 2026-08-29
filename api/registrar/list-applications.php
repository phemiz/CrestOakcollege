<?php
error_reporting(0);
ini_set('display_errors', 0);
while (ob_get_level()) { ob_end_clean(); }
ob_start();
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params([
        'lifetime' => 86400 * 3,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

if (empty($_SESSION['registrar_authenticated']) || $_SESSION['registrar_authenticated'] !== true) {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => [], 'message' => 'You must be logged in as a registrar/admin to view applications.']);
    exit(0);
}
$role = strtoupper($_SESSION['user']['role'] ?? '');
if (!in_array($role, ['REGISTRAR', 'ADMIN', 'SUPERADMIN'], true)) {
    ob_end_clean();
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => [], 'message' => 'You do not have permission to view applications.']);
    exit(0);
}

require_once __DIR__ . '/../admin/db.php';
$conn = getDbConnection();
if (!$conn) {
    ob_end_clean();
    echo json_encode(['success' => false, 'data' => [], 'message' => 'Database connection failed.']);
    exit(0);
}
$conn->set_charset('utf8mb4');

$statusFilter = isset($_GET['status']) ? strtolower(trim($_GET['status'])) : '';
$validFilters = ['pending', 'approved', 'rejected'];

if (in_array($statusFilter, $validFilters, true)) {
    $stmt = $conn->prepare(
        "SELECT id, appNo, fullName, email, phone, faculty, course, status, dateSubmitted
         FROM Application WHERE LOWER(status) = ? ORDER BY dateSubmitted DESC"
    );
    $stmt->bind_param("s", $statusFilter);
    $stmt->execute();
    $res = $stmt->get_result();
} else {
    $res = $conn->query(
        "SELECT id, appNo, fullName, email, phone, faculty, course, status, dateSubmitted
         FROM Application ORDER BY dateSubmitted DESC"
    );
}

$applications = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $applications[] = $row;
    }
}

if (isset($stmt)) { $stmt->close(); }
$conn->close();

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'data' => $applications,
    'applications' => $applications
]);
exit(0);
