<?php
/**
 * Issues student portal credentials after the first approved TUITION payment.
 * Never throws. Returns true only if credentials were issued and emailed.
 */
require_once __DIR__ . '/mailer.php';

function generate_strong_temp_password(int $length = 12): string {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    $max = strlen($alphabet) - 1;
    $out = '';
    for ($i = 0; $i < $length; $i++) {
        $out .= $alphabet[random_int(0, $max)];
    }
    return $out;
}

function issue_student_credentials(mysqli $conn, int $studentFeeId): bool {
    try {
        $q = $conn->prepare(
            "SELECT sf.student_id, fs.fee_type
             FROM student_fees sf
             JOIN fee_structures fs ON fs.id = sf.fee_structure_id
             WHERE sf.id = ? LIMIT 1"
        );
        if (!$q) { return false; }
        $q->bind_param('i', $studentFeeId);
        $q->execute();
        $fee = $q->get_result()->fetch_assoc();
        $q->close();
        if (!$fee || strtoupper((string)$fee['fee_type']) !== 'TUITION') { return false; }

        $studentId = (int)$fee['student_id'];
        $s = $conn->prepare(
            "SELECT email, first_name, last_name, matric_no, credentials_sent_at
             FROM students WHERE id = ? LIMIT 1"
        );
        if (!$s) { return false; }
        $s->bind_param('i', $studentId);
        $s->execute();
        $stu = $s->get_result()->fetch_assoc();
        $s->close();
        if (!$stu || !empty($stu['credentials_sent_at']) || empty($stu['email'])) { return false; }

        $plain = generate_strong_temp_password();
        $hash = password_hash($plain, PASSWORD_BCRYPT);

        $claim = $conn->prepare(
            "UPDATE students SET credentials_sent_at = NOW(), password_hash = ?, force_password_change = 1
             WHERE id = ? AND credentials_sent_at IS NULL"
        );
        if (!$claim) { return false; }
        $claim->bind_param('si', $hash, $studentId);
        $claim->execute();
        $won = ($claim->affected_rows === 1);
        $claim->close();
        if (!$won) { return false; }

        $name = trim(($stu['first_name'] ?? '') . ' ' . ($stu['last_name'] ?? '')) ?: 'Student';
        $sent = sendWelcomeEmail($stu['email'], $name, $stu['matric_no'], 'STUDENT', $plain);
        if (!$sent) {
            error_log("issue_student_credentials: email failed for student_id={$studentId}; reverting so it can retry");
            $rev = $conn->prepare("UPDATE students SET credentials_sent_at = NULL WHERE id = ?");
            if ($rev) { $rev->bind_param('i', $studentId); $rev->execute(); $rev->close(); }
            return false;
        }
        return true;
    } catch (Throwable $e) {
        error_log('issue_student_credentials error: ' . $e->getMessage());
        return false;
    }
}
