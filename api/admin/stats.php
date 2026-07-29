<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = [
    "success" => true,
    "data" => [
        "studentsCount" => 1250,
        "staffCount" => 84,
        "coursesCount" => 42,
        "pendingAppsCount" => 158,
        "totalRevenue" => 48500000.00,
        "activeSession" => [
            "name" => "2025/2026 Academic Session"
        ],
        "recentAudits" => [
            [
                "id" => "log-001",
                "createdAt" => date('c', strtotime('-15 minutes')),
                "action" => "CREATE",
                "entity" => "Student",
                "entityId" => "STU/2026/042",
                "ipAddress" => "197.210.64.12",
                "user" => [
                    "firstName" => "Admissions",
                    "lastName" => "Officer",
                    "email" => "admissions@crestoakcollege.com.ng"
                ]
            ],
            [
                "id" => "log-002",
                "createdAt" => date('c', strtotime('-1 hour')),
                "action" => "UPDATE",
                "entity" => "Payment",
                "entityId" => "PAY-884920",
                "ipAddress" => "102.89.23.45",
                "user" => [
                    "firstName" => "Bursary",
                    "lastName" => "Manager",
                    "email" => "bursary@crestoakcollege.com.ng"
                ]
            ]
        ]
    ]
];

echo json_encode($response);
exit();
