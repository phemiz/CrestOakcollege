<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

function findByToken(mysqli $conn, string $rawToken): ?array {
    $tokenHash = hash('sha256', $rawToken);
    foreach (['students', 'staff'] as $table) {
        $stmt = $conn->prepare("SELECT * FROM $table WHERE activation_token_hash = ? AND activation_expires_at > NOW() LIMIT 1");
        $stmt->bind_param("s", $tokenHash);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            $stmt->close();
            return ['table' => $table, 'row' => $row];
        }
        $stmt->close();
    }
    return null;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $token = $_GET['token'] ?? '';
    if ($token === '') {
        echo json_encode(['success' => false, 'message' => 'Missing activation token.']);
        exit();
    }

    $match = findByToken($conn, $token);
    if (!$match) {
        echo json_encode(['success' => false, 'message' => 'This activation link is invalid or has expired. Please contact your administrator for a new invite.']);
        exit();
    }

    $row = $match['row'];
    $idNumber = $match['table'] === 'students' ? ($row['matric_no'] ?? '') : ($row['staff_no'] ?? '');
    $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));

    echo json_encode([
        'success' => true,
        'idNumber' => $idNumber,
        'name' => $fullName,
        'role' => $match['table'] === 'students' ? 'student' : 'staff'
    ]);
    exit();
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];

    $token = trim($input['token'] ?? '');
    $password = trim($input['password'] ?? '');

    if ($token === '' || $password === '') {
        echo json_encode(['success' => false, 'message' => 'Token and password are required.']);
        exit();
    }
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
        exit();
    }

    $match = findByToken($conn, $token);
    if (!$match) {
        echo json_encode(['success' => false, 'message' => 'This activation link is invalid or has expired. Please contact your administrator for a new invite.']);
        exit();
    }

    $table = $match['table'];
    $id = $match['row']['id'];
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("UPDATE $table SET password_hash = ?, status = 'ACTIVE', activation_token_hash = NULL, activation_expires_at = NULL WHERE id = ?");
    $stmt->bind_param("si", $passwordHash, $id);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Account activated. You can now log in.']);
    exit();
}

$conn->close();
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
exit();
