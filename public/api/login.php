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
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function readJsonStore($filePath) {
    if (file_exists($filePath)) {
        $content = @file_get_contents($filePath);
        $data = @json_decode($content, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return [];
}

function cleanId($id) {
    return strtolower(str_replace('\\', '', trim($id ?? '')));
}

function verifyPassword($inputPassword, $storedHashOrPlain) {
    if (empty($storedHashOrPlain) || empty($inputPassword)) {
        return false;
    }
    // 1. Bcrypt verification
    if (password_verify($inputPassword, $storedHashOrPlain)) {
        return true;
    }
    // 2. Plain text fallback for temporary passwords
    if ($inputPassword === $storedHashOrPlain) {
        return true;
    }
    return false;
}

try {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? $_POST ?? [];
    $data = $input;

    // Clean submitted input identifier & remove backslashes
    $rawIdentifier = trim($data['username'] ?? $data['matricNo'] ?? $data['staffNo'] ?? $data['email'] ?? $data['identifier'] ?? '');
    $cleanIdentifier = cleanId($rawIdentifier);
    $rawPassword = trim($data['password'] ?? '');

    if (empty($cleanIdentifier) || empty($rawPassword)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Username/Identifier and password are required.']);
        exit();
    }

    // DirectAdmin MySQL Connection
    $dbFile = __DIR__ . '/admin/db.php';
    if (!file_exists($dbFile)) $dbFile = __DIR__ . '/../admin/db.php';
    if (file_exists($dbFile)) {
        require_once $dbFile;
    }
    $conn = function_exists('getDbConnection') ? getDbConnection() : null;

    $matchedUser = null;

    // A. Query MySQL `users`, `students`, `staff` tables
    if ($conn) {
        // 1. Check `users` table
        try {
            $stmt = @$conn->prepare("SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? OR REPLACE(LOWER(username), '\\\\', '') = ? LIMIT 1");
            if ($stmt) {
                $stmt->bind_param("sss", $cleanIdentifier, $cleanIdentifier, $cleanIdentifier);
                $stmt->execute();
                $res = $stmt->get_result();
                if ($res && $res->num_rows > 0) {
                    $row = $res->fetch_assoc();
                    $storedPass = $row['password_hash'] ?? $row['password'] ?? '';
                    if (verifyPassword($rawPassword, $storedPass)) {
                        $matchedUser = [
                            'id' => $row['id'],
                            'username' => $row['username'] ?? $row['email'],
                            'email' => $row['email'] ?? '',
                            'name' => $row['name'] ?? $row['username'] ?? 'User',
                            'role' => strtoupper($row['role'] ?? 'STUDENT')
                        ];
                    }
                }
                @$stmt->close();
            }
        } catch (Throwable $e) {}

        // 2. Check `students` table
        if (!$matchedUser) {
            try {
                $stmt = @$conn->prepare("SELECT * FROM students WHERE (REPLACE(LOWER(matric_no), '\\\\', '') = ? OR LOWER(email) = ? OR LOWER(id) = ?) AND (isDeleted = 0 OR isDeleted IS NULL) LIMIT 1");
                if ($stmt) {
                    $stmt->bind_param("sss", $cleanIdentifier, $cleanIdentifier, $cleanIdentifier);
                    $stmt->execute();
                    $res = $stmt->get_result();
                    if ($res && $res->num_rows > 0) {
                        $row = $res->fetch_assoc();
                        $storedPass = $row['password_hash'] ?? $row['password'] ?? '';
                        if (verifyPassword($rawPassword, $storedPass)) {
                            $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: 'Student';
                            $matchedUser = [
                                'id' => $row['id'],
                                'matricNo' => $row['matric_no'],
                                'username' => $row['matric_no'],
                                'email' => $row['email'],
                                'name' => $fullName,
                                'role' => 'STUDENT',
                                'level' => $row['level'] ?? 100,
                                'department' => $row['department_name'] ?? ''
                            ];
                        }
                    }
                    @$stmt->close();
                }
            } catch (Throwable $e) {}
        }

        // 3. Check `staff` table
        if (!$matchedUser) {
            try {
                $stmt = @$conn->prepare("SELECT * FROM staff WHERE (REPLACE(LOWER(staff_no), '\\\\', '') = ? OR LOWER(email) = ? OR LOWER(username) = ? OR LOWER(id) = ?) AND (isDeleted = 0 OR isDeleted IS NULL) LIMIT 1");
                if ($stmt) {
                    $stmt->bind_param("ssss", $cleanIdentifier, $cleanIdentifier, $cleanIdentifier, $cleanIdentifier);
                    $stmt->execute();
                    $res = $stmt->get_result();
                    if ($res && $res->num_rows > 0) {
                        $row = $res->fetch_assoc();
                        $storedPass = $row['password_hash'] ?? $row['password'] ?? '';
                        if (verifyPassword($rawPassword, $storedPass)) {
                            $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: 'Staff Member';
                            $matchedUser = [
                                'id' => $row['id'],
                                'staffNo' => $row['staff_no'],
                                'username' => $row['username'] ?? $row['staff_no'],
                                'email' => $row['email'],
                                'name' => $fullName,
                                'role' => strtoupper($row['role_name'] ?? $row['role'] ?? 'LECTURER'),
                                'department' => $row['department_name'] ?? ''
                            ];
                        }
                    }
                    @$stmt->close();
                }
            } catch (Throwable $e) {}
        }
        @$conn->close();
    }

    // B. Check Persistent JSON Stores (`students_store.json` & `staff_store.json`)
    if (!$matchedUser) {
        $studentStorePath = __DIR__ . '/admin/students_store.json';
        if (!file_exists($studentStorePath)) $studentStorePath = __DIR__ . '/../admin/students_store.json';
        $students = readJsonStore($studentStorePath);
        foreach ($students as $stu) {
            $storedMatric = cleanId($stu['matricNo'] ?? '');
            $storedEmail  = strtolower(trim($stu['user']['email'] ?? $stu['email'] ?? ''));
            $storedId     = cleanId($stu['id'] ?? '');

            if ($cleanIdentifier === $storedMatric || $cleanIdentifier === $storedEmail || $cleanIdentifier === $storedId) {
                $storedPass = $stu['password']
                            ?? $stu['password_hash']
                            ?? $stu['initialPassword']
                            ?? $stu['user']['password']
                            ?? '';
                if (verifyPassword($rawPassword, $storedPass)) {
                    $fullName = trim(($stu['user']['firstName'] ?? '') . ' ' . ($stu['user']['lastName'] ?? '')) ?: 'Student';
                    $matchedUser = [
                        'id' => $stu['id'],
                        'matricNo' => $stu['matricNo'],
                        'username' => $stu['matricNo'],
                        'email' => $stu['user']['email'] ?? $stu['email'] ?? '',
                        'name' => $fullName,
                        'role' => 'STUDENT',
                        'level' => $stu['level'] ?? 100,
                        'department' => $stu['department']['name'] ?? ''
                    ];
                    break;
                }
            }
        }
    }

    if (!$matchedUser) {
        $staffStorePath = __DIR__ . '/admin/staff_store.json';
        if (!file_exists($staffStorePath)) $staffStorePath = __DIR__ . '/../admin/staff_store.json';
        $staffMembers = readJsonStore($staffStorePath);
        foreach ($staffMembers as $stf) {
            $storedStaffNo = cleanId($stf['staffNo'] ?? '');
            $storedUsername = cleanId($stf['username'] ?? '');
            $storedEmail    = strtolower(trim($stf['user']['email'] ?? $stf['email'] ?? ''));
            $storedId       = cleanId($stf['id'] ?? '');

            if ($cleanIdentifier === $storedStaffNo || $cleanIdentifier === $storedUsername || $cleanIdentifier === $storedEmail || $cleanIdentifier === $storedId) {
                $storedPass = $stf['password']
                            ?? $stf['password_hash']
                            ?? $stf['initialPassword']
                            ?? $stf['user']['password']
                            ?? '';
                if (verifyPassword($rawPassword, $storedPass)) {
                    $fullName = trim(($stf['user']['firstName'] ?? '') . ' ' . ($stf['user']['lastName'] ?? '')) ?: 'Staff Member';
                    $matchedUser = [
                        'id' => $stf['id'],
                        'staffNo' => $stf['staffNo'],
                        'username' => $stf['username'] ?? $stf['staffNo'],
                        'email' => $stf['user']['email'] ?? $stf['email'] ?? '',
                        'name' => $fullName,
                        'role' => strtoupper($stf['user']['roleName'] ?? 'LECTURER'),
                        'department' => $stf['department']['name'] ?? ''
                    ];
                    break;
                }
            }
        }
    }

    // C. Static Default Fallback Accounts for Emergency Verification
    if (!$matchedUser) {
        if (($cleanIdentifier === cleanId('azeez.okunola@crestoakcollege.com.ng') || $cleanIdentifier === cleanId('cchms/2026/nur/0042')) && verifyPassword($rawPassword, 'CrestOak#1001')) {
            $matchedUser = [
                'id' => 'stu-001',
                'matricNo' => 'CCHMS/2026/NUR/0042',
                'username' => 'CCHMS/2026/NUR/0042',
                'email' => 'azeez.okunola@crestoakcollege.com.ng',
                'name' => 'Azeez Okunola',
                'role' => 'STUDENT',
                'level' => 100,
                'department' => 'Department of Nursing Sciences'
            ];
        } else if (($cleanIdentifier === cleanId('emmanuel.adeyemi@crestoakcollege.com.ng') || $cleanIdentifier === cleanId('cchmt/stf/2026/nur/001') || $cleanIdentifier === cleanId('adeyemi.emmanuel')) && verifyPassword($rawPassword, 'CrestOakStaff#2026')) {
            $matchedUser = [
                'id' => 'stf-001',
                'staffNo' => 'CCHMT/STF/2026/NUR/001',
                'username' => 'adeyemi.emmanuel',
                'email' => 'emmanuel.adeyemi@crestoakcollege.com.ng',
                'name' => 'Emmanuel Adeyemi',
                'role' => 'HOD',
                'department' => 'Department of Nursing Sciences'
            ];
        }
    }

    if ($matchedUser) {
        $token = bin2hex(random_bytes(32));
        $role = $matchedUser['role'];

        $redirectUrl = '/portal/dashboard';
        if (in_array($role, ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'])) {
            $redirectUrl = '/admin/dashboard';
        } else if (in_array($role, ['BURSARY', 'BURSAR'])) {
            $redirectUrl = '/bursary/dashboard';
        } else if (in_array($role, ['LECTURER', 'HOD', 'DEAN', 'REGISTRAR', 'STAFF'])) {
            $redirectUrl = '/staff/dashboard';
        }

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'redirectUrl' => $redirectUrl,
            'user' => $matchedUser
        ]);
        exit();
    }

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid portal credentials.'
    ]);
    exit();

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication server error: ' . $e->getMessage()
    ]);
    exit();
}
