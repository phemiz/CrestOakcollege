<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'https://crestoakcollege.com.ng',
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://crestoakcollege.com.ng"));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    ob_end_clean();
    exit(0);
}

require_once __DIR__ . '/admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    http_response_code(500);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $appId = trim($_GET['appId'] ?? $_GET['applicationId'] ?? $_GET['id'] ?? $_GET['phone'] ?? '');

    if (empty($appId)) {
        http_response_code(400);
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Please provide an Application ID or Phone Number.']);
        exit(0);
    }

    $stmt = $conn->prepare(
        "SELECT appNo, fullName, email, phone, faculty, course, status, dateSubmitted
         FROM Application
         WHERE appNo = ? OR phone = ? OR email = ?
         LIMIT 1"
    );
    $stmt->bind_param("sss", $appId, $appId, $appId);
    $stmt->execute();
    $res = $stmt->get_result();
    $record = $res ? $res->fetch_assoc() : null;
    $stmt->close();
    $conn->close();

    if (!$record) {
        http_response_code(404);
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'found' => false,
            'message' => 'No application found matching that Application ID or Phone Number.'
        ]);
        exit(0);
    }

    $application = [
        'applicationId' => $record['appNo'],
        'fullName' => $record['fullName'],
        'email' => $record['email'],
        'phone' => $record['phone'],
        'course' => $record['course'],
        'faculty' => $record['faculty'],
        'status' => $record['status'],
        'submittedAt' => $record['dateSubmitted']
    ];

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'found' => true,
        'status' => 'success',
        'application' => $application,
        'data' => $application,
        'record' => $application
    ]);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST;

    $fullName = trim($input['fullName'] ?? (($input['firstName'] ?? '') . ' ' . ($input['lastName'] ?? '')));
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $course = trim($input['course'] ?? 'Nursing Science (B.N.Sc.)');
    $faculty = trim($input['faculty'] ?? 'Faculty of Allied Health Sciences');

    if (empty($fullName) || empty($phone)) {
        http_response_code(400);
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Full name and phone number are required.']);
        exit(0);
    }

    $appId = '';
    for ($i = 0; $i < 5; $i++) {
        $candidate = 'CCHSMT-2026-' . rand(1000, 9999);
        $check = $conn->prepare("SELECT appNo FROM Application WHERE appNo = ? LIMIT 1");
        $check->bind_param("s", $candidate);
        $check->execute();
        $exists = $check->get_result()->fetch_assoc();
        $check->close();
        if (!$exists) {
            $appId = $candidate;
            break;
        }
    }
    if (empty($appId)) {
        http_response_code(500);
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Could not generate a unique application ID, please try again.']);
        exit(0);
    }

    $status = 'pending';
    $stmt = $conn->prepare(
        "INSERT INTO Application (appNo, fullName, email, phone, faculty, course, status, dateSubmitted)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())"
    );
    $stmt->bind_param("sssssss", $appId, $fullName, $email, $phone, $faculty, $course, $status);

    $ok = false;
    try {
        $ok = $stmt->execute();
    } catch (mysqli_sql_exception $e) {
        $ok = false;
    }
    $stmt->close();
    $conn->close();

    if (!$ok) {
        http_response_code(500);
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Could not save application. Please try again.']);
        exit(0);
    }

    $newApp = [
        'applicationId' => $appId,
        'fullName' => $fullName,
        'email' => $email,
        'phone' => $phone,
        'course' => $course,
        'faculty' => $faculty,
        'status' => $status,
        'submittedAt' => date('Y-m-d H:i:s')
    ];

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'status' => 'success',
        'applicationId' => $appId,
        'application' => $newApp,
        'message' => 'Application submitted successfully'
    ]);
    exit(0);
}

$conn->close();
http_response_code(405);
ob_end_clean();
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
exit(0);
