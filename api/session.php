<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/admin/db.php';
require_once __DIR__ . '/auth/session.php';

$session = get_active_session();

if ($session) {
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'user' => $session
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'user' => null
    ]);
}
exit();
