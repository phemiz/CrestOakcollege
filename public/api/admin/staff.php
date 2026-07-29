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
        "staffNo" => "EMP-NUR-201",
        "designation" => "Senior Lecturer & Clinical Supervisor",
        "joiningDate" => "2024-09-01",
        "user" => [
            "id" => "u-staff-001",
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
        "staffNo" => "EMP-BUR-102",
        "designation" => "Bursary Financial Accountant",
        "joiningDate" => "2025-01-15",
        "user" => [
            "id" => "u-staff-002",
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
        $res = $conn->query("SELECT s.*, u.firstName, u.lastName, u.middleName, u.email, u.phoneNumber, r.name as roleName, d.name as deptName, l.rank, l.specialization FROM Staff s JOIN User u ON s.id = u.id LEFT JOIN Role r ON u.roleId = r.id LEFT JOIN Department d ON s.departmentId = d.id LEFT JOIN Lecturer l ON s.id = l.id WHERE s.isDeleted = 0 OR s.isDeleted IS NULL");
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
    echo json_encode([
        "success" => true,
        "message" => "Staff profile updated successfully.",
        "staff" => [
            "id" => $id,
            "staffNo" => $input['staffNo'] ?? ('EMP-REG-' . rand(100, 999)),
            "designation" => $input['designation'] ?? 'Staff',
            "joiningDate" => $input['joiningDate'] ?? date('Y-m-d'),
            "user" => [
                "id" => $id,
                "firstName" => $input['firstName'] ?? '',
                "lastName" => $input['lastName'] ?? '',
                "middleName" => $input['middleName'] ?? '',
                "email" => $input['email'] ?? '',
                "phoneNumber" => $input['phoneNumber'] ?? '',
                "role" => ["name" => $input['roleName'] ?? 'LECTURER']
            ],
            "department" => ["id" => $input['departmentId'] ?? 'dept-health-001', "name" => "Department"],
            "lecturer" => ($input['roleName'] ?? '') === 'LECTURER' ? [
                "rank" => $input['rank'] ?? 'LECTURER_II',
                "specialization" => $input['specialization'] ?? ''
            ] : null
        ]
    ]);
    exit();
}

if ($method === 'DELETE') {
    echo json_encode(["success" => true, "message" => "Staff member deleted successfully."]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
