<?php
require_once __DIR__ . '/../admin/db.php';

$ref = trim($_GET['ref'] ?? '');
$id = (int) preg_replace('/[^0-9]/', '', $ref);

if (!$id) {
    die("Application reference number required.");
}

$conn = getDbConnection();
if (!$conn) { die("Database connection failed."); }
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare("SELECT applicant_name, email, program_applied, status, created_at FROM admissions WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$app = $stmt->get_result()->fetch_assoc();

if (!$app || $app['status'] !== 'ACCEPTED') {
    die("Official admission letter is only available for accepted applications.");
}

$refNo = "CCHMT-ADM-" . str_pad($id, 5, '0', STR_PAD_LEFT);
$dateFormatted = date('F d, Y');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Provisional Admission Letter - <?php echo $refNo; ?></title>
    <style>
        body { font-family: 'Georgia', serif; background: #f4f6f9; padding: 20px; color: #222; }
        .letter-card { max-width: 700px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #dcdcdc; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { color: #003366; margin: 0; font-size: 26px; text-transform: uppercase; font-family: 'Helvetica', sans-serif; }
        .header p { margin: 4px 0 0; color: #555; font-size: 13px; font-family: 'Helvetica', sans-serif; }
        .ref-date { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-bottom: 25px; color: #444; }
        .salutation { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .content { font-size: 15px; line-height: 1.6; text-align: justify; margin-bottom: 25px; }
        .program-box { background: #f0f4f8; padding: 12px 18px; border-left: 4px solid #003366; font-weight: bold; color: #003366; margin: 15px 0; }
        .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 13px; text-align: center; color: #777; }
        .btn-print { display: block; width: 100%; text-align: center; padding: 12px; background: #003366; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 25px; font-family: 'Helvetica', sans-serif; font-weight: bold; }
        @media print { .btn-print { display: none; } body { background: #fff; padding: 0; } }
    </style>
</head>
<body>
    <div class="letter-card">
        <div class="header">
            <h1>CrestOak College of Health Technology</h1>
            <p>Office of the Registrar • Admissions & Student Affairs</p>
        </div>

        <div class="ref-date">
            <span>Ref: <?php echo $refNo; ?></span>
            <span>Date: <?php echo $dateFormatted; ?></span>
        </div>

        <div class="salutation">Dear <?php echo htmlspecialchars($app['applicant_name']); ?>,</div>

        <div class="content">
            <p>We are pleased to inform you that you have been offered <strong>Provisional Admission</strong> into CrestOak College of Health Technology for the upcoming academic session.</p>

            <div class="program-box">
                Program Admitted: <?php echo htmlspecialchars($app['program_applied']); ?>
            </div>

            <p>This offer is subject to the verification of your educational qualifications and completion of the institutional fee payments. Please log into the Student Portal to process your acceptance and download your payment schedules.</p>
        </div>

        <div class="footer">
            <p><strong>Signed:</strong> Registrar, CrestOak College of Health Technology</p>
        </div>

        <a href="#" onclick="window.print(); return false;" class="btn-print">Print / Save Admission Letter (PDF)</a>
    </div>
</body>
</html>
<?php $conn->close(); ?>
