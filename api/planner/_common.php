<?php
require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../auth/session.php';
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

function planner_json($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

function planner_input(): array {
    $d = json_decode(file_get_contents('php://input'), true);
    return is_array($d) ? $d : [];
}

function planner_db() {
    $c = getDbConnection();
    if (!$c) {
        planner_json(['success' => false, 'message' => 'Database unavailable.'], 500);
    }
    return $c;
}

function planner_read_session(): array {
    return require_session(['ACADEMIC_PLANNER', 'REGISTRAR', 'ADMIN', 'SUPERADMIN']);
}

function planner_write_session(): array {
    $s = require_session(['ACADEMIC_PLANNER']);
    if (strtoupper($s['role'] ?? '') !== 'ACADEMIC_PLANNER') {
        planner_json(['success' => false, 'message' => 'Only the Academic Planning Officer can change the timetable.'], 403);
    }
    validate_csrf();
    return $s;
}
