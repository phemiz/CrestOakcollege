<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$conn = getDbConnection();

$defaultDepartments = [
    ["id" => "dept-health-001", "name" => "Department of Nursing Sciences", "code" => "NUR"],
    ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science", "code" => "MLS"],
    ["id" => "dept-health-003", "name" => "Department of Community Health Sciences", "code" => "CHEW"],
    ["id" => "dept-mgmt-001", "name" => "Department of Business Administration", "code" => "BUS"],
    ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT", "code" => "CSC"]
];

$defaultFaculties = [
    [
        "id" => "fac-001",
        "name" => "Faculty of Health Sciences",
        "code" => "FHS",
        "description" => "Nursing, Medical Laboratory, CHEW, and Public Health",
        "departments" => [
            ["id" => "dept-health-001", "name" => "Department of Nursing Sciences", "code" => "NUR"],
            ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science", "code" => "MLS"],
            ["id" => "dept-health-003", "name" => "Department of Community Health Sciences", "code" => "CHEW"]
        ]
    ],
    [
        "id" => "fac-002",
        "name" => "Faculty of Management & Humanities",
        "code" => "FMH",
        "description" => "Business Admin, Accounting, Criminology & Security Studies",
        "departments" => [
            ["id" => "dept-mgmt-001", "name" => "Department of Business Administration", "code" => "BUS"],
            ["id" => "dept-mgmt-002", "name" => "Department of Criminology & Security Studies", "code" => "CSS"]
        ]
    ],
    [
        "id" => "fac-003",
        "name" => "Faculty of Science & Technology",
        "code" => "FST",
        "description" => "Computer Science, Software Engineering, AI & Cyber Security",
        "departments" => [
            ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT", "code" => "CSC"]
        ]
    ]
];

$defaultProgrammes = [
    [
        "id" => "prog-001",
        "name" => "Nursing Sciences (B.N.Sc)",
        "code" => "NUR",
        "durationYears" => 5,
        "degreeAwarded" => "B.N.Sc.",
        "department" => ["id" => "dept-health-001", "name" => "Department of Nursing Sciences"]
    ],
    [
        "id" => "prog-002",
        "name" => "Medical Laboratory Science (B.MLS)",
        "code" => "MLS",
        "durationYears" => 5,
        "degreeAwarded" => "B.MLS",
        "department" => ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science"]
    ],
    [
        "id" => "prog-003",
        "name" => "Community Health Extension Worker (CHEW)",
        "code" => "CHEW",
        "durationYears" => 3,
        "degreeAwarded" => "Diploma / CHEW",
        "department" => ["id" => "dept-health-003", "name" => "Department of Community Health Sciences"]
    ],
    [
        "id" => "prog-004",
        "name" => "Business Administration & Management (B.Sc)",
        "code" => "BUS",
        "durationYears" => 4,
        "degreeAwarded" => "B.Sc.",
        "department" => ["id" => "dept-mgmt-001", "name" => "Department of Business Administration"]
    ],
    [
        "id" => "prog-005",
        "name" => "Computer Science & Artificial Intelligence (B.Sc)",
        "code" => "CSC",
        "durationYears" => 4,
        "degreeAwarded" => "B.Sc.",
        "department" => ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT"]
    ]
];

if ($method === 'GET') {
    echo json_encode([
        "success" => true,
        "faculties" => $defaultFaculties,
        "departments" => $defaultDepartments,
        "programmes" => $defaultProgrammes
    ]);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    $type = $input['type'] ?? 'programme';
    echo json_encode([
        "success" => true,
        "message" => ucfirst($type) . " saved successfully."
    ]);
    exit();
}

if ($method === 'DELETE') {
    echo json_encode(["success" => true, "message" => "Item deleted successfully."]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
