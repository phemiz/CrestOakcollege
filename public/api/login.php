<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$db   = 'crestoa2_crestoak_db';
$user = 'crestoa2_crestoak_db';
$pass = 'Tvr2Rv6...'; // Ensure your full DirectAdmin password from image_af5b63.png is here

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$contextRole = trim($input['role'] ?? 'student');

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit();
}

$stmt = $conn->prepare("SELECT id, username, password_hash, role FROM users WHERE username = ? AND role = ?");
$stmt->bind_param("ss", $username, $contextRole);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password_hash'])) {
        setcookie("cchsmt_session", session_id(), [
            'expires' => time() + 86400,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        $redirectUrl = '/portal/';
        if ($row['role'] === 'admin') $redirectUrl = '/admin/dashboard/';
        if ($row['role'] === 'bursary') $redirectUrl = '/bursary/';

        echo json_encode([
            'success' => true,
            'message' => 'Authentication successful.',
            'redirectUrl' => $redirectUrl,
            'user' => [
                'username' => $row['username'],
                'role' => $row['role']
            ]
        ]);
        exit();
    }
}

http_response_code(401);
echo json_encode(['success' => false, 'message' => 'Invalid username or password for this portal.']);
?>
