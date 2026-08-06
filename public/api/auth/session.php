<?php
/**
 * Secure session handling for CrestOak College
 * -----------------------------------------------
 * Provides create_session(), get_active_session(), require_session(),
 * destroy_session(), and validate_csrf() using the server-side `sessions` table.
 * -----------------------------------------------
 */

$_dbPath = realpath(__DIR__ . '/../admin/db.php')
    ?: realpath(__DIR__ . '/../../api/admin/db.php')
    ?: realpath(__DIR__ . '/../../admin/db.php');
if ($_dbPath && !function_exists('getDbConnection')) {
    require_once $_dbPath;
}

/**
 * Ensure sessions table exists in DB.
 */
function ensure_sessions_table($conn): void {
    static $checked = false;
    if ($checked || !$conn) return;
    $sql = "CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(128) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        role VARCHAR(50) NOT NULL,
        expires_at DATETIME NOT NULL,
        csrf_token VARCHAR(128),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    @$conn->query($sql);
    $checked = true;
}

/**
 * Create a new server-side session for a user.
 */
function create_session(int $userId, string $role, int $ttlHours = 720): string {
    $conn = getDbConnection();
    if (!$conn) {
        throw new RuntimeException('Database connection unavailable while creating session.');
    }

    ensure_sessions_table($conn);

    $token     = bin2hex(random_bytes(32)); // 64-char opaque token
    $csrfToken = bin2hex(random_bytes(32));
    $expiresAt = (new DateTime("+{$ttlHours} hours"))->format('Y-m-d H:i:s');
    $roleUpper = strtoupper(trim($role));
    $now       = date('Y-m-d H:i:s');

    // Clean up old sessions for this user
    $delStmt = $conn->prepare('DELETE FROM sessions WHERE user_id = ? AND role = ?');
    if ($delStmt) {
        $delStmt->bind_param('is', $userId, $roleUpper);
        $delStmt->execute();
        $delStmt->close();
    }

    $stmt = $conn->prepare(
        'INSERT INTO sessions (token, user_id, role, expires_at, csrf_token, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    if (!$stmt) {
        throw new RuntimeException('Failed to prepare session insert: ' . $conn->error);
    }
    $stmt->bind_param('sissss', $token, $userId, $roleUpper, $expiresAt, $csrfToken, $now);
    $stmt->execute();
    $stmt->close();
    $conn->close();

    $secure   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $expires  = time() + $ttlHours * 3600;
    $cookieOpts = [
        'expires'  => $expires,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ];

    setcookie('cchsmt_user_session', $token, $cookieOpts);

    $cookieOpts['httponly'] = false;
    setcookie('cchsmt_csrf_token', $csrfToken, $cookieOpts);

    return $token;
}

/**
 * Retrieve the current active session.
 */
function get_active_session(): ?array {
    $token = $_COOKIE['cchsmt_user_session'] ?? '';
    if (empty($token) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s+(\S+)/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            $token = $matches[1];
        }
    }

    if (empty($token)) {
        return null;
    }

    $conn = getDbConnection();
    if (!$conn) {
        return null;
    }

    ensure_sessions_table($conn);

    $stmt = $conn->prepare(
        'SELECT token, user_id, role, expires_at, csrf_token FROM sessions WHERE token = ? LIMIT 1'
    );
    if (!$stmt) {
        $conn->close();
        return null;
    }
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $res     = $stmt->get_result();
    $session = $res ? $res->fetch_assoc() : null;
    $stmt->close();

    if (!$session) {
        $conn->close();
        return null;
    }

    // Check expiry
    $now = new DateTime();
    $exp = new DateTime($session['expires_at'] ?? '');
    if ($now > $exp) {
        $del = $conn->prepare('DELETE FROM sessions WHERE token = ?');
        if ($del) {
            $del->bind_param('s', $token);
            $del->execute();
            $del->close();
        }
        $conn->close();
        return null;
    }

    // Retrieve user identity based on role
    $userId = (int)$session['user_id'];
    $role   = strtoupper($session['role'] ?? '');
    $name   = 'User';
    $email  = '';

    if (in_array($role, ['STUDENT'])) {
        $uStmt = $conn->prepare('SELECT first_name, last_name, email, matric_no FROM students WHERE id = ? LIMIT 1');
        if ($uStmt) {
            $uStmt->bind_param('i', $userId);
            $uStmt->execute();
            $uRes = $uStmt->get_result();
            if ($uRes && $uRow = $uRes->fetch_assoc()) {
                $name  = trim(($uRow['first_name'] ?? '') . ' ' . ($uRow['last_name'] ?? '')) ?: ($uRow['matric_no'] ?? 'Student');
                $email = $uRow['email'] ?? '';
            }
            $uStmt->close();
        }
    } elseif (in_array($role, ['LECTURER', 'STAFF', 'HOD', 'DEAN', 'REGISTRAR'])) {
        $uStmt = $conn->prepare('SELECT first_name, last_name, email, username FROM staff WHERE id = ? LIMIT 1');
        if ($uStmt) {
            $uStmt->bind_param('i', $userId);
            $uStmt->execute();
            $uRes = $uStmt->get_result();
            if ($uRes && $uRow = $uRes->fetch_assoc()) {
                $name  = trim(($uRow['first_name'] ?? '') . ' ' . ($uRow['last_name'] ?? '')) ?: ($uRow['username'] ?? 'Staff');
                $email = $uRow['email'] ?? '';
            }
            $uStmt->close();
        }
    } else {
        $uStmt = $conn->prepare('SELECT name, username, email FROM users WHERE id = ? LIMIT 1');
        if ($uStmt) {
            $uStmt->bind_param('i', $userId);
            $uStmt->execute();
            $uRes = $uStmt->get_result();
            if ($uRes && $uRow = $uRes->fetch_assoc()) {
                $name  = $uRow['name'] ?? $uRow['username'] ?? 'User';
                $email = $uRow['email'] ?? '';
            }
            $uStmt->close();
        }
    }

    $conn->close();

    return [
        'token'   => $session['token'],
        'user_id' => $userId,
        'role'    => $role,
        'name'    => $name,
        'email'   => $email,
        'csrf'    => $session['csrf_token'] ?? '',
    ];
}

/**
 * Enforce valid session and optional role restrictions.
 */
function require_session(array $allowedRoles = []): array {
    $session = get_active_session();
    if (!$session) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized: valid session required.']);
        exit();
    }
    if (!empty($allowedRoles)) {
        $allowed = array_map('strtoupper', $allowedRoles);
        $role    = $session['role'];
        if (!in_array($role, $allowed, true) && !in_array('SUPERADMIN', [$role], true) && !in_array('ADMIN', [$role], true)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: insufficient privileges.']);
            exit();
        }
    }
    return $session;
}

/**
 * Destroy active session and expire cookies.
 */
function destroy_session(): void {
    $token = $_COOKIE['cchsmt_user_session'] ?? '';
    if (!empty($token)) {
        $conn = getDbConnection();
        if ($conn) {
            $stmt = $conn->prepare('DELETE FROM sessions WHERE token = ?');
            if ($stmt) {
                $stmt->bind_param('s', $token);
                $stmt->execute();
                $stmt->close();
            }
            $conn->close();
        }
    }

    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $cookieOpts = [
        'expires'  => time() - 3600,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ];
    setcookie('cchsmt_user_session', '', $cookieOpts);
    $cookieOpts['httponly'] = false;
    setcookie('cchsmt_csrf_token', '', $cookieOpts);
}

/**
 * Validate CSRF token.
 */
function validate_csrf(?string $providedToken = null): bool {
    if ($providedToken === null) {
        $providedToken = $_POST['csrf_token'] ?? '';
        if (empty($providedToken)) {
            $providedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        }
    }
    $session = get_active_session();
    if (!$session) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Session required for CSRF validation.']);
        exit();
    }
    $expected = $session['csrf'] ?? '';
    if (empty($expected) || !hash_equals($expected, $providedToken)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid CSRF token.']);
        exit();
    }
    return true;
}

