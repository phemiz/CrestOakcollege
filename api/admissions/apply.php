<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Only POST requests are accepted.'
    ]);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

$fullName = isset($data['fullName']) ? trim($data['fullName']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : '';
$course = isset($data['course']) ? trim($data['course']) : '';

if (empty($fullName) || empty($email) || empty($phone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: fullName, email, and phone are mandatory.'
    ]);
    exit();
}

// Generate application number
$randomNumber = rand(1000, 9999);
$applicationId = 'CCHSMT-2026-' . $randomNumber;

// Respond with JSON success payload
echo json_encode([
    'success' => true,
    'message' => 'Application submitted successfully to CrestOAK College of Health Sciences & Medical Technology admissions office.',
    'applicationId' => $applicationId,
    'applicant' => [
        'fullName' => $fullName,
        'email' => $email,
        'phone' => $phone,
        'course' => $course
    ],
    'submittedAt' => date('Y-m-d H:i:s')
]);
