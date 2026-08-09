<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN']);

$conn = getDbConnection();
$logs = [];

if ($conn) {
    $res = @$conn->query("SELECT a.*, u.name, u.email FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.id DESC LIMIT 50");
    if ($res && $res->num_rows > 0) {
        while ($row = $res->fetch_assoc()) {
            $logs[] = [
                "id" => (string)$row['id'],
                "createdAt" => $row['created_at'] ?? date('c'),
                "action" => $row['action'] ?? 'LOG',
                "entity" => $row['entity'] ?? 'SYSTEM',
                "entityId" => $row['entity_id'] ?? null,
                "ipAddress" => $row['ip_address'] ?? null,
                "user" => [
                    "firstName" => $row['name'] ?? 'System',
                    "lastName" => '',
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
], JSON_UNESCAPED_SLASHES);
