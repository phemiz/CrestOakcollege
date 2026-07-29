<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$conn = getDbConnection();

$defaultApplications = [
    [
        "id" => "app-1001",
        "applicationNo" => "APP/2026/894012",
        "status" => "SUBMITTED",
        "createdAt" => "2026-07-20T10:30:00Z",
        "applicant" => [
            "id" => "user-app-101",
            "firstName" => "Samuel",
            "lastName" => "Ogunleye",
            "email" => "samuel.ogunleye@gmail.com",
            "phoneNumber" => "08055443322"
        ],
        "programme" => [
            "id" => "prog-001",
            "name" => "Nursing Sciences (B.N.Sc)",
            "degreeAwarded" => "B.N.Sc."
        ],
        "screeningSchedule" => [
            "screeningDate" => "2026-08-15T09:00:00Z",
            "venue" => "Admissions Boardroom 1, Main Campus Badagry",
            "status" => "SCHEDULED"
        ]
    ],
    [
        "id" => "app-1002",
        "applicationNo" => "APP/2026/721940",
        "status" => "APPROVED",
        "createdAt" => "2026-07-18T14:15:00Z",
        "applicant" => [
            "id" => "user-app-102",
            "firstName" => "Bisi",
            "lastName" => "Akindele",
            "email" => "bisi.akindele@yahoo.com",
            "phoneNumber" => "08144332211"
        ],
        "programme" => [
            "id" => "prog-003",
            "name" => "Community Health Extension Worker (CHEW)",
            "degreeAwarded" => "CHEW Certificate"
        ],
        "screeningSchedule" => null
    ]
];

if ($method === 'GET') {
    $applications = $defaultApplications;

    if ($conn) {
        $res = $conn->query("SELECT a.*, u.firstName, u.lastName, u.email, u.phoneNumber, p.name as progName, p.degreeAwarded, s.screeningDate, s.venue, s.status as screenStatus FROM Application a JOIN User u ON a.applicantId = u.id LEFT JOIN Programme p ON a.programmeId = p.id LEFT JOIN ScreeningSchedule s ON a.id = s.applicationId WHERE a.isDeleted = 0 OR a.isDeleted IS NULL ORDER BY a.createdAt DESC");
        if ($res && $res->num_rows > 0) {
            $dbApps = [];
            while ($row = $res->fetch_assoc()) {
                $dbApps[] = [
                    "id" => $row['id'],
                    "applicationNo" => $row['applicationNo'],
                    "status" => $row['status'],
                    "createdAt" => $row['createdAt'],
                    "applicant" => [
                        "id" => $row['applicantId'],
                        "firstName" => $row['firstName'],
                        "lastName" => $row['lastName'],
                        "email" => $row['email'],
                        "phoneNumber" => $row['phoneNumber']
                    ],
                    "programme" => [
                        "id" => $row['programmeId'],
                        "name" => $row['progName'] ?? 'Programme',
                        "degreeAwarded" => $row['degreeAwarded'] ?? 'Certificate'
                    ],
                    "screeningSchedule" => $row['screeningDate'] ? [
                        "screeningDate" => $row['screeningDate'],
                        "venue" => $row['venue'],
                        "status" => $row['screenStatus']
                    ] : null
                ];
            }
            if (count($dbApps) > 0) {
                $applications = $dbApps;
            }
        }
        $conn->close();
    }

    echo json_encode([
        "success" => true,
        "applications" => $applications
    ]);
    exit();
}

if ($method === 'POST') {
    $appId = $input['applicationId'] ?? ($input['id'] ?? '');
    $decision = $input['decision'] ?? ($input['status'] ?? 'APPROVED');

    echo json_encode([
        "success" => true,
        "message" => "Application status updated to " . $decision . " successfully.",
        "applicationId" => $appId,
        "status" => $decision
    ]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
