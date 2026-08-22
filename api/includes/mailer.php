<?php
/**
 * Sends an account activation email with a link to set a password.
 * Returns true on send success, false otherwise (never throws).
 */
function sendActivationEmail(string $toEmail, string $recipientName, string $idNumber, string $role, string $rawToken): bool {
    $activationUrl = 'https://' . strtolower($role) . '.crestoakcollege.com.ng/activate?token=' . urlencode($rawToken);

    $roleLabel = ($role === 'staff') ? 'Staff' : 'Student';
    $subject = "Activate Your CrestOak {$roleLabel} Portal Account";

    $cleanName = htmlspecialchars($recipientName, ENT_QUOTES, 'UTF-8');
    $cleanId = htmlspecialchars($idNumber, ENT_QUOTES, 'UTF-8');

    $body = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='utf-8'><title>Activate Your Account</title></head>
    <body style='font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;'>
            <h2 style='color: #1e3a8a; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 0;'>Welcome to CrestOak College</h2>
            <p>Dear {$cleanName},</p>
            <p>An account has been created for you on the CrestOak {$roleLabel} Portal.</p>
            <p><strong>Your {$roleLabel} ID:</strong> {$cleanId}</p>
            <p>To activate your account and set your own password, click the link below. This link expires in 48 hours.</p>
            <p style='text-align: center; margin: 30px 0;'>
                <a href='{$activationUrl}' style='background: #1e3a8a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Activate My Account</a>
            </p>
            <p style='font-size: 12px; color: #64748b;'>If the button doesn't work, copy and paste this link into your browser:<br>{$activationUrl}</p>
            <p style='font-size: 11px; color: #94a3b8; margin-top: 25px;'>If you did not expect this email, please contact info@crestoakcollege.com.ng.</p>
        </div>
    </body>
    </html>
    ";

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: CrestOak College <info@crestoakcollege.com.ng>',
        'X-Mailer: PHP/' . phpversion()
    ];

    return @mail($toEmail, $subject, $body, implode("\r\n", $headers));
}
