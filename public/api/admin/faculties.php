<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF', 'LECTURER']);

$defaultFaculties = [
    [
        "id" => "fac-001",
        "name" => "Faculty of Health Sciences",
        "code" => "FHS",
        "description" => "Nursing, Medical Laboratory, CHEW, and Public Health",
        "departments" => [
            ["id" => "dept-health-001", "name" => "Department of Nursing Sciences", "code" => "NUR", "description" => "Clinical Nursing & Maternal Care"],
            ["id" => "dept-health-002", "name" => "Department of Medical Laboratory Science", "code" => "MLS", "description" => "Diagnostic Hematology & Pathology"],
            ["id" => "dept-health-003", "name" => "Department of Community Health Sciences", "code" => "CHEW", "description" => "Community & Public Primary Care"]
        ]
    ],
    [
        "id" => "fac-002",
        "name" => "Faculty of Management & Humanities",
        "code" => "FMH",
        "description" => "Business Admin, Accounting, Criminology & Security Studies",
        "departments" => [
            ["id" => "dept-mgmt-001", "name" => "Department of Business Administration", "code" => "BUS", "description" => "Corporate Management & Entrepreneurship"],
            ["id" => "dept-mgmt-002", "name" => "Department of Criminology & Security Studies", "code" => "CSS", "description" => "Security Risk Management & Forensics"]
        ]
    ],
    [
        "id" => "fac-003",
        "name" => "Faculty of Science & Technology",
        "code" => "FST",
        "description" => "Computer Science, Software Engineering, AI & Cyber Security",
        "departments" => [
            ["id" => "dept-tech-001", "name" => "Department of Computer Science & IT", "code" => "CSC", "description" => "Software Engineering & Artificial Intelligence"]
        ]
    ]
];

$defaultLecturers = [
    ["id" => "lec-001", "name" => "Dr. Emmanuel Adeyemi"],
    ["id" => "lec-002", "name" => "Dr. Mrs. Folashade Alabi"]
];

echo json_encode([
    "success" => true,
    "faculties" => $defaultFaculties,
    "lecturers" => $defaultLecturers
], JSON_UNESCAPED_SLASHES);
