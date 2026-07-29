<?php
require_once __DIR__ . '/db.php';

$conn = getDbConnection();
$logs = [];

if ($conn) {
    $res = @$conn->query("SELECT a.*, u.firstName, u.lastName, u.email FROM AuditLog a LEFT JOIN User u ON a.userId = u.id ORDER BY a.createdAt DESC LIMIT 50");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $logs[] = [
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
    "logs" => $logs
]);
