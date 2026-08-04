<?php
if (!function_exists('get_active_session')) {
    function get_active_session() {
        $rawSession = $_COOKIE['cchsmt_user_session'] ?? $_COOKIE['user'] ?? '';
        if (empty($rawSession)) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            if (strpos($authHeader, 'Bearer ') === 0) {
                $rawSession = trim(substr($authHeader, 7));
            }
        }

        if (empty($rawSession)) {
            return null;
        }

        $userData = @json_decode($rawSession, true);
        if (is_array($userData) && !empty($userData['role'])) {
            return $userData;
        }

        // Base64 JSON fallback check
        $decoded = @base64_decode($rawSession, true);
        if ($decoded !== false) {
            $userData = @json_decode($decoded, true);
            if (is_array($userData) && !empty($userData['role'])) {
                return $userData;
            }
        }

        return null;
    }
}

if (!function_exists('require_session')) {
    function require_session(array $allowedRoles = []) {
        $session = get_active_session();
        if (!$session) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized: Valid session required.'
            ]);
            exit();
        }

        if (!empty($allowedRoles)) {
            $userRole = strtoupper($session['role'] ?? '');
            $normalizedAllowed = array_map('strtoupper', $allowedRoles);
            
            // Allow SUPERADMIN / ADMIN for administrative overrides
            if (in_array('ADMIN', $normalizedAllowed, true) && in_array($userRole, ['SUPERADMIN', 'SUPER_ADMIN'], true)) {
                return $session;
            }

            if (!in_array($userRole, $normalizedAllowed, true)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Forbidden: Insufficient privileges for role ' . $userRole
                ]);
                exit();
            }
        }

        return $session;
    }
}
