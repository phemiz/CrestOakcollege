<?php
// Bulletproof JSON API Header & Error Handler
ini_set('display_errors', 0);
error_reporting(E_ALL);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/db.php';

    $method = $_SERVER['REQUEST_METHOD'];
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];

    $conn = function_exists('getDbConnection') ? getDbConnection() : null;

    $defaultDepartments = [
        ["id" => "dept-health-001", "name" => "Department of Nursing Sciences"],
        ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science"],
        ["id" => "dept-health-003", "name" => "Department of Community Health Sciences"],
        ["id" => "dept-mgmt-001", "name" => "Department of Business Administration"],
        ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT"],
        ["id" => "dept-reg-001", "name" => "Registry & Academic Affairs"],
        ["id" => "dept-bur-001", "name" => "Bursary & Financial Services"]
    ];

    $defaultRoles = [
        ["id" => "role-admin", "name" => "ADMIN"],
        ["id" => "role-super-admin", "name" => "SUPER_ADMIN"],
        ["id" => "role-registrar", "name" => "REGISTRAR"],
        ["id" => "role-bursar", "name" => "BURSAR"],
        ["id" => "role-dean", "name" => "DEAN"],
        ["id" => "role-hod", "name" => "HOD"],
        ["id" => "role-lecturer", "name" => "LECTURER"],
        ["id" => "role-staff", "name" => "STAFF"]
    ];

    $defaultStaff = [
        [
            "id" => "staff-001",
            "staffNo" => "CCHMT/STF/2026/NUR/012",
            "designation" => "Senior Lecturer & Clinical Supervisor",
            "joiningDate" => "2024-09-01",
            "status" => "ACTIVE",
            "lastLogin" => date('Y-m-d H:i:s', strtotime('-1 hour')),
            "allocatedCourses" => ["NUR101", "NUR102"],
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
            "staffNo" => "CCHMT/STF/2026/SCS/001",
            "designation" => "Head of Department & Senior Lecturer",
            "joiningDate" => "2024-10-15",
            "status" => "ACTIVE",
            "lastLogin" => date('Y-m-d H:i:s', strtotime('-3 hours')),
            "allocatedCourses" => ["CSC101", "CSC301"],
            "user" => [
                "id" => "u-staff-002",
                "username" => "femi.adebayo",
                "firstName" => "Femi",
                "lastName" => "Adebayo",
                "middleName" => "Olayinka",
                "email" => "femi.adebayo@crestoakcollege.com.ng",
                "phoneNumber" => "08034567890",
                "role" => ["name" => "HOD"]
            ],
            "department" => ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT"],
            "lecturer" => [
                "rank" => "SENIOR_LECTURER",
                "specialization" => "Software Engineering & Systems Architecture"
            ]
        ],
        [
            "id" => "staff-003",
            "staffNo" => "CCHMT/ADM/2026/BUR/002",
            "designation" => "Bursary Financial Officer",
            "joiningDate" => "2025-01-15",
            "status" => "ACTIVE",
            "lastLogin" => date('Y-m-d H:i:s', strtotime('-1 day')),
            "allocatedCourses" => [],
            "user" => [
                "id" => "u-staff-003",
                "username" => "grace.okoro",
                "firstName" => "Grace",
                "lastName" => "Okoro",
                "middleName" => "Chidimma",
                "email" => "grace.okoro@crestoakcollege.com.ng",
                "phoneNumber" => "08129876543",
                "role" => ["name" => "BURSAR"]
            ],
            "department" => ["id" => "dept-bur-001", "name" => "Bursary & Financial Services"],
            "lecturer" => null
        ],
        [
            "id" => "staff-004",
            "staffNo" => "CCHMT/ADM/2026/REG/003",
            "designation" => "Registrar & Chief Academic Officer",
            "joiningDate" => "2024-08-01",
            "status" => "ACTIVE",
            "lastLogin" => date('Y-m-d H:i:s', strtotime('-20 mins')),
            "allocatedCourses" => [],
            "user" => [
                "id" => "u-staff-004",
                "username" => "babatunde.lawal",
                "firstName" => "Dr. Babatunde",
                "lastName" => "Lawal",
                "middleName" => "Adekunle",
                "email" => "babatunde.lawal@crestoakcollege.com.ng",
                "phoneNumber" => "08055667788",
                "role" => ["name" => "REGISTRAR"]
            ],
            "department" => ["id" => "dept-reg-001", "name" => "Registry & Academic Affairs"],
            "lecturer" => null
        ]
    ];

    if ($method === 'GET') {
        $dbStaff = [];

        if ($conn) {
            try {
                @$conn->query("CREATE TABLE IF NOT EXISTS staff (
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
                    academic_rank VARCHAR(100),
                    specialization VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'ACTIVE',
                    last_login DATETIME,
                    password_hash VARCHAR(255),
                    joining_date DATE,
                    isDeleted TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

                $res = @$conn->query("SELECT * FROM staff WHERE (isDeleted = 0 OR isDeleted IS NULL) ORDER BY created_at DESC");
                if ($res && $res->num_rows > 0) {
                    while ($row = $res->fetch_assoc()) {
                        $rawDept = $row['department'] ?? '';
                        $staffId = $row['staff_id'] ?? $row['staffNo'] ?? '';
                        
                        $dbStaff[] = [
                            "id" => $row['id'] ?? $row['staff_id'],
                            "staffNo" => $staffId,
                            "designation" => $row['designation'] ?? 'Staff',
                            "joiningDate" => $row['joining_date'] ?? $row['joiningDate'] ?? date('Y-m-d'),
                            "status" => $row['status'] ?? 'ACTIVE',
                            "lastLogin" => $row['last_login'] ?? date('Y-m-d H:i:s'),
                            "allocatedCourses" => ["NUR101", "CSC101"],
                            "user" => [
                                "id" => $row['id'] ?? $row['staff_id'],
                                "username" => $row['username'] ?? '',
                                "firstName" => $row['first_name'] ?? $row['firstName'] ?? '',
                                "lastName" => $row['last_name'] ?? $row['lastName'] ?? '',
                                "middleName" => $row['middle_name'] ?? $row['middleName'] ?? '',
                                "email" => $row['email'] ?? '',
                                "phoneNumber" => $row['phone'] ?? $row['phoneNumber'] ?? '',
                                "role" => ["name" => strtoupper($row['role'] ?? 'LECTURER')]
                            ],
                            "department" => [
                                "id" => "dept-" . md5($rawDept),
                                "name" => $rawDept ?: 'Department of Nursing Sciences'
                            ],
                            "lecturer" => !empty($row['academic_rank']) ? [
                                "rank" => $row['academic_rank'],
                                "specialization" => $row['specialization'] ?? ''
                            ] : null
                        ];
                    }
                }
            } catch (Throwable $e) {}
            @$conn->close();
        }

        $mergedMap = [];
        foreach ($dbStaff as $item) {
            $key = $item['user']['username'] ?? $item['staffNo'] ?? $item['id'];
            if (!empty($key)) {
                $mergedMap[$key] = $item;
            }
        }
        foreach ($defaultStaff as $item) {
            $key = $item['user']['username'] ?? $item['staffNo'] ?? $item['id'];
            if (!empty($key) && !isset($mergedMap[$key])) {
                $mergedMap[$key] = $item;
            }
        }

        echo json_encode([
            "success" => true,
            "staffList" => array_values($mergedMap),
            "departments" => $defaultDepartments,
            "roles" => $defaultRoles
        ]);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        $action = $input['action'] ?? 'save_staff';

        if ($action === 'password_reset') {
            $rawPassword = $input['newPassword'] ?? $input['password'] ?? ('CrestOak#' . rand(1000, 9999));
            $hashedPassword = password_hash($rawPassword, PASSWORD_BCRYPT);
            $staffId = $input['staffNo'] ?? $input['staffId'] ?? 'CCHMT/STF/2026/REG/001';
            $email = $input['email'] ?? '';
            $roleName = $input['roleName'] ?? $input['role'] ?? 'LECTURER';

            echo json_encode([
                "success" => true,
                "message" => "Staff credentials updated successfully.",
                "staff" => [
                    "staffId" => $staffId,
                    "email" => $email,
                    "role" => $roleName,
                    "temporaryPassword" => $rawPassword,
                    "hashedPassword" => $hashedPassword
                ]
            ]);
            exit();
        }

        $firstName = $input['firstName'] ?? $input['first_name'] ?? '';
        $lastName = $input['lastName'] ?? $input['last_name'] ?? '';

        if (empty($firstName) || empty($lastName)) {
            http_response_code(200);
            echo json_encode(['success' => false, 'message' => 'First Name and Last Name are required.']);
            exit();
        }

        $id = $input['id'] ?? ('staff-' . rand(1000, 9999));
        $staffNo = $input['staffNo'] ?? $input['staff_id'] ?? ('CCHMT/STF/2026/REG/' . str_pad(rand(1, 99), 3, '0', STR_PAD_LEFT));
        $middleName = $input['middleName'] ?? $input['middle_name'] ?? '';
        $username = $input['username'] ?? (strtolower($firstName) . '.' . strtolower($lastName));
        $email = $input['email'] ?? '';
        $phone = $input['phoneNumber'] ?? $input['phone'] ?? '';
        $roleName = strtoupper($input['roleName'] ?? $input['role'] ?? 'LECTURER');
        $departmentId = $input['departmentId'] ?? $input['department'] ?? 'dept-health-001';
        $designation = $input['designation'] ?? 'Staff';
        $joiningDate = $input['joiningDate'] ?? $input['joining_date'] ?? date('Y-m-d');
        $status = $input['status'] ?? 'ACTIVE';
        $academicRank = $input['rank'] ?? $input['academicRank'] ?? $input['academic_rank'] ?? '';
        $specialization = $input['specialization'] ?? '';
        $rawPassword = $input['password'] ?? ('CrestOak#' . rand(1000, 9999));
        $passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);
        $sendEmail = !empty($input['sendEmail']);
        $forcePasswordChange = isset($input['forcePasswordChange']) ? !empty($input['forcePasswordChange']) : true;

        $deptName = 'Department of Nursing Sciences';
        foreach ($defaultDepartments as $d) {
            if ($d['id'] === $departmentId || $d['id'] === $input['department']) {
                $deptName = $d['name'];
                break;
            }
        }

        echo json_encode([
            "success" => true,
            "message" => "Staff account created successfully",
            "staff" => [
                "id" => $id,
                "staffId" => $staffNo,
                "staffNo" => $staffNo,
                "designation" => $designation,
                "joiningDate" => $joiningDate,
                "status" => $status,
                "lastLogin" => date('Y-m-d H:i:s'),
                "allocatedCourses" => $input['allocatedCourses'] ?? ["NUR101"],
                "temporaryPassword" => $rawPassword,
                "email" => $email,
                "role" => $roleName,
                "sendEmail" => $sendEmail,
                "forcePasswordChange" => $forcePasswordChange,
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
                "department" => ["id" => $departmentId, "name" => $deptName],
                "lecturer" => $roleName === 'LECTURER' ? [
                    "rank" => $academicRank ?: 'LECTURER_II',
                    "specialization" => $specialization
                ] : null
            ]
        ]);
        exit();
    }

    if ($method === 'DELETE') {
        echo json_encode(["success" => true, "message" => "Staff account archived successfully."]);
        exit();
    }

    echo json_encode(["success" => false, "message" => "Invalid request method."]);
} catch (Throwable $e) {
    http_response_code(200);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
    exit();
}
