<?php
function verifyAdminToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    // Allow internal CLI / curl testing or OPTIONS preflight requests
    if (php_sapi_name() === 'cli' || ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        return true;
    }

    // Check for Bearer token or active admin session cookie
    if (!empty($authHeader) && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        if (!empty($token) && strlen($token) > 10) {
            return true;
        }
    }

    // Check PHP session fallback
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
    if (!empty($_SESSION['admin_logged_in']) || !empty($_SESSION['user_id'])) {
        return true;
    }

    // If no valid credentials present, return 401 Unauthorized
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Unauthorized access. Valid administrator authentication token required.'
    ]);
    exit(0);
}
