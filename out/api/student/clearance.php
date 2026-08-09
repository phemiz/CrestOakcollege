<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$matricNo = trim($_GET['matricNo'] ?? $_GET['username'] ?? '');

$clearanceData = [
    "overallStatus" => "IN_PROGRESS",
    "clearedCount" => 3,
    "totalRequired" => 4,
    "stages" => [
        [
            "id" => "bursary",
            "name" => "Bursary & Financial Audit",
            "status" => "CLEARED",
            "approvedBy" => "Grace Okoro (Bursar)",
            "date" => "2026-06-05"
        ],
        [
            "id" => "academic",
            "name" => "Departmental & Faculty Academic Clearance",
            "status" => "CLEARED",
            "approvedBy" => "Dr. Emmanuel Adeyemi (HOD Nursing)",
            "date" => "2026-06-08"
        ],
        [
            "id" => "library",
            "name" => "Medical Library Resource & Returns",
            "status" => "CLEARED",
            "approvedBy" => "Head Librarian",
            "date" => "2026-06-10"
        ],
        [
            "id" => "health",
            "name" => "Medical Center Health Certificate & Immunization",
            "status" => "PENDING",
            "approvedBy" => "Director of Health Services",
            "date" => null
        ]
    ],
    "calendarEvents" => [
        [
            "id" => "evt-01",
            "title" => "First Semester Course Registration Deadline",
            "date" => "August 15, 2026",
            "type" => "DEADLINE"
        ],
        [
            "id" => "evt-02",
            "title" => "Mid-Semester Continuous Assessment CBTs",
            "date" => "September 01 - September 05, 2026",
            "type" => "EXAMINATION"
        ],
        [
            "id" => "evt-03",
            "title" => "Mandatory Clinical Hospital Placement Posting",
            "date" => "October 10, 2026",
            "type" => "CLINICAL"
        ],
        [
            "id" => "evt-04",
            "title" => "First Semester Examination Week",
            "date" => "November 16 - November 27, 2026",
            "type" => "EXAMINATION"
        ]
    ]
];

echo json_encode([
    "success" => true,
    "matricNo" => $matricNo,
    "clearance" => $clearanceData
]);
exit();
