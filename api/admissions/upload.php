<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uploadDir = __DIR__ . '/../../uploads/documents/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['file'])) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit();
}

$file = $_FILES['file'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['pdf', 'jpg', 'jpeg', 'png'];

if (!in_array($ext, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only PDF, JPG, and PNG are allowed.']);
    exit();
}

$maxBytes = 8 * 1024 * 1024; // 8 MB per document
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Upload failed. Please try again.']);
    exit();
}
if (($file['size'] ?? 0) > $maxBytes) {
    echo json_encode(['success' => false, 'message' => 'File is too large. Maximum size is 8 MB.']);
    exit();
}
$typeMap = ['pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png'];
$mime = function_exists('finfo_open') ? finfo_file(finfo_open(FILEINFO_MIME_TYPE), $file['tmp_name']) : '';
if ($mime !== $typeMap[$ext]) {
    echo json_encode(['success' => false, 'message' => 'File content does not match its type. Only PDF, JPG, and PNG are allowed.']);
    exit();
}
$filename = 'doc_' . bin2hex(random_bytes(16)) . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $publicUrl = '/uploads/documents/' . $filename;
    echo json_encode(['success' => true, 'url' => $publicUrl]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save file on server.']);
}
