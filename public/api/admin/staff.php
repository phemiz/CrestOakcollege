<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$conn = getDbConnection();

$defaultDepartments = [
    ["id" => "dept-health-001", "name" => "Department of Nursing Sciences"],
    ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science"],
    ["id" => "dept-health-003", "name" => "Department of Community Health Sciences"],
    ["id" => "dept-mgmt-001", "name" => "Department of Business Administration"],
    ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT"]
];

$defaultRoles = [
    ["id" => "role-admin", "name" => "ADMIN"],
    ["id" => "role-lecturer", "name" => "LECTURER"],
    ["id" => "role-bursar", "name" => "BURSARY"],
    ["id" => "role-registrar", "name" => "REGISTRAR"]
];

$defaultStaff = [
    [
        "id" => "staff-001",
        "staffNo" => "CCHMS/STAFF/NUR/001",
        "designation" => "Senior Lecturer & Clinical Supervisor",
        "joiningDate" => "2024-09-01",
        "user" => [
            "id" => "u-staff-001",
            "username" => "emmanuel.adeyemi",
            "firstName" => "Dr. Emmanuel",
            "lastName" => "Adeyemi",
            "middleName" => "Oluwaseun",
            "email" => "emmanuel.adeyemi@crestoakcollege.com.ng",
            "phoneNumber" => "08023456789",
            "role" => ["name" => "LECTURER"]
        ],
        "department" => ["id" => "dept-health-001", "name" => "Department of Nursing Sciences"],
        "lecturer" => [
            "rank" => "SENIOR_LECTURER",
            "specialization" => "Clinical Nursing & Maternal Health"
        ]
    ],
    [
        "id" => "staff-002",
        "staffNo" => "CCHMS/STAFF/BUS/001",
        "designation" => "Bursary Financial Accountant",
        "joiningDate" => "2025-01-15",
        "user" => [
            "id" => "u-staff-002",
            "username" => "grace.okoro",
            "firstName" => "Grace",
            "lastName" => "Okoro",
            "middleName" => "Chidimma",
            "email" => "grace.okoro@crestoakcollege.com.ng",
            "phoneNumber" => "08129876543",
            "role" => ["name" => "BURSAR"]
        ],
        "department" => ["id" => "dept-mgmt-001", "name" => "Department of Business Administration"],
        "lecturer" => null
    ]
];

if ($method === 'GET') {
    $staffList = $defaultStaff;

    if ($conn) {
        $res = $conn->query("SELECT s.*, u.username, u.firstName, u.lastName, u.middleName, u.email, u.phoneNumber, r.name as roleName, d.name as deptName, l.rank, l.specialization FROM Staff s JOIN User u ON s.id = u.id LEFT JOIN Role r ON u.roleId = r.id LEFT JOIN Department d ON s.departmentId = d.id LEFT JOIN Lecturer l ON s.id = l.id WHERE s.isDeleted = 0 OR s.isDeleted IS NULL");
        if ($res && $res->num_rows > 0) {
            $dbStaff = [];
            while ($row = $res->fetch_assoc()) {
                $dbStaff[] = [
                    "id" => $row['id'],
                    "staffNo" => $row['staffNo'],
                    "designation" => $row['designation'],
                    "joiningDate" => $row['joiningDate'] ?? date('Y-m-d'),
                    "user" => [
                        "id" => $row['id'],
                        "username" => $row['username'] ?? '',
                        "firstName" => $row['firstName'],
                        "lastName" => $row['lastName'],
                        "middleName" => $row['middleName'],
                        "email" => $row['email'],
                        "phoneNumber" => $row['phoneNumber'],
                        "role" => ["name" => $row['roleName'] ?? 'STAFF']
                    ],
                    "department" => ["id" => $row['departmentId'], "name" => $row['deptName'] ?? 'Department'],
                    "lecturer" => $row['rank'] ? [
                        "rank" => $row['rank'],
                        "specialization" => $row['specialization']
                    ] : null
                ];
            }
            if (count($dbStaff) > 0) {
                $staffList = $dbStaff;
            }
        }
        $conn->close();
    }

    echo json_encode([
        "success" => true,
        "staffList" => $staffList,
        "departments" => $defaultDepartments,
        "roles" => $defaultRoles
    ]);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    $id = $input['id'] ?? ('staff-' . rand(1000, 9999));
    $staffNo = $input['staffNo'] ?? ('CCHMS/STAFF/REG/' . str_pad(rand(1, 99), 3, '0', STR_PAD_LEFT));
    $firstName = $input['firstName'] ?? '';
    $lastName = $input['lastName'] ?? '';
    $middleName = $input['middleName'] ?? '';
    $username = $input['username'] ?? (strtolower($firstName) . '.' . strtolower($lastName));
    $email = $input['email'] ?? '';
    $phone = $input['phoneNumber'] ?? ($input['phone'] ?? '');
    $roleName = $input['roleName'] ?? ($input['role'] ?? 'LECTURER');
    $departmentId = $input['departmentId'] ?? 'dept-health-001';
    $designation = $input['designation'] ?? 'Staff';
    $joiningDate = $input['joiningDate'] ?? date('Y-m-d');
    $rawPassword = $input['password'] ?? '';
    $passwordHash = !empty($rawPassword) ? password_hash($rawPassword, PASSWORD_DEFAULT) : null;

    if ($conn) {
        // Ensure staff table exists
        $conn->query("CREATE TABLE IF NOT EXISTS staff (
            id VARCHAR(64) PRIMARY KEY,
            staff_id VARCHAR(64),
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            middle_name VARCHAR(100),
            username VARCHAR(100),
            email VARCHAR(150),
            phone VARCHAR(50),
            role VARCHAR(50),
            department VARCHAR(150),
            designation VARCHAR(150),
            password_hash VARCHAR(255),
            joining_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Insert or Update into staff table
        if ($passwordHash) {
            $stmt = $conn->prepare("INSERT INTO staff (id, staff_id, first_name, last_name, middle_name, username, email, phone, role, department, designation, password_hash, joining_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                staff_id = VALUES(staff_id),
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                middle_name = VALUES(middle_name),
                username = VALUES(username),
                email = VALUES(email),
                phone = VALUES(phone),
                role = VALUES(role),
                department = VALUES(department),
                designation = VALUES(designation),
                password_hash = VALUES(password_hash),
                joining_date = VALUES(joining_date)");
            if ($stmt) {
                $stmt->bind_param("sssssssssssss", $id, $staffNo, $firstName, $lastName, $middleName, $username, $email, $phone, $roleName, $departmentId, $designation, $passwordHash, $joiningDate);
                $stmt->execute();
                $stmt->close();
            }
        } else {
            $stmt = $conn->prepare("INSERT INTO staff (id, staff_id, first_name, last_name, middle_name, username, email, phone, role, department, designation, joining_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                staff_id = VALUES(staff_id),
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                middle_name = VALUES(middle_name),
                username = VALUES(username),
                email = VALUES(email),
                phone = VALUES(phone),
                role = VALUES(role),
                department = VALUES(department),
                designation = VALUES(designation),
                joining_date = VALUES(joining_date)");
            if ($stmt) {
                $stmt->bind_param("ssssssssssss", $id, $staffNo, $firstName, $lastName, $middleName, $username, $email, $phone, $roleName, $departmentId, $designation, $joiningDate);
                $stmt->execute();
                $stmt->close();
            }
        }

        // Sync into users table for unified login API
        $conn->query("CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            username VARCHAR(100),
            email VARCHAR(150),
            password_hash VARCHAR(255),
            role VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        if ($passwordHash) {
            $stmtUser = $conn->prepare("INSERT INTO users (id, username, email, password_hash, role)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                username = VALUES(username),
                email = VALUES(email),
                password_hash = VALUES(password_hash),
                role = VALUES(role)");
            if ($stmtUser) {
                $stmtUser->bind_param("sssss", $id, $username, $email, $passwordHash, $roleName);
                $stmtUser->execute();
                $stmtUser->close();
            }
        } else {
            $stmtUser = $conn->prepare("INSERT INTO users (id, username, email, role)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                username = VALUES(username),
                email = VALUES(email),
                role = VALUES(role)");
            if ($stmtUser) {
                $stmtUser->bind_param("ssss", $id, $username, $email, $roleName);
                $stmtUser->execute();
                $stmtUser->close();
            }
        }

        $conn->close();
    }

    echo json_encode([
        "success" => true,
        "message" => "Staff profile updated and synchronized successfully.",
        "staff" => [
            "id" => $id,
            "staffNo" => $staffNo,
            "designation" => $designation,
            "joiningDate" => $joiningDate,
            "user" => [
                "id" => $id,
                "username" => $username,
                "firstName" => $firstName,
                "lastName" => $lastName,
                "middleName" => $middleName,
                "email" => $email,
                "phoneNumber" => $phone,
                "role" => ["name" => $roleName]
            ],
            "department" => ["id" => $departmentId, "name" => "Selected Department"],
            "lecturer" => $roleName === 'LECTURER' ? [
                "rank" => $input['rank'] ?? 'LECTURER_II',
                "specialization" => $input['specialization'] ?? ''
            ] : null
        ]
    ]);
    exit();
}

if ($method === 'DELETE') {
    if ($conn) {
        $stmt = $conn->prepare("UPDATE staff SET isDeleted = 1 WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("s", $input['id']);
            $stmt->execute();
            $stmt->close();
        }
        $conn->close();
    }
    echo json_encode(["success" => true, "message" => "Staff member deleted successfully."]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
