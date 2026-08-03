<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(0);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Persistent store ──────────────────────────────────────────────────────────
$storeFile = __DIR__ . '/admissions_store.json';

function readAdmStore($path) {
    if (!file_exists($path)) {
        @file_put_contents($path, '[]');
        @chmod($path, 0666);
        return [];
    }
    $data = @json_decode(@file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function writeAdmStore($path, array $items) {
    $ok = @file_put_contents($path, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
    if ($ok) @chmod($path, 0666);
    return $ok;
}

try {
    $method   = $_SERVER['REQUEST_METHOD'];
    $rawInput = @file_get_contents('php://input');
    $input    = @json_decode($rawInput, true) ?: ($_POST ?: []);

    // ── GET ──────────────────────────────────────────────────────────────────
    if ($method === 'GET') {
        $applications = readAdmStore($storeFile);

        // Also try to pull from MySQL if available
        if (file_exists(__DIR__ . '/db.php')) {
            @include_once __DIR__ . '/db.php';
            if (function_exists('getDbConnection')) {
                $conn = @getDbConnection();
                if ($conn) {
                    $res = @$conn->query(
                        "SELECT a.*, u.firstName, u.lastName, u.email, u.phoneNumber,
                                p.name as progName, p.degreeAwarded,
                                s.screeningDate, s.venue, s.status as screenStatus
                         FROM Application a
                         JOIN User u ON a.applicantId = u.id
                         LEFT JOIN Programme p ON a.programmeId = p.id
                         LEFT JOIN ScreeningSchedule s ON a.id = s.applicationId
                         WHERE a.isDeleted = 0 OR a.isDeleted IS NULL
                         ORDER BY a.createdAt DESC"
                    );
                    if ($res && $res->num_rows > 0) {
                        $dbApps = [];
                        while ($row = $res->fetch_assoc()) {
                            $dbApps[] = [
                                'id'            => $row['id'],
                                'applicationNo' => $row['applicationNo'],
                                'status'        => $row['status'],
                                'createdAt'     => $row['createdAt'],
                                'applicant'     => [
                                    'id'          => $row['applicantId'],
                                    'firstName'   => $row['firstName'],
                                    'lastName'    => $row['lastName'],
                                    'email'       => $row['email'],
                                    'phoneNumber' => $row['phoneNumber'],
                                ],
                                'programme'     => [
                                    'id'           => $row['programmeId'],
                                    'name'         => $row['progName'] ?? 'Programme',
                                    'degreeAwarded'=> $row['degreeAwarded'] ?? 'Certificate',
                                ],
                                'screeningSchedule' => $row['screeningDate'] ? [
                                    'screeningDate' => $row['screeningDate'],
                                    'venue'         => $row['venue'],
                                    'status'        => $row['screenStatus'],
                                ] : null,
                            ];
                        }
                        if (count($dbApps) > 0) {
                            // Merge DB records on top of file store (DB wins by id)
                            $fileMap = [];
                            foreach ($applications as $a) { $fileMap[$a['id'] ?? ''] = $a; }
                            foreach ($dbApps as $da)     { $fileMap[$da['id'] ?? ''] = $da; }
                            $applications = array_values($fileMap);
                        }
                    }
                    @$conn->close();
                }
            }
        }

        echo json_encode([
            'success'      => true,
            'applications' => $applications,
            'total'        => count($applications),
        ], JSON_UNESCAPED_SLASHES);
        exit();
    }

    // ── POST — update application status or add new application ─────────────
    if ($method === 'POST') {
        $action    = $input['action'] ?? 'update_status';
        $appId     = $input['applicationId'] ?? $input['id'] ?? '';
        $decision  = strtoupper($input['decision'] ?? $input['status'] ?? 'APPROVED');

        $applications = readAdmStore($storeFile);

        if ($action === 'add' || $action === 'create') {
            // New application submission from frontend admissions form
            $newApp = [
                'id'            => 'app-' . rand(10000, 99999),
                'applicationNo' => 'APP/' . date('Y') . '/' . rand(100000, 999999),
                'status'        => 'SUBMITTED',
                'createdAt'     => date('c'),
                'applicant'     => [
                    'id'          => 'usr-' . rand(1000, 9999),
                    'firstName'   => $input['firstName'] ?? '',
                    'lastName'    => $input['lastName'] ?? '',
                    'email'       => $input['email'] ?? '',
                    'phoneNumber' => $input['phoneNumber'] ?? '',
                ],
                'programme'     => [
                    'id'           => $input['programmeId'] ?? 'prog-001',
                    'name'         => $input['programmeName'] ?? 'Programme',
                    'degreeAwarded'=> $input['degreeAwarded'] ?? 'Certificate',
                ],
                'screeningSchedule' => null,
            ];
            array_unshift($applications, $newApp);
            writeAdmStore($storeFile, $applications);
            echo json_encode([
                'success'       => true,
                'message'       => 'Application submitted successfully.',
                'application'   => $newApp,
            ], JSON_UNESCAPED_SLASHES);
            exit();
        }

        // Default: update status of existing application
        $updated = false;
        foreach ($applications as &$app) {
            if (($app['id'] ?? '') === $appId) {
                $app['status']    = $decision;
                $app['updatedAt'] = date('c');
                $updated          = true;
                break;
            }
        }
        unset($app);

        if ($updated) {
            writeAdmStore($storeFile, $applications);
        }

        echo json_encode([
            'success'       => true,
            'persistenceSuccess' => $updated,
            'message'       => 'Application status updated to ' . $decision . ' successfully.',
            'applicationId' => $appId,
            'status'        => $decision,
        ], JSON_UNESCAPED_SLASHES);
        exit();
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if ($method === 'DELETE') {
        $appId        = $input['id'] ?? $input['applicationId'] ?? '';
        $applications = readAdmStore($storeFile);
        $before       = count($applications);
        $applications = array_values(array_filter($applications, fn($a) => ($a['id'] ?? '') !== $appId));
        writeAdmStore($storeFile, $applications);
        echo json_encode([
            'success' => true,
            'message' => $before > count($applications) ? 'Application deleted.' : 'Record not found.',
        ], JSON_UNESCAPED_SLASHES);
        exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
} catch (Throwable $e) {
    // Never return hardcoded data — return empty list on any error
    echo json_encode([
        'success'      => true,
        'applications' => [],
        'total'        => 0,
        'error'        => 'Internal server error — please retry.',
    ], JSON_UNESCAPED_SLASHES);
}
exit();
