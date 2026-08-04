<?php
// Secure session handling for CrestOak College
// -------------------------------------------------
// This file provides functions to create, retrieve, and validate
// server‑side sessions stored in the `sessions` MySQL table.
// Cookies contain only an opaque token; no user data is trusted from the client.
// -------------------------------------------------
require_once __DIR__ . '/../../admin/db.php'; // DB connection helper

/**
 * Create a new session for a given user.
 *
 * @param int    $userId   The primary key of the user in the `users` table.
 * @param string $role     The role string (e.g. ADMIN, STAFF, STUDENT).
 * @param int    $ttlHours Session lifetime in hours (default 720 = 30 days).
 * @return string          The generated token.
 */
function create_session(int $userId, string $role, int $ttlHours = 720): string {
    $pdo = getDbConnection();
    if (!$pdo) {
        throw new RuntimeException('Database connection unavailable while creating session');
    }
    $token = bin2hex(random_bytes(32)); // 64‑char opaque token
    $expiresAt = (new DateTime("+{$ttlHours} hours"))->format('Y-m-d H:i:s');
    $csrfToken = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare('INSERT INTO sessions (token, user_id, role, expires_at, csrf_token, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$token, $userId, strtoupper($role), $expiresAt, $csrfToken]);

    // Set cookie with strict security flags
    setcookie(
        'cchsmt_user_session',
        $token,
        [
            'expires'  => time() + $ttlHours * 3600,
            'path'     => '/',
            'domain'   => '', // current host
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]
    );
// Validate CSRF token sent via POST body or X‑CSRF‑Token header
function validate_csrf(string $providedToken = null): bool {
    // Accept token from request body, header, or cookie (if not provided explicitly)
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
    if (!hash_equals($expected, $providedToken)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid CSRF token.']);
        exit();
    }
    return true;
}
    // Also expose CSRF token via a separate cookie (accessible to JS)
    setcookie(
        'cchsmt_csrf_token',
        $csrfToken,
        [
            'expires'  => time() + $ttlHours * 3600,
            'path'     => '/',
            'domain'   => '',
            'secure'   => true,
            'httponly' => false, // readable by client for inclusion in forms
            'samesite' => 'Lax'
        ]
    );
    return $token;
}

/**
 * Retrieve the current active session based on the opaque token cookie.
 * Returns null if no valid session exists.
 */
function get_active_session(): ?array {
    if (empty($_COOKIE['cchsmt_user_session'])) {
        return null;
    }
    $token = $_COOKIE['cchsmt_user_session'];
    $pdo = getDbConnection();
    if (!$pdo) {
        return null;
    }
    $stmt = $pdo->prepare('SELECT s.token, s.user_id, s.role, s.expires_at, s.csrf_token, u.name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? LIMIT 1');
    $stmt->execute([$token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$session) {
        return null;
    }
    // Verify expiration
    $now = new DateTime();
    $exp = new DateTime($session['expires_at'] ?? '');
    if ($now > $exp) {
        // Session expired – delete it
        $del = $pdo->prepare('DELETE FROM sessions WHERE token = ?');
        $del->execute([$token]);
        return null;
    }
    // Return clean array (no raw cookie data)
    return [
        'token'    => $session['token'],
        'user_id'  => (int)$session['user_id'],
        'role'     => strtoupper($session['role'] ?? ''),
        'name'     => $session['name'] ?? '',
        'email'    => $session['email'] ?? '',
        'csrf'     => $session['csrf_token'] ?? ''
    ];
}

/**
 * Enforce that a request has a valid session. Optionally restrict to specific roles.
 *
 * @param array $allowedRoles List of roles that are permitted (e.g. ['ADMIN']).
 * @return array               The session data when validation succeeds.
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
        $role = $session['role'];
        if (!in_array($role, $allowed, true) && !in_array('ADMIN', $allowed, true)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden: insufficient privileges.']);
            exit();
        }
    }
    return $session;
}
?>
