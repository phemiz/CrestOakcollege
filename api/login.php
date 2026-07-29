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
    $dbPass = 'CrestOak2026!DB';

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

    // 1. Dynamic Table Creation & Schema Alteration Safeguards
    @$conn->query("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(150),
        password_hash VARCHAR(255),
        role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    @$conn->query("CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(64) PRIMARY KEY,
        staff_id VARCHAR(64),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        middle_name VARCHAR(100),
        username VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(50),
        role VARCHAR(50),
        department VARCHAR(150),
        designation VARCHAR(150),
        academic_rank VARCHAR(100),
        specialization VARCHAR(255),
        password_hash VARCHAR(255),
        joining_date DATE,
        isDeleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Inspect columns for `users` table & auto-add missing columns
    $usersColsRes = @$conn->query("SHOW COLUMNS FROM `users`");
    $usersCols = [];
    if ($usersColsRes) {
        while ($c = $usersColsRes->fetch_assoc()) {
            $usersCols[] = $c['Field'];
        }
    }
    if (!in_array('email', $usersCols)) {
        @$conn->query("ALTER TABLE users ADD COLUMN email VARCHAR(150)");
        $usersCols[] = 'email';
    }
    if (!in_array('username', $usersCols)) {
        @$conn->query("ALTER TABLE users ADD COLUMN username VARCHAR(100)");
        $usersCols[] = 'username';
    }
    if (!in_array('password_hash', $usersCols)) {
        @$conn->query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)");
        $usersCols[] = 'password_hash';
    }
    if (!in_array('role', $usersCols)) {
        @$conn->query("ALTER TABLE users ADD COLUMN role VARCHAR(50)");
        $usersCols[] = 'role';
    }

    // Inspect columns for `staff` table & auto-add missing columns
    $staffColsRes = @$conn->query("SHOW COLUMNS FROM `staff`");
    $staffCols = [];
    if ($staffColsRes) {
        while ($c = $staffColsRes->fetch_assoc()) {
            $staffCols[] = $c['Field'];
        }
    }
    if (!in_array('email', $staffCols)) {
        @$conn->query("ALTER TABLE staff ADD COLUMN email VARCHAR(150)");
        $staffCols[] = 'email';
    }
    if (!in_array('username', $staffCols)) {
        @$conn->query("ALTER TABLE staff ADD COLUMN username VARCHAR(100)");
        $staffCols[] = 'username';
    }
    if (!in_array('staff_id', $staffCols)) {
        @$conn->query("ALTER TABLE staff ADD COLUMN staff_id VARCHAR(64)");
        $staffCols[] = 'staff_id';
    }
    if (!in_array('password_hash', $staffCols)) {
        @$conn->query("ALTER TABLE staff ADD COLUMN password_hash VARCHAR(255)");
        $staffCols[] = 'password_hash';
    }
    if (!in_array('role', $staffCols)) {
        @$conn->query("ALTER TABLE staff ADD COLUMN role VARCHAR(50)");
        $staffCols[] = 'role';
    }
    if (!in_array('isDeleted', $staffCols)) {
        @$conn->query("ALTER TABLE staff ADD COLUMN isDeleted TINYINT(1) DEFAULT 0");
        $staffCols[] = 'isDeleted';
    }

    $row = null;

    // 2. Safely query users table
    $userWhere = [];
    $userParams = [];
    $userTypes = "";

    if (in_array('username', $usersCols)) {
        $userWhere[] = "username = ?";
        $userParams[] = $username;
        $userTypes .= "s";
    }
    if (in_array('email', $usersCols)) {
        $userWhere[] = "email = ?";
        $userParams[] = $username;
        $userTypes .= "s";
    }

    if (!empty($userWhere)) {
        $sqlUser = "SELECT id, username, password_hash, role FROM users WHERE (" . implode(" OR ", $userWhere) . ") LIMIT 1";
        $stmt = $conn->prepare($sqlUser);
        if ($stmt) {
            $stmt->bind_param($userTypes, ...$userParams);
            $stmt->execute();
            $res = $stmt->get_result();
            if ($res && $res->num_rows > 0) {
                $row = $res->fetch_assoc();
            }
            $stmt->close();
        }
    }

    // 3. Safely query staff table if not found in users
    if (!$row) {
        $staffWhere = [];
        $staffParams = [];
        $staffTypes = "";

        if (in_array('username', $staffCols)) {
            $staffWhere[] = "username = ?";
            $staffParams[] = $username;
            $staffTypes .= "s";
        }
        if (in_array('email', $staffCols)) {
            $staffWhere[] = "email = ?";
            $staffParams[] = $username;
            $staffTypes .= "s";
        }
        if (in_array('staff_id', $staffCols)) {
            $staffWhere[] = "staff_id = ?";
            $staffParams[] = $username;
            $staffTypes .= "s";
        }
        if (in_array('staffNo', $staffCols)) {
            $staffWhere[] = "staffNo = ?";
            $staffParams[] = $username;
            $staffTypes .= "s";
        }

        if (!empty($staffWhere)) {
            $deletedClause = in_array('isDeleted', $staffCols) ? " AND (isDeleted = 0 OR isDeleted IS NULL)" : "";
            $sqlStaff = "SELECT * FROM staff WHERE (" . implode(" OR ", $staffWhere) . ")" . $deletedClause . " LIMIT 1";
            $stmtStaff = $conn->prepare($sqlStaff);
            if ($stmtStaff) {
                $stmtStaff->bind_param($staffTypes, ...$staffParams);
                $stmtStaff->execute();
                $resStaff = $stmtStaff->get_result();
                if ($resStaff && $resStaff->num_rows > 0) {
                    $sRow = $resStaff->fetch_assoc();
                    $row = [
                        'id' => $sRow['id'] ?? $sRow['staff_id'] ?? '',
                        'username' => $sRow['username'] ?? $sRow['staff_id'] ?? $sRow['first_name'] ?? 'staff',
                        'password_hash' => $sRow['password_hash'] ?? null,
                        'role' => $sRow['role'] ?? 'LECTURER'
                    ];
                }
                $stmtStaff->close();
            }
        }
    }

    if ($row && !empty($row['password_hash'])) {
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
            } else if (in_array($dbRole, ['bursary', 'bursar'])) {
                $redirectUrl = '/bursary/';
            } else if (in_array($dbRole, ['staff', 'lecturer', 'registrar'])) {
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
