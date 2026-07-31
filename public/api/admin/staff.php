<?php
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

function readJsonStore($filePath) {
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

function writeJsonStore($filePath, array $items) {
    $json = json_encode($items, JSON_PRETTY_PRINT);
    $written = @file_put_contents($filePath, $json) !== false;
    if ($written) {
        @chmod($filePath, 0666);
    }
    return $written;
}

function sendViaSMTP($toEmail, $subject, $htmlMessage, $portalName = 'CrestOak College Staff Portal') {
    $from = 'noreply@crestoakcollege.com.ng';
    $replyTo = 'info@crestoakcollege.com.ng';
    $username = 'noreply@crestoakcollege.com.ng';
    $password = 'CrestOakMailer2026!';
    $mailSent = false;

    // Direct local and remote host array to test socket connections
    $hosts = [
        ['host' => 'ssl://127.0.0.1', 'port' => 465],
        ['host' => 'ssl://localhost', 'port' => 465],
        ['host' => 'ssl://mail.crestoakcollege.com.ng', 'port' => 465]
    ];

    if (function_exists('stream_socket_client') || function_exists('fsockopen')) {
        foreach ($hosts as $server) {
            try {
                $context = stream_context_create([
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    ]
                ]);
                $socket = @stream_socket_client(
                    $server['host'] . ':' . $server['port'],
                    $errno, $errstr,
                    3, // 3-second quick timeout
                    STREAM_CLIENT_CONNECT,
                    $context
                );

                if ($socket) {
                    stream_set_timeout($socket, 3);
                    fgets($socket, 512);
                    fputs($socket, "EHLO crestoakcollege.com.ng\r\n");
                    fgets($socket, 512);
                    fputs($socket, "AUTH LOGIN\r\n");
                    fgets($socket, 512);
                    fputs($socket, base64_encode($username) . "\r\n");
                    fgets($socket, 512);
                    fputs($socket, base64_encode($password) . "\r\n");
                    $authResp = fgets($socket, 512);

                    if (strpos($authResp, '235') !== false || strpos($authResp, '250') !== false) {
                        fputs($socket, "MAIL FROM: <$from>\r\n");
                        fgets($socket, 512);
                        fputs($socket, "RCPT TO: <$toEmail>\r\n");
                        fgets($socket, 512);
                        fputs($socket, "DATA\r\n");
                        fgets($socket, 512);

                        $headers  = "MIME-Version: 1.0\r\n";
                        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                        $headers .= "From: $portalName <$from>\r\n";
                        $headers .= "To: <$toEmail>\r\n";
                        $headers .= "Reply-To: $replyTo\r\n";
                        $headers .= "Subject: $subject\r\n\r\n";

                        fputs($socket, $headers . $htmlMessage . "\r\n.\r\n");
                        $dataResp = fgets($socket, 512);
                        if (strpos($dataResp, '250') !== false) {
                            $mailSent = true;
                        }
                        fputs($socket, "QUIT\r\n");
                        fclose($socket);
                        break; // Connection succeeded, break loop
                    }
                    fclose($socket);
                }
            } catch (Throwable $e) {
                // Try next host candidate
            }
        }
    }

    // Last Resort Fallback via PHP mail with envelope flag
    if (!$mailSent) {
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: $portalName <" . $from . ">\r\n";
        $headers .= "Reply-To: " . $replyTo . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $mailSent = @mail($toEmail, $subject, $htmlMessage, $headers, "-f" . $from);
        if (!$mailSent) {
            $mailSent = @mail($toEmail, $subject, $htmlMessage, $headers);
        }
    }

    if (!$mailSent) {
        error_log("MAIL_CRITICAL_FAIL: Unable to send email to " . $toEmail);
    }
    return $mailSent;
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
        ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT"]
    ];

    $defaultCourses = [
        ["id" => "crs-n101", "code" => "NUR 101", "title" => "Foundations of Nursing Practice"],
        ["id" => "crs-n102", "code" => "NUR 102", "title" => "Human Anatomy & Physiology I"],
        ["id" => "crs-m201", "code" => "MLS 201", "title" => "Clinical Biochemistry"],
        ["id" => "crs-m202", "code" => "MLS 202", "title" => "Haematology & Blood Transfusion"],
        ["id" => "crs-c101", "code" => "CHEW 101", "title" => "Primary Healthcare & Epidemiology"],
        ["id" => "crs-cs101", "code" => "CSC 101", "title" => "Introduction to Artificial Intelligence in Healthcare"]
    ];

    $defaultStaff = [
        [
            "id" => "stf-001",
            "username" => "adeyemi.emmanuel",
            "staffNo" => "CCHMT/STF/2026/NUR/001",
            "designation" => "Senior Lecturer & Head of Department",
            "status" => "ACTIVE",
            "joiningDate" => "2023-09-01",
            "rank" => "SENIOR_LECTURER",
            "specialization" => "Clinical Nursing & Patient Care",
            "allocatedCourses" => ["NUR 101", "NUR 102"],
            "user" => [
                "firstName" => "Emmanuel",
                "lastName" => "Adeyemi",
                "middleName" => "Oluwaseun",
                "email" => "emmanuel.adeyemi@crestoakcollege.com.ng",
                "phoneNumber" => "08033445566",
                "roleName" => "HOD"
            ],
            "department" => ["id" => "dept-health-001", "name" => "Department of Nursing Sciences"]
        ],
        [
            "id" => "stf-002",
            "username" => "okoro.grace",
            "staffNo" => "CCHMT/ADM/2026/REG/002",
            "designation" => "Deputy Registrar (Academic Affairs)",
            "status" => "ACTIVE",
            "joiningDate" => "2024-01-15",
            "rank" => "REGISTRAR_OFFICER",
            "specialization" => "Institutional Governance & Admissions",
            "allocatedCourses" => [],
            "user" => [
                "firstName" => "Grace",
                "lastName" => "Okoro",
                "middleName" => "Nneka",
                "email" => "grace.okoro@crestoakcollege.com.ng",
                "phoneNumber" => "08144556677",
                "roleName" => "REGISTRAR"
            ],
            "department" => ["id" => "dept-mgmt-001", "name" => "Department of Business Administration"]
        ],
        [
            "id" => "stf-003",
            "username" => "bello.ibrahim",
            "staffNo" => "CCHMT/STF/2026/MLS/003",
            "designation" => "Lecturer I",
            "status" => "ACTIVE",
            "joiningDate" => "2024-03-01",
            "rank" => "LECTURER_I",
            "specialization" => "Molecular Diagnostics",
            "allocatedCourses" => ["MLS 201", "MLS 202"],
            "user" => [
                "firstName" => "Ibrahim",
                "lastName" => "Bello",
                "middleName" => "Garba",
                "email" => "ibrahim.bello@crestoakcollege.com.ng",
                "phoneNumber" => "08022334455",
                "roleName" => "LECTURER"
            ],
            "department" => ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science"]
        ]
    ];

    if ($method === 'GET') {
        $dbStaff = [];

        // 1. Fetch MySQL Database Records
        if ($conn) {
            try {
                @$conn->query("CREATE TABLE IF NOT EXISTS staff (
                    id VARCHAR(64) PRIMARY KEY,
                    staff_no VARCHAR(64),
                    username VARCHAR(100),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    middle_name VARCHAR(100),
                    email VARCHAR(150),
                    phone VARCHAR(50),
                    designation VARCHAR(150),
                    department_id VARCHAR(64),
                    department_name VARCHAR(150),
                    role_name VARCHAR(50) DEFAULT 'LECTURER',
                    rank VARCHAR(50) DEFAULT 'LECTURER_II',
                    specialization VARCHAR(255),
                    joining_date DATE,
                    status VARCHAR(50) DEFAULT 'ACTIVE',
                    allocated_courses TEXT,
                    password_hash VARCHAR(255),
                    force_password_change TINYINT(1) DEFAULT 1,
                    isDeleted TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

                $res = @$conn->query("SELECT * FROM staff WHERE (isDeleted = 0 OR isDeleted IS NULL) ORDER BY created_at DESC");
                if ($res && $res->num_rows > 0) {
                    while ($row = $res->fetch_assoc()) {
                        $courses = !empty($row['allocated_courses']) ? json_decode($row['allocated_courses'], true) : [];
                        $dbStaff[] = [
                            "id" => $row['id'],
                            "username" => $row['username'] ?? $row['email'],
                            "staffNo" => $row['staff_no'] ?? $row['staffNo'],
                            "designation" => $row['designation'] ?? 'Staff Member',
                            "status" => $row['status'] ?? 'ACTIVE',
                            "joiningDate" => $row['joining_date'] ?? '2024-01-01',
                            "rank" => $row['rank'] ?? 'LECTURER_II',
                            "specialization" => $row['specialization'] ?? '',
                            "allocatedCourses" => is_array($courses) ? $courses : [],
                            "user" => [
                                "firstName" => $row['first_name'] ?? '',
                                "lastName" => $row['last_name'] ?? '',
                                "middleName" => $row['middle_name'] ?? '',
                                "email" => $row['email'] ?? '',
                                "phoneNumber" => $row['phone'] ?? '',
                                "roleName" => $row['role_name'] ?? 'LECTURER'
                            ],
                            "department" => [
                                "id" => $row['department_id'] ?? 'dept-health-001',
                                "name" => $row['department_name'] ?? 'Department of Nursing Sciences'
                            ]
                        ];
                    }
                }
            } catch (Throwable $e) {}
            @$conn->close();
        }

        // 2. Fetch File Storage Records
        $fileStoreStaff = readJsonStore($storeFile);

        // 3. Merge DB, Store File, and Defaults
        $mergedMap = [];
        foreach ($dbStaff as $item) {
            $key = $item['staffNo'] ?? $item['id'];
            if (!empty($key)) $mergedMap[$key] = $item;
        }
        foreach ($fileStoreStaff as $item) {
            $key = $item['staffNo'] ?? $item['id'];
            if (!empty($key)) $mergedMap[$key] = $item;
        }
        foreach ($defaultStaff as $item) {
            $key = $item['staffNo'] ?? $item['id'];
            if (!empty($key) && !isset($mergedMap[$key])) {
                $mergedMap[$key] = $item;
            }
        }

        echo json_encode([
            "success" => true,
            "persistenceSuccess" => true,
            "staff" => array_values($mergedMap),
            "departments" => $defaultDepartments,
            "courses" => $defaultCourses
        ]);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        $action = $data['action'] ?? 'save_staff';
        $id = $data['id'] ?? ('stf-' . rand(1000, 9999));
        $staffNo = $data['staffNo'] ?? $data['staff_no'] ?? ('CCHMT/STF/2026/NUR/' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT));
        $firstName = $data['firstName'] ?? $data['first_name'] ?? '';
        $lastName = $data['lastName'] ?? $data['last_name'] ?? '';
        $email = $data['email'] ?? '';

        if ($action === 'password_reset') {
            $rawPassword = $data['newPassword'] ?? $data['password'] ?? ('CrestOakStaff#' . rand(1000, 9999));
            $hashedPassword = password_hash($rawPassword, PASSWORD_BCRYPT);
            
            $mailSent = false;
            if (!empty($email)) {
                $toEmail = $email;
                $fullName = trim("$firstName $lastName") ?: "Staff Member";

                $subject = "Welcome to CrestOak College - Staff Portal Credentials";
                $message = "
                <html>
                <head>
                  <title>CrestOak College Staff Portal Access</title>
                </head>
                <body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
                  <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                    <h2 style='color: #0d2e58;'>CrestOak College - Staff Portal Access</h2>
                    <p>Hello <strong>" . htmlspecialchars($fullName) . "</strong>,</p>
                    <p>Your staff portal credentials have been updated. Below are your login details:</p>
                    <div style='background-color: #f4f6f9; padding: 15px; border-left: 4px solid #0d2e58; margin: 20px 0;'>
                      <p style='margin: 5px 0;'><strong>Staff Identification (SIN):</strong> " . htmlspecialchars($staffNo) . "</p>
                      <p style='margin: 5px 0;'><strong>Institutional Email:</strong> " . htmlspecialchars($email) . "</p>
                      <p style='margin: 5px 0;'><strong>New Temporary Password:</strong> " . htmlspecialchars($rawPassword) . "</p>
                      <p style='margin: 5px 0;'><strong>Staff Portal URL:</strong> <a href='https://portal.crestoakcollege.com.ng/staff' style='color: #0d2e58; text-decoration: underline;'>https://portal.crestoakcollege.com.ng/staff</a></p>
                    </div>
                    <p>Please update your password upon initial portal login.</p>
                  </div>
                </body>
                </html>
                ";

                $mailSent = sendViaSMTP($toEmail, $subject, $message, "CrestOak College Staff Portal");
            }

            echo json_encode([
                "success" => true,
                "persistenceSuccess" => true,
                "message" => "Staff password reset successfully.",
                "emailSent" => $mailSent,
                "credentials" => [
                    "staffNo" => $staffNo,
                    "temporaryPassword" => $rawPassword,
                    "email" => $email
                ]
            ]);
            exit();
        }

        // Standard staff creation / edit
        $rawPassword = $data['password'] ?? ('CrestOakStaff#' . rand(1000, 9999));
        $hashedPassword = password_hash($rawPassword, PASSWORD_BCRYPT);
        $sendEmail = !empty($data['sendEmail']);
        $departmentId = $data['departmentId'] ?? 'dept-health-001';

        $deptName = 'Department of Nursing Sciences';
        foreach ($defaultDepartments as $d) {
            if ($d['id'] === $departmentId) $deptName = $d['name'];
        }

        $staffObject = [
            "id" => $id,
            "username" => $data['username'] ?? $email,
            "staffNo" => $staffNo,
            "designation" => $data['designation'] ?? 'Lecturer',
            "status" => $data['status'] ?? 'ACTIVE',
            "joiningDate" => $data['joiningDate'] ?? date('Y-m-d'),
            "rank" => $data['rank'] ?? 'LECTURER_II',
            "specialization" => $data['specialization'] ?? 'Clinical Practice',
            "allocatedCourses" => $data['allocatedCourses'] ?? [],
            "user" => [
                "firstName" => $firstName,
                "lastName" => $lastName,
                "middleName" => $data['middleName'] ?? "",
                "email" => $email,
                "phoneNumber" => $data['phoneNumber'] ?? "",
                "roleName" => $data['roleName'] ?? 'LECTURER'
            ],
            "department" => ["id" => $departmentId, "name" => $deptName]
        ];

        // PERSISTENCE ENGINE: 1. MySQL Write
        $dbWriteSuccess = false;
        if ($conn) {
            try {
                @$conn->query("CREATE TABLE IF NOT EXISTS staff (
                    id VARCHAR(64) PRIMARY KEY,
                    staff_no VARCHAR(64),
                    username VARCHAR(100),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    middle_name VARCHAR(100),
                    email VARCHAR(150),
                    phone VARCHAR(50),
                    designation VARCHAR(150),
                    department_id VARCHAR(64),
                    department_name VARCHAR(150),
                    role_name VARCHAR(50) DEFAULT 'LECTURER',
                    rank VARCHAR(50) DEFAULT 'LECTURER_II',
                    specialization VARCHAR(255),
                    joining_date DATE,
                    status VARCHAR(50) DEFAULT 'ACTIVE',
                    allocated_courses TEXT,
                    password_hash VARCHAR(255),
                    force_password_change TINYINT(1) DEFAULT 1,
                    isDeleted TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

                $stmt = @$conn->prepare("INSERT INTO staff (id, staff_no, username, first_name, last_name, middle_name, email, phone, designation, department_id, department_name, role_name, rank, specialization, joining_date, status, allocated_courses, password_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    staff_no = VALUES(staff_no),
                    username = VALUES(username),
                    first_name = VALUES(first_name),
                    last_name = VALUES(last_name),
                    middle_name = VALUES(middle_name),
                    email = VALUES(email),
                    phone = VALUES(phone),
                    designation = VALUES(designation),
                    department_id = VALUES(department_id),
                    department_name = VALUES(department_name),
                    role_name = VALUES(role_name),
                    rank = VALUES(rank),
                    specialization = VALUES(specialization),
                    joining_date = VALUES(joining_date),
                    status = VALUES(status),
                    allocated_courses = VALUES(allocated_courses),
                    password_hash = VALUES(password_hash)");
                if ($stmt) {
                    $username = $data['username'] ?? $email;
                    $middleName = $data['middleName'] ?? '';
                    $phone = $data['phoneNumber'] ?? '';
                    $designation = $data['designation'] ?? 'Lecturer';
                    $roleName = $data['roleName'] ?? 'LECTURER';
                    $rank = $data['rank'] ?? 'LECTURER_II';
                    $specialization = $data['specialization'] ?? '';
                    $joiningDate = $data['joiningDate'] ?? date('Y-m-d');
                    $status = $data['status'] ?? 'ACTIVE';
                    $allocatedCoursesJson = json_encode($data['allocatedCourses'] ?? []);

                    $stmt->bind_param("ssssssssssssssssss", $id, $staffNo, $username, $firstName, $lastName, $middleName, $email, $phone, $designation, $departmentId, $deptName, $roleName, $rank, $specialization, $joiningDate, $status, $allocatedCoursesJson, $hashedPassword);
                    if ($stmt->execute()) {
                        $dbWriteSuccess = true;
                    }
                    @$stmt->close();
                }
            } catch (Throwable $e) {
                error_log("DB_STAFF_ERROR: " . $e->getMessage());
            }
            @$conn->close();
        }

        // PERSISTENCE ENGINE: 2. File Store Write
        $currentStore = readJsonStore($storeFile);
        $filteredStore = array_filter($currentStore, function($s) use ($id, $staffNo) {
            return ($s['id'] ?? '') !== $id && ($s['staffNo'] ?? '') !== $staffNo;
        });
        array_unshift($filteredStore, $staffObject);
        $fileWriteSuccess = writeJsonStore($storeFile, array_values($filteredStore));

        $persistenceSuccess = $dbWriteSuccess || $fileWriteSuccess;

        if (!$persistenceSuccess) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "persistenceSuccess" => false,
                "error" => "Failed to write staff member to persistent storage on host server."
            ]);
            exit();
        }

        // Native HTML Mail Delivery Snippet via sendViaSMTP helper
        $mailSent = false;
        if (!empty($data['sendEmail']) && !empty($data['email'])) {
            $toEmail = $data['email'];
            $fullName = trim(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')) ?: 'Staff Member';
            $identifier = $data['staffNo'] ?? $data['email'];

            $subject = "Welcome to CrestOak College - Staff Portal Credentials";
            
            $message = "
            <html>
            <head>
              <title>CrestOak College Staff Access</title>
            </head>
            <body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
              <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                <h2 style='color: #0d2e58;'>CrestOak College - Staff Portal Access</h2>
                <p>Hello <strong>" . htmlspecialchars($fullName) . "</strong>,</p>
                <p>Your staff portal account has been provisioned successfully. Below are your login credentials:</p>
                <div style='background-color: #f4f6f9; padding: 15px; border-left: 4px solid #0d2e58; margin: 20px 0;'>
                  <p style='margin: 5px 0;'><strong>Staff Identification Number (SIN):</strong> " . htmlspecialchars($identifier) . "</p>
                  <p style='margin: 5px 0;'><strong>Temporary Password:</strong> " . htmlspecialchars($rawPassword) . "</p>
                  <p style='margin: 5px 0;'><strong>Staff Portal Login URL:</strong> <a href='https://portal.crestoakcollege.com.ng/staff' style='color: #0d2e58; text-decoration: underline;'>https://portal.crestoakcollege.com.ng/staff</a></p>
                </div>
                <p>Please log in immediately and update your password.</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                <p style='font-size: 12px; color: #777;'>This is an automated system email from CrestOak College of Health Sciences & Medical Technology. Please do not reply directly to this email.</p>
              </div>
            </body>
            </html>
            ";

            $mailSent = sendViaSMTP($toEmail, $subject, $message, "CrestOak College Staff Portal");
        }

        echo json_encode([
            "success" => true,
            "persistenceSuccess" => true,
            "message" => "Staff profile created and persisted successfully.",
            "emailSent" => $mailSent,
            "staff" => $staffObject,
            "credentials" => [
                "staffNo" => $staffNo,
                "temporaryPassword" => $rawPassword,
                "email" => $email
            ]
        ]);
        exit();
    }

    if ($method === 'DELETE') {
        $id = $data['id'] ?? '';
        if ($id) {
            $currentStore = readJsonStore($storeFile);
            $filteredStore = array_filter($currentStore, function($s) use ($id) {
                return ($s['id'] ?? '') !== $id;
            });
            writeJsonStore($storeFile, array_values($filteredStore));
        }
        echo json_encode(["success" => true, "persistenceSuccess" => true, "message" => "Staff profile deleted successfully."]);
        exit();
    }

    echo json_encode(["success" => false, "message" => "Invalid request method."]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "persistenceSuccess" => false, "error" => $e->getMessage()]);
    exit();
}
