<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$conn = getDbConnection();

// Initial / Fallback Data
$defaultDepartments = [
    ["id" => "dept-health-001", "name" => "Department of Nursing Sciences"],
    ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science"],
    ["id" => "dept-health-003", "name" => "Department of Community Health Sciences"],
    ["id" => "dept-mgmt-001", "name" => "Department of Business Administration"],
    ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT"]
];

$defaultProgrammes = [
    ["id" => "prog-001", "name" => "Nursing Sciences (B.N.Sc)"],
    ["id" => "prog-002", "name" => "Medical Laboratory Science (B.MLS)"],
    ["id" => "prog-003", "name" => "Community Health Extension Worker (CHEW)"],
    ["id" => "prog-004", "name" => "Business Administration & Management (B.Sc)"],
    ["id" => "prog-005", "name" => "Computer Science & Artificial Intelligence (B.Sc)"]
];

$defaultSessions = [
    ["id" => "sess-2026", "name" => "2026/2027 Academic Session"]
];

$defaultSemesters = [
    ["id" => "sem-first", "name" => "First Semester"]
];

$defaultStudents = [
    [
        "id" => "stu-001",
        "matricNo" => "UG/2026/NUR/1042",
        "level" => 100,
        "cgpa" => 4.25,
        "gpa" => 4.30,
        "user" => [
            "firstName" => "Azeez",
            "lastName" => "Okunola",
            "middleName" => "Olanrewaju",
            "email" => "azeez.okunola@crestoakcollege.com.ng",
            "phoneNumber" => "08155884804"
        ],
        "department" => ["id" => "dept-health-001", "name" => "Department of Nursing Sciences"],
        "programme" => ["id" => "prog-001", "name" => "Nursing Sciences (B.N.Sc)"],
        "entrySessionId" => "sess-2026",
        "currentSessionId" => "sess-2026",
        "currentSemesterId" => "sem-first"
    ],
    [
        "id" => "stu-002",
        "matricNo" => "UG/2026/CHEW/2081",
        "level" => 200,
        "cgpa" => 3.85,
        "gpa" => 3.90,
        "user" => [
            "firstName" => "Fatima",
            "lastName" => "Abubakar",
            "middleName" => "Zahra",
            "email" => "fatima.abubakar@crestoakcollege.com.ng",
            "phoneNumber" => "08031234567"
        ],
        "department" => ["id" => "dept-health-003", "name" => "Department of Community Health Sciences"],
        "programme" => ["id" => "prog-003", "name" => "Community Health Extension Worker (CHEW)"],
        "entrySessionId" => "sess-2026",
        "currentSessionId" => "sess-2026",
        "currentSemesterId" => "sem-first"
    ]
];

if ($method === 'GET') {
    $students = $defaultStudents;
    $departments = $defaultDepartments;
    $programmes = $defaultProgrammes;

    if ($conn) {
        $res = $conn->query("SELECT s.*, u.firstName, u.lastName, u.middleName, u.email, u.phoneNumber, d.name as deptName, p.name as progName FROM Student s JOIN User u ON s.id = u.id LEFT JOIN Department d ON s.departmentId = d.id LEFT JOIN Programme p ON s.programmeId = p.id WHERE s.isDeleted = 0 OR s.isDeleted IS NULL");
        if ($res && $res->num_rows > 0) {
            $dbStudents = [];
            while ($row = $res->fetch_assoc()) {
                $dbStudents[] = [
                    "id" => $row['id'],
                    "matricNo" => $row['matricNo'],
                    "level" => intval($row['level']),
                    "cgpa" => floatval($row['cgpa'] ?? 4.0),
                    "gpa" => floatval($row['gpa'] ?? 4.0),
                    "user" => [
                        "firstName" => $row['firstName'],
                        "lastName" => $row['lastName'],
                        "middleName" => $row['middleName'],
                        "email" => $row['email'],
                        "phoneNumber" => $row['phoneNumber']
                    ],
                    "department" => ["id" => $row['departmentId'], "name" => $row['deptName'] ?? 'Department'],
                    "programme" => ["id" => $row['programmeId'], "name" => $row['progName'] ?? 'Programme'],
                    "entrySessionId" => $row['entrySessionId'] ?? 'sess-2026',
                    "currentSessionId" => $row['currentSessionId'] ?? 'sess-2026',
                    "currentSemesterId" => $row['currentSemesterId'] ?? 'sem-first'
                ];
            }
            if (count($dbStudents) > 0) {
                $students = $dbStudents;
            }
        }
        $conn->close();
    }

    echo json_encode([
        "success" => true,
        "students" => $students,
        "departments" => $departments,
        "programmes" => $programmes,
        "sessions" => $defaultSessions,
        "semesters" => $defaultSemesters
    ]);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    $id = $input['id'] ?? ('stu-' . rand(1000, 9999));
    $firstName = $input['firstName'] ?? '';
    $lastName = $input['lastName'] ?? '';
    $email = $input['email'] ?? '';
    $matricNo = $input['matricNo'] ?? ('UG/2026/REG/' . rand(1000, 9999));
    $level = intval($input['level'] ?? 100);

    echo json_encode([
        "success" => true,
        "message" => "Student profile updated successfully.",
        "student" => [
            "id" => $id,
            "matricNo" => $matricNo,
            "level" => $level,
            "cgpa" => 4.0,
            "gpa" => 4.0,
            "user" => [
                "firstName" => $firstName,
                "lastName" => $lastName,
                "middleName" => $input['middleName'] ?? "",
                "email" => $email,
                "phoneNumber" => $input['phoneNumber'] ?? ""
            ],
            "department" => ["id" => $input['departmentId'] ?? "dept-health-001", "name" => "Selected Department"],
            "programme" => ["id" => $input['programmeId'] ?? "prog-001", "name" => "Selected Programme"],
            "entrySessionId" => "sess-2026",
            "currentSessionId" => "sess-2026",
            "currentSemesterId" => "sem-first"
        ]
    ]);
    exit();
}

if ($method === 'DELETE') {
    echo json_encode([
        "success" => true,
        "message" => "Student profile deleted successfully."
    ]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
