<?php
// Prevent PHP warnings from polluting JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Safe CORS & Credentials Header Handler
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Dynamic Subdomain Cookie Domain Resolution
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $cookieDomain = '';
    if (strpos($host, 'crestoakcollege.com.ng') !== false) {
        $cookieDomain = '.crestoakcollege.com.ng';
    }

    // Configure session cookie parameters BEFORE starting session
    if (session_status() === PHP_SESSION_NONE) {
        $sessionParams = [
            'lifetime' => 86400 * 7,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ];
        if (!empty($cookieDomain)) {
            $sessionParams['domain'] = $cookieDomain;
        }
        session_set_cookie_params($sessionParams);
        @session_start();
    }

    // DirectAdmin MySQL Connection Credentials
    $dbHost = 'localhost';
    $dbName = 'crestoa2_crestoak_db';
    $dbUser = 'crestoa2_crestoak_db';
    $dbPass = 'CrestOak2026!DB'; // MUST MATCH YOUR DIRECTADMIN DB PASSWORD EXACTLY

    // Suppress warning during connection attempt to handle via JSON
    $conn = @new mysqli($dbHost, $dbUser, $dbPass, $dbName);

    if ($conn->connect_error) {
        http_response_code(200);
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
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['role'] = $row['role'];

            // Set session HTTP-only cookie
            $cchsmtCookieOptions = [
                'expires' => time() + (86400 * 7),
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Lax'
            ];
            if (!empty($cookieDomain)) {
                $cchsmtCookieOptions['domain'] = $cookieDomain;
            }
            setcookie("cchsmt_session", session_id(), $cchsmtCookieOptions);

            // Set fallback client cookie crestoak_auth alongside $_SESSION
            $authCookieOptions = [
                'expires' => time() + (86400 * 7),
                'path' => '/',
                'secure' => true,
                'httponly' => false,
                'samesite' => 'Lax'
            ];
            if (!empty($cookieDomain)) {
                $authCookieOptions['domain'] = $cookieDomain;
            }
            setcookie("crestoak_auth", json_encode([
                'id' => $row['id'],
                'username' => $row['username'],
                'role' => $row['role'],
                'authenticated' => true
            ]), $authCookieOptions);

            $dbRole = strtolower(trim($row['role']));
            
            // Map dbRole to target portal URL
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
