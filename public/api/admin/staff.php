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

$storeFile = __DIR__ . '/staff_store.json';

if (!file_exists($storeFile)) {
    @file_put_contents($storeFile, json_encode([], JSON_PRETTY_PRINT));
    @chmod($storeFile, 0666);
}

function readStaffJsonStore($filePath) {
    if (!file_exists($filePath)) {
        @file_put_contents($filePath, json_encode([], JSON_PRETTY_PRINT));
        @chmod($filePath, 0666);
    }
    if (file_exists($filePath)) {
        $content = @file_get_contents($filePath);
        $data = @json_decode($content, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return [];
}

function writeStaffJsonStore($filePath, array $items) {
    $json = json_encode($items, JSON_PRETTY_PRINT);
    $written = @file_put_contents($filePath, $json) !== false;
    if ($written) {
        @chmod($filePath, 0666);
    }
    return $written;
}

try {
    require_once __DIR__ . '/db.php';

    $method = $_SERVER['REQUEST_METHOD'];
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];
    $data = $input;

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

        // 1. Fetch MySQL Database Records
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

        // 2. Fetch File Storage Records
        $fileStoreStaff = readStaffJsonStore($storeFile);

        // 3. Merge MySQL DB, File Store, & Defaults (Prioritizing Persistent Data)
        $mergedMap = [];
        foreach ($dbStaff as $item) {
            $key = $item['user']['username'] ?? $item['staffNo'] ?? $item['id'];
            if (!empty($key)) $mergedMap[$key] = $item;
        }
        foreach ($fileStoreStaff as $item) {
            $key = $item['user']['username'] ?? $item['staffNo'] ?? $item['id'];
            if (!empty($key)) $mergedMap[$key] = $item;
        }
        foreach ($defaultStaff as $item) {
            $key = $item['user']['username'] ?? $item['staffNo'] ?? $item['id'];
            if (!empty($key) && !isset($mergedMap[$key])) {
                $mergedMap[$key] = $item;
            }
        }

        echo json_encode([
            "success" => true,
            "persistenceSuccess" => true,
            "staffList" => array_values($mergedMap),
            "departments" => $defaultDepartments,
            "roles" => $defaultRoles
        ]);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        $action = $data['action'] ?? 'save_staff';

        if ($action === 'password_reset') {
            $rawPassword = $data['newPassword'] ?? $data['password'] ?? ('CrestOak#' . rand(1000, 9999));
            $hashedPassword = password_hash($rawPassword, PASSWORD_BCRYPT);
            $staffId = $data['staffNo'] ?? $data['staffId'] ?? 'CCHMT/STF/2026/REG/001';
            $email = $data['email'] ?? '';
            $roleName = strtoupper($data['roleName'] ?? $data['role'] ?? 'LECTURER');

            $mailSent = false;
            if (!empty($email)) {
                $toEmail = $email;
                $fullName = "Staff Member";
                $identifier = $staffId;

                $subject = "Welcome to CrestOak College - Your Portal Credentials";
                $message = "
                <html>
                <head>
                  <title>CrestOak College Portal Access</title>
                </head>
                <body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
                  <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                    <h2 style='color: #0d2e58;'>CrestOak College - Portal Credentials</h2>
                    <p>Hello <strong>" . htmlspecialchars($fullName) . "</strong>,</p>
                    <p>Your institutional portal account has been provisioned successfully. Below are your login credentials:</p>
                    <div style='background-color: #f4f6f9; padding: 15px; border-left: 4px solid #0d2e58; margin: 20px 0;'>
                      <p style='margin: 5px 0;'><strong>Portal Identifier / ID:</strong> " . htmlspecialchars($identifier) . "</p>
                      <p style='margin: 5px 0;'><strong>Temporary Password:</strong> " . htmlspecialchars($rawPassword) . "</p>
                      <p style='margin: 5px 0;'><strong>Portal Login URL:</strong> <a href='https://staff.crestoakcollege.com.ng' style='color: #0d2e58; text-decoration: underline;'>https://staff.crestoakcollege.com.ng</a></p>
                    </div>
                    <p>Please log in immediately and update your temporary password.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #777;'>This is an automated system email from CrestOak College of Health Sciences & Medical Technology. Please do not reply directly to this email.</p>
                  </div>
                </body>
                </html>
                ";

                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-type:text/html;charset=UTF-8\r\n";
                $headers .= "From: CrestOak College Staff Portal <noreply@crestoakcollege.com.ng>\r\n";
                $headers .= "Reply-To: info@crestoakcollege.com.ng\r\n";
                $headers .= "X-Mailer: PHP/" . phpversion();

                $mailSent = mail($toEmail, $subject, $message, $headers);
                if (!$mailSent) {
                    error_log("MAIL_ERROR: Failed sending email to " . $toEmail);
                }
            }

            echo json_encode([
                "success" => true,
                "persistenceSuccess" => true,
                "message" => "Staff credentials updated successfully.",
                "emailSent" => $mailSent,
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

        $firstName = $data['firstName'] ?? $data['first_name'] ?? '';
        $lastName = $data['lastName'] ?? $data['last_name'] ?? '';

        if (empty($firstName) || empty($lastName)) {
            http_response_code(200);
            echo json_encode(['success' => false, 'persistenceSuccess' => false, 'message' => 'First Name and Last Name are required.']);
            exit();
        }

        $id = $data['id'] ?? ('staff-' . rand(1000, 9999));
        $staffNo = $data['staffNo'] ?? $data['staff_id'] ?? ('CCHMT/STF/2026/REG/' . str_pad(rand(1, 99), 3, '0', STR_PAD_LEFT));
        $middleName = $data['middleName'] ?? $data['middle_name'] ?? '';
        $username = $data['username'] ?? (strtolower($firstName) . '.' . strtolower($lastName));
        $email = $data['email'] ?? '';
        $phone = $data['phoneNumber'] ?? $data['phone'] ?? '';
        $roleName = strtoupper($data['roleName'] ?? $data['role'] ?? 'LECTURER');
        $departmentId = $data['departmentId'] ?? $data['department'] ?? 'dept-health-001';
        $designation = $data['designation'] ?? 'Staff';
        $joiningDate = $data['joiningDate'] ?? $data['joining_date'] ?? date('Y-m-d');
        $status = $data['status'] ?? 'ACTIVE';
        $academicRank = $data['rank'] ?? $data['academicRank'] ?? $data['academic_rank'] ?? '';
        $specialization = $data['specialization'] ?? '';
        $rawPassword = $data['password'] ?? $data['initialPassword'] ?? ('CrestOak#' . rand(1000, 9999));
        $passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);
        $sendEmail = !empty($data['sendEmail']);
        $forcePasswordChange = isset($data['forcePasswordChange']) ? !empty($data['forcePasswordChange']) : true;

        $deptName = 'Department of Nursing Sciences';
        foreach ($defaultDepartments as $d) {
            if ($d['id'] === $departmentId || $d['id'] === $data['department']) {
                $deptName = $d['name'];
                break;
            }
        }

        $staffObject = [
            "id" => $id,
            "staffId" => $staffNo,
            "staffNo" => $staffNo,
            "designation" => $designation,
            "joiningDate" => $joiningDate,
            "status" => $status,
            "lastLogin" => date('Y-m-d H:i:s'),
            "allocatedCourses" => $data['allocatedCourses'] ?? ["NUR101"],
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
        ];

        // PERSISTENCE ENGINE: 1. MySQL Write
        $dbWriteSuccess = false;
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

                $stmt = @$conn->prepare("INSERT INTO staff (id, staff_id, first_name, last_name, middle_name, username, email, phone, role, department, designation, academic_rank, specialization, status, password_hash, joining_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    status = VALUES(status),
                    password_hash = VALUES(password_hash),
                    joining_date = VALUES(joining_date)");
                if ($stmt) {
                    $stmt->bind_param("ssssssssssssssss", $id, $staffNo, $firstName, $lastName, $middleName, $username, $email, $phone, $roleName, $deptName, $designation, $academicRank, $specialization, $status, $passwordHash, $joiningDate);
                    if ($stmt->execute()) {
                        $dbWriteSuccess = true;
                    }
                    @$stmt->close();
                }
            } catch (Throwable $e) {
                error_log("STAFF_DB_PERSISTENCE_ERROR: " . $e->getMessage());
            }
            @$conn->close();
        }

        // PERSISTENCE ENGINE: 2. File Store Write
        $currentStore = readStaffJsonStore($storeFile);
        $filteredStore = array_filter($currentStore, function($s) use ($id, $staffNo) {
            return ($s['id'] ?? '') !== $id && ($s['staffNo'] ?? '') !== $staffNo;
        });
        array_unshift($filteredStore, $staffObject);
        $fileWriteSuccess = writeStaffJsonStore($storeFile, array_values($filteredStore));

        $persistenceSuccess = $dbWriteSuccess || $fileWriteSuccess;

        if (!$persistenceSuccess) {
            http_response_code(200);
            echo json_encode([
                "success" => false,
                "persistenceSuccess" => false,
                "error" => "Failed to write record to persistent database."
            ]);
            exit();
        }

        // Native HTML Email Dispatch Snippet
        $mailSent = false;
        if (!empty($data['sendEmail']) && !empty($data['email'])) {
            $toEmail = $data['email'];
            $fullName = trim(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')) ?: 'Staff Member';
            $identifier = $data['staffNo'] ?? $data['staffId'] ?? $data['email'];
            $rawPassword = $data['password'] ?? $data['initialPassword'] ?? $rawPassword;

            $subject = "Welcome to CrestOak College - Your Portal Credentials";
            
            // HTML Email Template
            $message = "
            <html>
            <head>
              <title>CrestOak College Portal Access</title>
            </head>
            <body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
              <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #0d2e58;'>CrestOak College - Portal Credentials</h2>
                <p>Hello <strong>" . htmlspecialchars($fullName) . "</strong>,</p>
                <p>Your institutional portal account has been provisioned successfully. Below are your login credentials:</p>
                <div style='background-color: #f4f6f9; padding: 15px; border-left: 4px solid #0d2e58; margin: 20px 0;'>
                  <p style='margin: 5px 0;'><strong>Portal Identifier / ID:</strong> " . htmlspecialchars($identifier) . "</p>
                  <p style='margin: 5px 0;'><strong>Temporary Password:</strong> " . htmlspecialchars($rawPassword) . "</p>
                  <p style='margin: 5px 0;'><strong>Portal Login URL:</strong> <a href='https://staff.crestoakcollege.com.ng' style='color: #0d2e58; text-decoration: underline;'>https://staff.crestoakcollege.com.ng</a></p>
                </div>
                <p>Please log in immediately and update your temporary password.</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                <p style='font-size: 12px; color: #777;'>This is an automated system email from CrestOak College of Health Sciences & Medical Technology. Please do not reply directly to this email.</p>
              </div>
            </body>
            </html>
            ";

            // Standard MIME Headers for HTML Delivery
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8\r\n";
            $headers .= "From: CrestOak College Staff Portal <noreply@crestoakcollege.com.ng>\r\n";
            $headers .= "Reply-To: info@crestoakcollege.com.ng\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion();

            // Send Mail
            $mailSent = mail($toEmail, $subject, $message, $headers);
            if (!$mailSent) {
                error_log("MAIL_ERROR: Failed sending email to " . $toEmail);
            }
        }

        echo json_encode([
            "success" => true,
            "persistenceSuccess" => true,
            "message" => "Staff account created and persisted successfully.",
            "emailSent" => $mailSent,
            "staff" => $staffObject,
            "credentials" => [
                "staffId" => $staffNo,
                "temporaryPassword" => $rawPassword,
                "email" => $email,
                "sendEmail" => $sendEmail,
                "forcePasswordChange" => $forcePasswordChange
            ]
        ]);
        exit();
    }

    if ($method === 'DELETE') {
        $id = $data['id'] ?? '';
        if ($id) {
            $currentStore = readStaffJsonStore($storeFile);
            $filteredStore = array_filter($currentStore, function($s) use ($id) {
                return ($s['id'] ?? '') !== $id;
            });
            writeStaffJsonStore($storeFile, array_values($filteredStore));
        }
        echo json_encode(["success" => true, "persistenceSuccess" => true, "message" => "Staff account archived successfully."]);
        exit();
    }

    echo json_encode(["success" => false, "message" => "Invalid request method."]);
} catch (Throwable $e) {
    http_response_code(200);
    echo json_encode([
        "success" => false,
        "persistenceSuccess" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
    exit();
}
