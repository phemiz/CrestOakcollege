<?php
/**
 * Shared SMTP mailer helper using PHPMailer.
 * Sends mail via authenticated SMTP using SMTP_CONFIG_* constants from config.php.
 * Returns true on success, false on failure. Never throws — errors are logged.
 */

require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

function sendSmtpMail(string $toEmail, string $toName, string $subject, string $htmlBody, string $fromName = 'CrestOak College'): bool {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_CONFIG_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_CONFIG_USER;
        $mail->Password   = SMTP_CONFIG_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = SMTP_CONFIG_PORT;

        $mail->setFrom(SMTP_CONFIG_USER, $fromName);
        $mail->addAddress($toEmail, $toName);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;

        $mail->send();
        return true;
    } catch (PHPMailerException $e) {
        error_log('SMTP mail failed to ' . $toEmail . ': ' . $mail->ErrorInfo);
        return false;
    }
}
