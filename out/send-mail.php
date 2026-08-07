<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

$allowedOrigins = [
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng',
    'https://staff.crestoakcollege.com.ng',
    'https://admissions.crestoakcollege.com.ng',
    'https://pay.crestoakcollege.com.ng',
    'https://register.crestoakcollege.com.ng',
    'https://crestoakcollege.com.ng',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: https://crestoakcollege.com.ng");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

try {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    if (!$input) {
        $input = $_POST;
    }

    $name = isset($input['name']) ? trim($input['name']) : (isset($input['fullName']) ? trim($input['fullName']) : '');
    $email = isset($input['email']) ? trim($input['email']) : '';
    $subject = isset($input['subject']) ? trim($input['subject']) : '';
    $message = isset($input['message']) ? trim($input['message']) : '';

    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Please fill in all required fields (Name, Email, Subject, Message).']);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Invalid email address provided.']);
        exit();
    }

    $to = 'info@crestoakcollege.com.ng';
    $emailSubject = '[Website Enquiry] ' . filter_var($subject, FILTER_SANITIZE_SPECIAL_CHARS);

    $cleanName = filter_var($name, FILTER_SANITIZE_SPECIAL_CHARS);
    $cleanEmail = filter_var($email, FILTER_SANITIZE_EMAIL);
    $cleanMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

    $body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='utf-8'>
        <title>Website Enquiry</title>
    </head>
    <body style='font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;'>
            <h2 style='color: #1e3a8a; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 0;'>New Website Enquiry</h2>
            <p><strong>Full Name:</strong> {$cleanName}</p>
            <p><strong>Sender Email:</strong> <a href='mailto:{$cleanEmail}'>{$cleanEmail}</a></p>
            <p><strong>Subject:</strong> {$cleanName} - {$subject}</p>
            <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
            <p><strong>Message Content:</strong></p>
            <div style='background: #f8fafc; padding: 15px; border-left: 4px solid #1e3a8a; border-radius: 6px; line-height: 1.6;'>
                {$cleanMessage}
            </div>
            <p style='font-size: 11px; color: #94a3b8; margin-top: 25px;'>Sent from CrestOak College Contact Us page.</p>
        </div>
    </body>
    </html>
    ";

    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: CrestOak College Website <info@crestoakcollege.com.ng>',
        'Reply-To: ' . $cleanName . ' <' . $cleanEmail . '>',
        'X-Mailer: PHP/' . phpversion()
    );

    $sent = mail($to, $emailSubject, $body, implode("\r\n", $headers));

    if ($sent) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'success' => true,
            'message' => 'Your message has been sent successfully to info@crestoakcollege.com.ng.'
        ]);
    } else {
        error_log("Failed to send mail via mail() to $to");
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'success' => false,
            'message' => 'Unable to send email via mail server. Please try again later.'
        ]);
    }
} catch (Throwable $e) {
    error_log("send-mail.php exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'success' => false,
        'message' => 'Internal mail server error.'
    ]);
}
