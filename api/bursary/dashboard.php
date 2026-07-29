<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../admin/db.php';
$conn = getDbConnection();

$totalRevenue = 0.0;
$pendingInvoicesCount = 0;
$paidInvoicesCount = 0;
$recentPayments = [];

if ($conn) {
    $resR = @$conn->query("SELECT SUM(amount) as total FROM Invoice WHERE status = 'PAID'");
    if ($resR && $row = $resR->fetch_assoc()) {
        $totalRevenue = floatval($row['total'] ?? 0.0);
    }

    $resP = @$conn->query("SELECT COUNT(*) as cnt FROM Invoice WHERE status = 'PENDING'");
    if ($resP && $row = $resP->fetch_assoc()) {
        $pendingInvoicesCount = intval($row['cnt']);
    }

    $resD = @$conn->query("SELECT COUNT(*) as cnt FROM Invoice WHERE status = 'PAID'");
    if ($resD && $row = $resD->fetch_assoc()) {
        $paidInvoicesCount = intval($row['cnt']);
    }

    $resL = @$conn->query("SELECT p.*, i.title as invoiceTitle, u.firstName, u.lastName FROM Payment p LEFT JOIN Invoice i ON p.invoiceId = i.id LEFT JOIN User u ON i.userId = u.id ORDER BY p.createdAt DESC LIMIT 20");
    if ($resL && $resL->num_rows > 0) {
        while ($row = $resL->fetch_assoc()) {
            $recentPayments[] = $row;
        }
    }

    $conn->close();
}

echo json_encode([
    "success" => true,
    "totalRevenue" => $totalRevenue,
    "pendingInvoicesCount" => $pendingInvoicesCount,
    "paidInvoicesCount" => $paidInvoicesCount,
    "recentPayments" => $recentPayments
]);
