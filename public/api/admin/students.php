<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF']);

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $students = [];
    $res = $conn->query("SELECT * FROM students WHERE isDeleted = 0 OR isDeleted IS NULL ORDER BY id DESC");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: ($row['matric_no'] ?? 'Student');
            $students[] = [
                'id' => (string)$row['id'],
                'studentId' => (string)$row['id'],
                'matricNo' => $row['matric_no'] ?? '',
                'firstName' => $row['first_name'] ?? '',
                'lastName' => $row['last_name'] ?? '',
                'name' => $fullName,
                'email' => $row['email'] ?? '',
                'department' => $row['department_name'] ?? 'General Studies',
                'departmentName' => $row['department_name'] ?? 'General Studies',
                'level' => (int)($row['level'] ?? 100),
                'status' => 'ACTIVE'
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

    $programmes = [
        ['id' => 'prog-001', 'name' => 'Nursing Sciences (B.N.Sc)', 'code' => 'NUR'],
        ['id' => 'prog-002', 'name' => 'Medical Laboratory Science (B.MLS)', 'code' => 'MLS'],
        ['id' => 'prog-003', 'name' => 'Community Health Extension Worker (CHEW)', 'code' => 'CHEW'],
    ];

    echo json_encode([
        'success' => true,
        'students' => $students,
        'departments' => $departments,
        'programmes' => $programmes,
        'sessions' => [['id' => 'sess-001', 'name' => '2026/2027 Academic Session']],
        'semesters' => [['id' => 'sem-001', 'name' => 'First Semester']],
        'auditLogs' => []
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
    $matricNo = trim($input['matricNo'] ?? 'COH/2026/' . rand(100, 999));
    $department = trim($input['department'] ?? $input['departmentName'] ?? 'General Studies');
    $level = (int)($input['level'] ?? 100);
    $password = trim($input['password'] ?? 'Student@2026');
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO students (first_name, last_name, email, matric_no, password_hash, department_name, level, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
    if ($stmt) {
        $stmt->bind_param("ssssssi", $firstName, $lastName, $email, $matricNo, $passwordHash, $department, $level);
        $stmt->execute();
        $newId = $stmt->insert_id;
        $stmt->close();
    }
    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'Student record saved successfully.',
        'id' => (string)($newId ?? rand(100, 999)),
        'matricNo' => $matricNo
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'DELETE') {
    validate_csrf();
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_GET ?? [];
    $studentId = (int)($input['id'] ?? 0);

    if ($studentId > 0) {
        $stmt = $conn->prepare("UPDATE students SET isDeleted = 1 WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $studentId);
            $stmt->execute();
            $stmt->close();
        }
    }
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Student record deleted.'], JSON_UNESCAPED_SLASHES);
    exit();
}

$conn->close();
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
exit();
