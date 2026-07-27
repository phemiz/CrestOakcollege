<?php
// Prevent PHP warnings from polluting JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Safe CORS Header Handler (prevents duplicate headers)
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
    if (!isset($_SERVER['HTTP_ORIGIN'])) {
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // DirectAdmin MySQL Connection Credentials
    $host = 'localhost';
    $db   = 'crestoa2_crestoak_db';
    $user = 'crestoa2_crestoak_db';
    $pass = 'CrestOak2026!DB'; // MUST MATCH YOUR DIRECTADMIN DB PASSWORD EXACTLY

    // Suppress warning during connection attempt to handle via JSON
    $conn = @new mysqli($host, $user, $pass, $db);

    if ($conn->connect_error) {
        http_response_code(200); // Return 200 with success=false so frontend displays error safely
        echo json_encode([
            'success' => false, 
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]);
        exit();
    }

    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $contextRole = strtolower(trim($input['role'] ?? 'student'));

    if (empty($username) || empty($password)) {
        http_response_code(200);
        echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
        exit();
    }

    // Query user by username to allow flexible role variations
    $stmt = $conn->prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?");
    
    if (!$stmt) {
        http_response_code(200);
        echo json_encode(['success' => false, 'message' => 'Query error: ' . $conn->error]);
        exit();
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['password_hash'])) {
            if (session_status() === PHP_SESSION_NONE) {
                @session_start();
            }

            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['role'] = $row['role'];

            setcookie("cchsmt_session", session_id(), [
                'expires' => time() + 86400,
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            $dbRole = strtolower(trim($row['role']));
            
            // Correct redirect URLs matching Next.js static pages
            if (in_array($dbRole, ['admin', 'superadmin', 'super_admin', 'super admin'])) {
                $redirectUrl = '/admin/';
            } else if (in_array($dbRole, ['bursary'])) {
                $redirectUrl = '/bursary/';
            } else if (in_array($dbRole, ['staff', 'lecturer'])) {
                $redirectUrl = '/staff/';
            } else {
                $redirectUrl = '/portal/';
            }

            echo json_encode([
                'success' => true,
                'message' => 'Authentication successful.',
                'redirectUrl' => $redirectUrl,
                'user' => [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'role' => $row['role']
                ]
            ]);
            exit();
        }
    }

    http_response_code(200);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password for this portal.']);
    exit();

} catch (Throwable $e) {
    http_response_code(200);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit();
}
?>
