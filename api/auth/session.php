<?php
/**
 * Secure session handling for CrestOak College
 * -----------------------------------------------
 * Provides create_session(), get_active_session(), require_session(),
 * and validate_csrf() using the server‑side `sessions` MySQL table.
 * All functions use MySQLi (matching getDbConnection() in db.php).
 * -----------------------------------------------
 */

// Resolve db.php regardless of whether this file is in api/auth/ or public/api/auth/
$_dbPath = realpath(__DIR__ . '/../admin/db.php')
    ?: realpath(__DIR__ . '/../../api/admin/db.php')
    ?: realpath(__DIR__ . '/../../admin/db.php');
if ($_dbPath && !function_exists('getDbConnection')) {
    require_once $_dbPath;
}

/**
 * Create a new server‑side session for a user.
 * Sets HttpOnly + Secure + SameSite=Lax cookies.
 *
 * @param int    $userId   Primary key from the users table.
 * @param string $role     Role string (ADMIN, STAFF, STUDENT, …).
 * @param int    $ttlHours Session lifetime in hours (default 720 = 30 days).
 * @return string          The opaque session token.
 */
function create_session(int $userId, string $role, int $ttlHours = 720): string {
    $conn = getDbConnection();
    if (!$conn) {
        throw new RuntimeException('Database connection unavailable while creating session.');
    }

    $token     = bin2hex(random_bytes(32)); // 64-char opaque token
    $csrfToken = bin2hex(random_bytes(32));
    $expiresAt = (new DateTime("+{$ttlHours} hours"))->format('Y-m-d H:i:s');
    $roleUpper = strtoupper($role);
    $now       = date('Y-m-d H:i:s');

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

    // Session token cookie — HttpOnly (not readable by JS)
    setcookie('cchsmt_user_session', $token, $cookieOpts);

    // CSRF token cookie — readable by JS so it can be sent in headers
    $cookieOpts['httponly'] = false;
    setcookie('cchsmt_csrf_token', $csrfToken, $cookieOpts);

    return $token;
}

/**
 * Retrieve the current active session from the opaque cookie token.
 * Returns null if no valid, non-expired session exists.
 */
function get_active_session(): ?array {
    $token = $_COOKIE['cchsmt_user_session'] ?? '';
    if (empty($token)) {
        return null;
    }

    $conn = getDbConnection();
    if (!$conn) {
        return null;
    }

    $stmt = $conn->prepare(
        'SELECT s.token, s.user_id, s.role, s.expires_at, s.csrf_token, u.name, u.email
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = ?
         LIMIT 1'
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

    $conn->close();
    return [
        'token'   => $session['token'],
        'user_id' => (int)$session['user_id'],
        'role'    => strtoupper($session['role'] ?? ''),
        'name'    => $session['name'] ?? '',
        'email'   => $session['email'] ?? '',
        'csrf'    => $session['csrf_token'] ?? '',
    ];
}

/**
 * Enforce that a request has a valid session.
 * Optionally restrict to specific roles.
 *
 * @param array $allowedRoles Permitted roles, e.g. ['ADMIN', 'SUPERADMIN'].
 * @return array              Session data on success.
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
        // SUPERADMIN / ADMIN bypass role checks
        if (!in_array($role, $allowed, true)
            && !in_array('SUPERADMIN', [$role], true)
        ) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: insufficient privileges.']);
            exit();
        }
    }
    return $session;
}

/**
 * Validate the CSRF token from POST body or X-CSRF-Token header.
 * Sends a 400 response and exits if validation fails.
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
