<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN']);

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $staffList = [];
    $res = $conn->query("SELECT * FROM staff WHERE isDeleted = 0 OR isDeleted IS NULL ORDER BY id DESC");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: ($row['username'] ?? 'Staff Member');
            $staffList[] = [
                'id' => (string)$row['id'],
                'staffId' => $row['staff_no'] ?? (string)$row['id'],
                'staffNo' => $row['staff_no'] ?? (string)$row['id'],
                'sin' => $row['staff_no'] ?? (string)$row['id'],
                'name' => $fullName,
                'firstName' => $row['first_name'] ?? '',
                'lastName' => $row['last_name'] ?? '',
                'email' => $row['email'] ?? '',
                'username' => $row['username'] ?? '',
                'role' => strtoupper($row['role_name'] ?? $row['role'] ?? 'LECTURER'),
                'department' => $row['department_name'] ?? 'General Studies'
            ];
        }
    }
    $conn->close();

    $departments = [
        ['id' => 'dept-health-001', 'name' => 'Department of Nursing Sciences', 'code' => 'NUR'],
        ['id' => 'dept-health-002', 'name' => 'Department of Medical Laboratory Science', 'code' => 'MLS'],
        ['id' => 'dept-health-003', 'name' => 'Department of Community Health Sciences', 'code' => 'CHEW'],
        ['id' => 'dept-mgmt-001', 'name' => 'Department of Business Administration', 'code' => 'BUS'],
        ['id' => 'dept-tech-001', 'name' => 'Department of Computer Science & IT', 'code' => 'CSC'],
    ];

    echo json_encode([
        'success' => true,
        'staff' => $staffList,
        'staffList' => $staffList,
        'departments' => $departments
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    validate_csrf();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];

    $firstName = trim($input['firstName'] ?? $input['name'] ?? '');
    $lastName = trim($input['lastName'] ?? '');
    $email = trim($input['email'] ?? '');
    $username = trim($input['username'] ?? $input['staffNo'] ?? $email);
    $staffNo = trim($input['staffNo'] ?? $input['staffId'] ?? 'STAFF/' . rand(100, 999) . '/' . date('Y'));
    $role = strtoupper(trim($input['role'] ?? 'LECTURER'));
    $department = trim($input['department'] ?? 'General Studies');
    $password = trim($input['password'] ?? 'Staff@2026');
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO staff (first_name, last_name, email, username, staff_no, password_hash, role, role_name, department_name, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)");
    if ($stmt) {
        $stmt->bind_param("sssssssss", $firstName, $lastName, $email, $username, $staffNo, $passwordHash, $role, $role, $department);
        $stmt->execute();
        $newId = $stmt->insert_id;
        $stmt->close();
    }
    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'Staff record saved successfully.',
        'id' => (string)($newId ?? rand(100, 999))
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'DELETE') {
    validate_csrf();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_GET ?? [];
    $staffId = (int)($input['id'] ?? 0);

    if ($staffId > 0) {
        $stmt = $conn->prepare("UPDATE staff SET isDeleted = 1 WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $staffId);
            $stmt->execute();
            $stmt->close();
        }
    }
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Staff record removed.'], JSON_UNESCAPED_SLASHES);
    exit();
}

$conn->close();
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
exit();
