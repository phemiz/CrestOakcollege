<?php
require_once __DIR__ . '/db.php';

$conn = getDbConnection();

$studentsCount = 0;
$staffCount = 0;
$coursesCount = 0;
$pendingAppsCount = 0;
$totalRevenue = 0.0;
$activeSession = ["name" => "2026/2027 Academic Session"];
$recentAudits = [];

if ($conn) {
    // 1. Students Count
    $res = @$conn->query("SELECT COUNT(*) as cnt FROM Student WHERE isDeleted = 0 OR isDeleted IS NULL");
    if ($res && $row = $res->fetch_assoc()) {
        $studentsCount = intval($row['cnt']);
    }

    // 2. Staff Count
    $res = @$conn->query("SELECT COUNT(*) as cnt FROM Staff WHERE isDeleted = 0 OR isDeleted IS NULL");
    if ($res && $row = $res->fetch_assoc()) {
        $staffCount = intval($row['cnt']);
    }

    // 3. Programmes / Courses Count
    $res = @$conn->query("SELECT COUNT(*) as cnt FROM Programme WHERE isDeleted = 0 OR isDeleted IS NULL");
    if ($res && $row = $res->fetch_assoc()) {
        $coursesCount = intval($row['cnt']);
    }

    // 4. Pending Applications Count
    $res = @$conn->query("SELECT COUNT(*) as cnt FROM Application WHERE status IN ('PENDING', 'SUBMITTED', 'UNDER_REVIEW') AND (isDeleted = 0 OR isDeleted IS NULL)");
    if ($res && $row = $res->fetch_assoc()) {
        $pendingAppsCount = intval($row['cnt']);
    }

    // 5. Total Settled Revenue
    $res = @$conn->query("SELECT SUM(amount) as total FROM Invoice WHERE status = 'PAID' AND (isDeleted = 0 OR isDeleted IS NULL)");
    if ($res && $row = $res->fetch_assoc()) {
        $totalRevenue = floatval($row['total'] ?? 0.0);
    }
    if ($totalRevenue == 0.0) {
        $resPay = @$conn->query("SELECT SUM(amountPaid) as total FROM Payment WHERE status IN ('PAID', 'SUCCESS') AND (isDeleted = 0 OR isDeleted IS NULL)");
        if ($resPay && $rowPay = $resPay->fetch_assoc()) {
            $totalRevenue = floatval($rowPay['total'] ?? 0.0);
        }
    }

    // 6. Recent Audit Logs
    $res = @$conn->query("SELECT a.*, u.firstName, u.lastName, u.email FROM AuditLog a LEFT JOIN User u ON a.userId = u.id ORDER BY a.createdAt DESC LIMIT 10");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $recentAudits[] = [
                "id" => $row['id'],
                "createdAt" => $row['createdAt'],
                "action" => $row['action'],
                "entity" => $row['entity'],
                "entityId" => $row['entityId'] ?? null,
                "ipAddress" => $row['ipAddress'] ?? null,
                "user" => [
                    "firstName" => $row['firstName'] ?? 'System',
                    "lastName" => $row['lastName'] ?? 'User',
                    "email" => $row['email'] ?? 'admin@crestoakcollege.com.ng'
                ]
            ];
        }
    }

    $conn->close();
}

echo json_encode([
    "success" => true,
    "data" => [
        "studentsCount" => $studentsCount,
        "staffCount" => $staffCount,
        "coursesCount" => $coursesCount,
        "pendingAppsCount" => $pendingAppsCount,
        "totalRevenue" => $totalRevenue,
        "activeSession" => $activeSession,
        "recentAudits" => $recentAudits
    ]
]);
