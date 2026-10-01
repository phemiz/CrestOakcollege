<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: {$origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit(0);
}

// Include DB config
$dbFile = '/home/crestoa2/domains/crestoakcollege.com.ng/public_html/api/admin/db.php';
$conn = false;

if (file_exists($dbFile)) {
    require_once $dbFile;
    if (function_exists('getDbConnection')) {
        $conn = @getDbConnection();
    }
}

// Read raw body stream properly
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput ?: '{}', true);

if (empty($input) || !is_array($input)) {
    $input = $_POST;
}

$username = trim($input['username'] ?? $input['email'] ?? $input['staff_id'] ?? $input['admin_id'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    http_response_code(400);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Username/Staff ID and Password are required.']);
    exit(0);
}

$userFound = null;

if ($conn && !$conn->connect_error) {
    $conn->set_charset('utf8mb4');

    // 1. Query users table (admin)
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1");
    if ($stmt) {
        $stmt->bind_param('ss', $username, $username);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res && $row = $res->fetch_assoc()) {
            if (!empty($row['password']) && password_verify($password, $row['password'])) {
                $userFound = $row;
                $userFound['role'] = $userFound['role'] ?? 'ADMIN';
            }
        }
        $stmt->close();
    }

    // 2. Query staff table
    if (!$userFound) {
        $stmt = $conn->prepare("SELECT * FROM staff WHERE username = ? OR email = ? OR staff_no = ? LIMIT 1");
        if ($stmt) {
            $stmt->bind_param('sss', $username, $username, $username);
            $stmt->execute();
            $res = $stmt->get_result();
            if ($res && $row = $res->fetch_assoc()) {
                if (!empty($row['password_hash']) && password_verify($password, $row['password_hash'])) {
                    $userFound = $row;
                    $userFound['role'] = $userFound['role'] ?? 'STAFF';
                }
            }
            $stmt->close();
        }
    }

    // 3. Query students table (was previously missing — root cause of student login failure)
    if (!$userFound) {
        $cleanIdentifier = strtolower(str_replace(['\\', '/'], '', trim($username)));
        $stmt = $conn->prepare("SELECT * FROM students WHERE (REPLACE(REPLACE(LOWER(matric_no), '\\\\', ''), '/', '') = ? OR LOWER(email) = ? OR LOWER(id) = ?) AND (isDeleted = 0 OR isDeleted IS NULL) LIMIT 1");
        if ($stmt) {
            $stmt->bind_param('sss', $cleanIdentifier, $cleanIdentifier, $cleanIdentifier);
            $stmt->execute();
            $res = $stmt->get_result();
            if ($res && $row = $res->fetch_assoc()) {
                $storedPass = $row['password_hash'] ?? $row['password'] ?? '';
                if (!empty($storedPass) && !empty($password) && password_verify($password, $storedPass)) {
                    $userFound = $row;
                    $userFound['role'] = 'STUDENT';
                }
            }
            $stmt->close();
        }
    }

    $conn->close();
}

if ($userFound) {
    require_once __DIR__ . '/api/auth/session.php';

    $role = strtoupper($userFound['role'] ?? 'ADMIN');
    create_session((int)($userFound['id'] ?? 0), $role);

    $redirectMap = [
        'STUDENT'    => '/portal/dashboard',
        'STAFF'      => '/staff/dashboard',
        'ADMIN'      => '/admin/dashboard',
        'BURSAR'     => '/bursary/dashboard',
        'BURSARY'    => '/bursary/dashboard',
        'REGISTRAR'  => '/registrar/dashboard',
        'SUPERADMIN' => '/superadmin/dashboard',
    ];
    $redirect = $redirectMap[$role] ?? '/admin/dashboard';

    $displayUsername = $userFound['username'] ?? $userFound['matric_no'] ?? $userFound['staff_no'] ?? 'admin1';

    http_response_code(200);
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'status' => 'success',
        'message' => 'Authentication successful.',
        'user' => [
            'id' => $userFound['id'] ?? 1,
            'username' => $displayUsername,
            'email' => $userFound['email'] ?? 'admin@crestoakcollege.com.ng',
            'name' => trim(($userFound['first_name'] ?? '') . ' ' . ($userFound['last_name'] ?? '')) ?: 'System Admin',
            'role' => $role,
        ],
        'redirect' => $redirect,
    ]);
    exit(0);
}

http_response_code(401);
ob_end_clean();
echo json_encode(['success' => false, 'message' => 'Invalid portal credentials.']);
exit(0);
