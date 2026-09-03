<?php
/**
 * Sends a welcome email containing login credentials for a newly created
 * staff or student account. Uses the tested SMTP mailer.
 * Returns true on send success, false otherwise (never throws).
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/smtp-mailer.php';

function sendWelcomeEmail(string $toEmail, string $recipientName, string $idNumber, string $role, string $plainPassword): bool {
    $roleLabel = (strtoupper($role) === 'STUDENT') ? 'Student' : 'Staff';
    $subject = "Welcome to CrestOak {$roleLabel} Portal — Your Login Details";

    $cleanName = htmlspecialchars($recipientName, ENT_QUOTES, 'UTF-8');
    $cleanId = htmlspecialchars($idNumber, ENT_QUOTES, 'UTF-8');
    $cleanPassword = htmlspecialchars($plainPassword, ENT_QUOTES, 'UTF-8');
    $loginUrl = 'https://' . strtolower($roleLabel) . '.crestoakcollege.com.ng/login/';

    $body = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='utf-8'><title>Welcome to CrestOak College</title></head>
    <body style='font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;'>
            <h2 style='color: #1e3a8a; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 0;'>Welcome to CrestOak College</h2>
            <p>Dear {$cleanName},</p>
            <p>An account has been created for you on the CrestOak {$roleLabel} Portal.</p>
            <p><strong>Your {$roleLabel} ID:</strong> {$cleanId}<br>
            <strong>Temporary Password:</strong> {$cleanPassword}</p>
            <p style='text-align: center; margin: 30px 0;'>
                <a href='{$loginUrl}' style='background: #1e3a8a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Log In Now</a>
            </p>
            <p style='font-size: 12px; color: #64748b;'>For your security, please log in and change your password as soon as possible.</p>
            <p style='font-size: 11px; color: #94a3b8; margin-top: 25px;'>If you did not expect this email, please contact info@crestoakcollege.com.ng.</p>
        </div>
    </body>
    </html>
    ";

    return sendSmtpMail($toEmail, $recipientName, $subject, $body);
}
