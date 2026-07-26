<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$query = '';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = isset($_GET['query']) ? trim($_GET['query']) : (isset($_GET['appId']) ? trim($_GET['appId']) : '');
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    if (!$data) $data = $_POST;
    $query = isset($data['query']) ? trim($data['query']) : (isset($data['appId']) ? trim($data['appId']) : (isset($data['phone']) ? trim($data['phone']) : ''));
}

if (empty($query)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide an Application ID or Phone Number to check status.'
    ]);
    exit();
}

// Format clean query string
$queryUpper = strtoupper($query);

// Sample response record
$applicationId = strpos($queryUpper, 'CCHSMT') !== false ? $queryUpper : 'CCHSMT-2026-'.rand(1000, 9999);

echo json_encode([
    'success' => true,
    'found' => true,
    'record' => [
        'applicationId' => $applicationId,
        'fullName' => 'Azeez Olanrewaju Okunola',
        'phone' => strpos($queryUpper, 'CCHSMT') !== false ? '08155884804' : $query,
        'email' => 'applicant@crestoakcollege.edu.ng',
        'course' => 'Community Health Extension Worker (CHEW)',
        'department' => 'Department of Community Health Sciences',
        'school' => 'School of Health Sciences',
        'status' => 'PROVISIONALLY ADMITTED',
        'session' => '2026/2027 Academic Session',
        'admissionDate' => '2026-07-20',
        'screeningVenue' => 'Admissions Hall, CrestOAK College Main Campus',
        'acceptanceFee' => '₦25,000.00',
        'verificationNextSteps' => [
            'Pay acceptance fee via bursary portal or direct bank transfer',
            'Bring original O\'Level certificate (WAEC/NECO/NABTEB) and 2 photocopies',
            'Provide birth certificate or official declaration of age',
            'Provide 4 recent passport-sized photographs'
        ]
    ]
]);
