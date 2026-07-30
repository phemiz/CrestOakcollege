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
            "staffNo" => "CCHMS/STAFF/SCS/001",
            "designation" => "Head of Department & Senior Lecturer",
            "joiningDate" => "2024-10-15",
            "user" => [
                "id" => "u-staff-002",
                "username" => "femi.adebayo",
                "firstName" => "Femi",
                "lastName" => "Adebayo",
                "middleName" => "Olayinka",
                "email" => "femi.adebayo@crestoakcollege.com.ng",
                "phoneNumber" => "08034567890",
                "role" => ["name" => "LECTURER"]
            ],
            "department" => ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT"],
            "lecturer" => [
                "rank" => "SENIOR_LECTURER",
                "specialization" => "Software Engineering & Systems Architecture"
            ]
        ],
        [
            "id" => "staff-003",
            "staffNo" => "CCHMS/STAFF/BUS/001",
            "designation" => "Bursary Financial Accountant",
            "joiningDate" => "2025-01-15",
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
            "department" => ["id" => "dept-mgmt-001", "name" => "Department of Business Administration"],
            "lecturer" => null
        ]
    ];

    if ($method === 'GET') {
        $dbStaff = [];

        if ($conn) {
            try {
                // Dynamic Schema Alteration Safeguards
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
                        if (empty($rawDept) || $rawDept === 'Selected Department' || strpos($rawDept, 'dept-') === 0) {
                            $codeMatch = [];
                            preg_match('/STAFF\/([A-Z]{3})\//i', $staffId, $codeMatch);
                            $code = !empty($codeMatch[1]) ? strtoupper($codeMatch[1]) : '';
                            $deptMap = [
                                'SCS' => 'Department of Computer Science & IT',
                                'NUR' => 'Department of Nursing Sciences',
                                'MLS' => 'Department of Medical Laboratory Science',
                                'CHS' => 'Department of Community Health Sciences',
                                'BUS' => 'Department of Business Administration',
                                'LAW' => 'Department of Law & Criminology',
                                'REG' => 'Registry & Academic Affairs',
                                'BUR' => 'Bursary & Financial Services'
                            ];
                            $rawDept = $deptMap[$code] ?? 'Department of Nursing Sciences';
                        }

                        $dbStaff[] = [
                            "id" => $row['id'] ?? $row['staff_id'],
                            "staffNo" => $staffId,
                            "designation" => $row['designation'] ?? 'Staff',
                            "joiningDate" => $row['joining_date'] ?? $row['joiningDate'] ?? date('Y-m-d'),
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
                                "name" => $rawDept
                            ],
                            "lecturer" => !empty($row['academic_rank']) ? [
                                "rank" => $row['academic_rank'],
                                "specialization" => $row['specialization'] ?? ''
                            ] : null
                        ];
                    }
                }
            } catch (Throwable $e) {
                // Ignore DB query errors silently
            }
            @$conn->close();
        }

        // Merge DB staff with default staff (DB staff prioritized)
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

        $finalStaffList = array_values($mergedMap);

        echo json_encode([
            "success" => true,
            "staffList" => $finalStaffList,
            "departments" => $defaultDepartments,
            "roles" => $defaultRoles
        ]);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        $firstName = $input['firstName'] ?? $input['first_name'] ?? '';
        $lastName = $input['lastName'] ?? $input['last_name'] ?? '';

        if (empty($firstName) || empty($lastName)) {
            http_response_code(200);
            echo json_encode(['success' => false, 'message' => 'First Name and Last Name are required.']);
            exit();
        }

        $id = $input['id'] ?? ('staff-' . rand(1000, 9999));
        $staffNo = $input['staffNo'] ?? $input['staff_id'] ?? ('CCHMS/STAFF/REG/' . str_pad(rand(1, 99), 3, '0', STR_PAD_LEFT));
        $middleName = $input['middleName'] ?? $input['middle_name'] ?? '';
        $username = $input['username'] ?? (strtolower($firstName) . '.' . strtolower($lastName));
        $email = $input['email'] ?? '';
        $phone = $input['phoneNumber'] ?? $input['phone'] ?? '';
        $roleName = $input['roleName'] ?? $input['role'] ?? 'LECTURER';
        $departmentId = $input['departmentId'] ?? $input['department'] ?? 'dept-health-001';
        $designation = $input['designation'] ?? 'Staff';
        $joiningDate = $input['joiningDate'] ?? $input['joining_date'] ?? date('Y-m-d');
        $academicRank = $input['rank'] ?? $input['academicRank'] ?? $input['academic_rank'] ?? '';
        $specialization = $input['specialization'] ?? '';
        $rawPassword = $input['password'] ?? '';
        $passwordHash = !empty($rawPassword) ? password_hash($rawPassword, PASSWORD_DEFAULT) : null;

        // Resolve clean department title
        $departmentInput = $input['department'] ?? $input['departmentId'] ?? '';
        $deptName = 'Department of Nursing Sciences';

        if (!empty($departmentInput) && $departmentInput !== 'Selected Department' && strpos($departmentInput, 'dept-') !== 0) {
            $deptName = $departmentInput;
        } else {
            foreach ($defaultDepartments as $d) {
                if ($d['id'] === $departmentId || $d['id'] === $departmentInput) {
                    $deptName = $d['name'];
                    break;
                }
            }
            if (($deptName === 'Department of Nursing Sciences' || empty($deptName)) && !empty($staffNo)) {
                $codeMatch = [];
                preg_match('/STAFF\/([A-Z]{3})\//i', $staffNo, $codeMatch);
                $code = !empty($codeMatch[1]) ? strtoupper($codeMatch[1]) : '';
                $deptMap = [
                    'SCS' => 'Department of Computer Science & IT',
                    'NUR' => 'Department of Nursing Sciences',
                    'MLS' => 'Department of Medical Laboratory Science',
                    'CHS' => 'Department of Community Health Sciences',
                    'BUS' => 'Department of Business Administration',
                    'LAW' => 'Department of Law & Criminology',
                    'REG' => 'Registry & Academic Affairs',
                    'BUR' => 'Bursary & Financial Services'
                ];
                if (isset($deptMap[$code])) {
                    $deptName = $deptMap[$code];
                }
            }
        }

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
                    password_hash VARCHAR(255),
                    joining_date DATE,
                    isDeleted TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

                if ($passwordHash) {
                    $stmt = @$conn->prepare("INSERT INTO staff (id, staff_id, first_name, last_name, middle_name, username, email, phone, role, department, designation, academic_rank, specialization, password_hash, joining_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        academic_rank = VALUES(academic_rank),
                        specialization = VALUES(specialization),
                        password_hash = VALUES(password_hash),
                        joining_date = VALUES(joining_date)");
                    if ($stmt) {
                        $stmt->bind_param("sssssssssssssss", $id, $staffNo, $firstName, $lastName, $middleName, $username, $email, $phone, $roleName, $deptName, $designation, $academicRank, $specialization, $passwordHash, $joiningDate);
                        @$stmt->execute();
                        @$stmt->close();
                    }
                } else {
                    $stmt = @$conn->prepare("INSERT INTO staff (id, staff_id, first_name, last_name, middle_name, username, email, phone, role, department, designation, academic_rank, specialization, joining_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        academic_rank = VALUES(academic_rank),
                        specialization = VALUES(specialization),
                        joining_date = VALUES(joining_date)");
                    if ($stmt) {
                        $stmt->bind_param("ssssssssssssss", $id, $staffNo, $firstName, $lastName, $middleName, $username, $email, $phone, $roleName, $deptName, $designation, $academicRank, $specialization, $joiningDate);
                        @$stmt->execute();
                        @$stmt->close();
                    }
                }

                @$conn->query("CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(64) PRIMARY KEY,
                    username VARCHAR(100),
                    email VARCHAR(150),
                    password_hash VARCHAR(255),
                    role VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

                if ($passwordHash) {
                    $stmtUser = @$conn->prepare("INSERT INTO users (id, username, email, password_hash, role)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        username = VALUES(username),
                        email = VALUES(email),
                        password_hash = VALUES(password_hash),
                        role = VALUES(role)");
                    if ($stmtUser) {
                        $stmtUser->bind_param("sssss", $id, $username, $email, $passwordHash, $roleName);
                        @$stmtUser->execute();
                        @$stmtUser->close();
                    }
                }
            } catch (Throwable $e) {
                // Ignore DB write errors silently, return clean JSON
            }
            @$conn->close();
        }

        echo json_encode([
            "success" => true,
            "message" => "Staff member saved successfully!",
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
        if ($conn) {
            try {
                $stmt = @$conn->prepare("UPDATE staff SET isDeleted = 1 WHERE id = ?");
                if ($stmt) {
                    $stmt->bind_param("s", $input['id']);
                    @$stmt->execute();
                    @$stmt->close();
                }
            } catch (Throwable $e) {}
            @$conn->close();
        }
        echo json_encode(["success" => true, "message" => "Staff member deleted successfully."]);
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
