<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/admin/db.php';

if (!function_exists('cleanId')) {
    function cleanId($id) {
        return strtolower(str_replace(['\\', '/'], '', trim($id ?? '')));
    }
}

function verifyPasswordStrict($inputPassword, $storedHash) {
    if (empty($storedHash) || empty($inputPassword)) {
        return false;
    }
    return password_verify($inputPassword, $storedHash);
}

try {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];
    $data = $input;

    $rawIdentifier = trim($data['username'] ?? $data['matricNo'] ?? $data['staffId'] ?? $data['staffNo'] ?? $data['sin'] ?? $data['email'] ?? $data['identifier'] ?? '');
    $cleanIdentifier = cleanId($rawIdentifier);
    $rawPassword = trim($data['password'] ?? '');

    if (empty($rawIdentifier) || empty($rawPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username/Identifier and password are required.']);
        exit();
    }

    $conn = getDbConnection();
    if (!$conn) {
        http_response_code(503);
        echo json_encode(['success' => false, 'message' => 'Database service unavailable.']);
        exit();
    }

    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    // Rate Limiting Check: Max 5 failed attempts per 15 minutes
    try {
        @$conn->query("CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(100) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ident_ip (identifier, ip_address),
            INDEX idx_attempted (attempted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        @$conn->query("DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL 15 MINUTE");

        $rateStmt = $conn->prepare("SELECT COUNT(*) as attempts FROM login_attempts WHERE (identifier = ? OR ip_address = ?) AND attempted_at >= NOW() - INTERVAL 15 MINUTE");
        if ($rateStmt) {
            $rateStmt->bind_param("ss", $cleanIdentifier, $clientIp);
            $rateStmt->execute();
            $rateRes = $rateStmt->get_result();
            if ($rateRes && $rateRow = $rateRes->fetch_assoc()) {
                if ((int)$rateRow['attempts'] >= 5) {
                    $rateStmt->close();
                    $conn->close();
                    http_response_code(429);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Too many failed login attempts. Please wait 15 minutes before trying again.'
                    ]);
                    exit();
                }
            }
            $rateStmt->close();
        }
    } catch (Throwable $e) {
        error_log("Rate limiting check error: " . $e->getMessage());
    }

    $matchedUser = null;

    // 1. Check `users` table
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1");
        if ($stmt) {
            $stmt->bind_param("ss", $cleanIdentifier, $cleanIdentifier);
            $stmt->execute();
            $res = $stmt->get_result();
            if ($res && $res->num_rows > 0) {
                $row = $res->fetch_assoc();
                $storedPass = $row['password_hash'] ?? $row['password'] ?? '';
                if (verifyPasswordStrict($rawPassword, $storedPass)) {
                    $matchedUser = [
                        'id' => (string)$row['id'],
                        'username' => $row['username'] ?? $row['email'],
                        'email' => $row['email'] ?? '',
                        'name' => $row['name'] ?? $row['username'] ?? 'User',
                        'role' => strtoupper($row['role'] ?? 'STUDENT')
                    ];
                }
            }
            $stmt->close();
        }
    } catch (Throwable $e) {
        error_log("Login users table error: " . $e->getMessage());
    }

    // 2. Check `students` table
    if (!$matchedUser) {
        try {
            $stmt = $conn->prepare("SELECT * FROM students WHERE (REPLACE(LOWER(matric_no), '\\\\', '') = ? OR LOWER(email) = ? OR LOWER(id) = ?) AND (isDeleted = 0 OR isDeleted IS NULL) LIMIT 1");
            if ($stmt) {
                $stmt->bind_param("sss", $cleanIdentifier, $cleanIdentifier, $cleanIdentifier);
                $stmt->execute();
                $res = $stmt->get_result();
                if ($res && $res->num_rows > 0) {
                    $row = $res->fetch_assoc();
                    $storedPass = $row['password_hash'] ?? $row['password'] ?? '';
                    if (verifyPasswordStrict($rawPassword, $storedPass)) {
                        $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: 'Student';
                        $matchedUser = [
                            'id' => (string)$row['id'],
                            'matricNo' => $row['matric_no'],
                            'username' => $row['matric_no'],
                            'email' => $row['email'],
                            'name' => $fullName,
                            'role' => 'STUDENT',
                            'level' => (int)($row['level'] ?? 100),
                            'department' => $row['department_name'] ?? ''
                        ];
                    }
                }
                $stmt->close();
            }
        } catch (Throwable $e) {
            error_log("Login students table error: " . $e->getMessage());
        }
    }

    // 3. Check `staff` table
    if (!$matchedUser) {
        try {
            $stmt = $conn->prepare("SELECT * FROM staff WHERE (REPLACE(LOWER(staff_no), '\\\\', '') = ? OR LOWER(email) = ? OR LOWER(username) = ? OR LOWER(id) = ?) AND (isDeleted = 0 OR isDeleted IS NULL) LIMIT 1");
            if ($stmt) {
                $stmt->bind_param("ssss", $cleanIdentifier, $cleanIdentifier, $cleanIdentifier, $cleanIdentifier);
                $stmt->execute();
                $res = $stmt->get_result();
                if ($res && $res->num_rows > 0) {
                    $row = $res->fetch_assoc();
                    $storedPass = $row['password_hash'] ?? $row['password'] ?? '';
                    if (verifyPasswordStrict($rawPassword, $storedPass)) {
                        $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: 'Staff Member';
                        $staffIdVal = $row['staff_no'] ?? $row['staff_id'] ?? '';
                        $matchedUser = [
                            'id' => (string)$row['id'],
                            'staffId' => $staffIdVal,
                            'staffNo' => $staffIdVal,
                            'sin' => $staffIdVal,
                            'username' => $row['username'] ?? $staffIdVal,
                            'email' => $row['email'] ?? '',
                            'name' => $fullName,
                            'role' => strtoupper($row['role_name'] ?? $row['role'] ?? 'LECTURER'),
                            'department' => $row['department_name'] ?? ''
                        ];
                    }
                }
                $stmt->close();
            }
        } catch (Throwable $e) {
            error_log("Login staff table error: " . $e->getMessage());
        }
    }

    if ($matchedUser) {
        // Clear failed attempts on successful login
        try {
            $clearStmt = $conn->prepare("DELETE FROM login_attempts WHERE identifier = ? OR ip_address = ?");
            if ($clearStmt) {
                $clearStmt->bind_param("ss", $cleanIdentifier, $clientIp);
                $clearStmt->execute();
                $clearStmt->close();
            }
        } catch (Throwable $e) {}

        $conn->close();
        $role = $matchedUser['role'];

        // Create a secure server-side session for ALL roles
        require_once __DIR__ . '/auth/session.php';
        $sessionToken = create_session((int)$matchedUser['id'], $role);

        $redirectUrl = '/portal/dashboard/';
        if (in_array($role, ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'])) {
            $redirectUrl = '/admin/dashboard/';
        } elseif (in_array($role, ['BURSARY', 'BURSAR'])) {
            $redirectUrl = '/bursary/dashboard/';
        } elseif (in_array($role, ['LECTURER', 'HOD', 'DEAN', 'REGISTRAR', 'STAFF'])) {
            $redirectUrl = '/staff/dashboard/';
        }

        echo json_encode([
            'success'     => true,
            'message'     => 'Authentication successful.',
            'token'       => $sessionToken,
            'redirect'    => $redirectUrl,
            'redirectUrl' => $redirectUrl,
            'user'        => $matchedUser
        ]);
        exit();
    }

    // Log failed attempt
    try {
        $logStmt = $conn->prepare("INSERT INTO login_attempts (identifier, ip_address) VALUES (?, ?)");
        if ($logStmt) {
            $logStmt->bind_param("ss", $cleanIdentifier, $clientIp);
            $logStmt->execute();
            $logStmt->close();
        }
    } catch (Throwable $e) {}

    $conn->close();

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid portal credentials.'
    ]);
    exit();

} catch (Throwable $e) {
    error_log("Auth server exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication server error.'
    ]);
    exit();
}
