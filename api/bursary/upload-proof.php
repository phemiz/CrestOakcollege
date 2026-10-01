<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once __DIR__ . '/../admin/db.php';
require_once __DIR__ . '/../auth/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST required.']);
    exit();
}

$session = require_session(['STUDENT']);
if ($session['role'] !== 'STUDENT') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only students can upload payment proof.']);
    exit();
}
validate_csrf();

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file received or upload failed.']);
    exit();
}

$file = $_FILES['file'];
$maxBytes = 3 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File too large. Maximum is 3 MB.']);
    exit();
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png'];
$mime = function_exists('finfo_open') ? finfo_file(finfo_open(FILEINFO_MIME_TYPE), $file['tmp_name']) : '';
if (!isset($allowed[$ext]) || $mime !== $allowed[$ext]) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file. Only PDF, JPG, and PNG are allowed.']);
    exit();
}

$uploadDir = __DIR__ . '/../../uploads/payment-proofs/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = 'proof_' . (int)$session['user_id'] . '_' . bin2hex(random_bytes(16)) . '.' . $ext;
if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
    chmod($uploadDir . $filename, 0644);
    echo json_encode(['success' => true, 'url' => '/uploads/payment-proofs/' . $filename]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file on server.']);
}
