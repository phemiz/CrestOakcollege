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

$dir = __DIR__;

// ── Persistent stores ────────────────────────────────────────────────────────
$programmesFile  = $dir . '/programmes_store.json';
$facultiesFile   = $dir . '/faculties_store.json';
$departmentsFile = $dir . '/departments_store.json';

function readPStore($path) {
    if (!file_exists($path)) return [];
    $data = @json_decode(@file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function writePStore($path, array $items) {
    $ok = @file_put_contents($path, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
    if ($ok) @chmod($path, 0666);
    return $ok;
}

// ── Canonical static reference data (never changes without admin action) ─────
$canonicalDepartments = [
    ['id' => 'dept-health-001', 'name' => 'Department of Nursing Sciences',            'code' => 'NUR'],
    ['id' => 'dept-health-002', 'name' => 'Department of Medical Laboratory Science',  'code' => 'MLS'],
    ['id' => 'dept-health-003', 'name' => 'Department of Community Health Sciences',   'code' => 'CHEW'],
    ['id' => 'dept-mgmt-001',   'name' => 'Department of Business Administration',     'code' => 'BUS'],
    ['id' => 'dept-tech-001',   'name' => 'Department of Computer Science & IT',       'code' => 'CSC'],
];

$canonicalFaculties = [
    [
        'id'          => 'fac-001',
        'name'        => 'Faculty of Health Sciences',
        'code'        => 'FHS',
        'description' => 'Nursing, Medical Laboratory, CHEW, and Public Health',
        'departments' => [
            $canonicalDepartments[0],
            $canonicalDepartments[1],
            $canonicalDepartments[2],
        ],
    ],
    [
        'id'          => 'fac-002',
        'name'        => 'Faculty of Management & Humanities',
        'code'        => 'FMH',
        'description' => 'Business Admin, Accounting, Criminology & Security Studies',
        'departments' => [
            $canonicalDepartments[3],
            ['id' => 'dept-mgmt-002', 'name' => 'Department of Criminology & Security Studies', 'code' => 'CSS'],
        ],
    ],
    [
        'id'          => 'fac-003',
        'name'        => 'Faculty of Science & Technology',
        'code'        => 'FST',
        'description' => 'Computer Science, Software Engineering, AI & Cyber Security',
        'departments' => [$canonicalDepartments[4]],
    ],
];

$canonicalProgrammes = [
    ['id' => 'prog-001', 'name' => 'Nursing Sciences (B.N.Sc)',                    'code' => 'NUR',  'durationYears' => 5, 'degreeAwarded' => 'B.N.Sc.',        'department' => $canonicalDepartments[0]],
    ['id' => 'prog-002', 'name' => 'Medical Laboratory Science (B.MLS)',           'code' => 'MLS',  'durationYears' => 5, 'degreeAwarded' => 'B.MLS',          'department' => $canonicalDepartments[1]],
    ['id' => 'prog-003', 'name' => 'Community Health Extension Worker (CHEW)',     'code' => 'CHEW', 'durationYears' => 3, 'degreeAwarded' => 'Diploma / CHEW', 'department' => $canonicalDepartments[2]],
    ['id' => 'prog-004', 'name' => 'Business Administration & Management (B.Sc)', 'code' => 'BUS',  'durationYears' => 4, 'degreeAwarded' => 'B.Sc.',          'department' => $canonicalDepartments[3]],
    ['id' => 'prog-005', 'name' => 'Computer Science & Artificial Intelligence (B.Sc)', 'code' => 'CSC', 'durationYears' => 4, 'degreeAwarded' => 'B.Sc.', 'department' => $canonicalDepartments[4]],
];

// Seed store files if they don't exist yet (one-time init)
if (!file_exists($programmesFile))  writePStore($programmesFile,  $canonicalProgrammes);
if (!file_exists($facultiesFile))   writePStore($facultiesFile,   $canonicalFaculties);
if (!file_exists($departmentsFile)) writePStore($departmentsFile, $canonicalDepartments);

try {
    $method   = $_SERVER['REQUEST_METHOD'];
    $rawInput = @file_get_contents('php://input');
    $input    = @json_decode($rawInput, true) ?: ($_POST ?: []);

    if ($method === 'GET') {
        // Read live from store files; canonical arrays are the seed/fallback
        $programmes  = readPStore($programmesFile)  ?: $canonicalProgrammes;
        $faculties   = readPStore($facultiesFile)   ?: $canonicalFaculties;
        $departments = readPStore($departmentsFile) ?: $canonicalDepartments;

        echo json_encode([
            'success'     => true,
            'programmes'  => $programmes,
            'faculties'   => $faculties,
            'departments' => $departments,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        $type = $input['type'] ?? 'programme';

        if ($type === 'programme') {
            $programmes = readPStore($programmesFile) ?: $canonicalProgrammes;
            $newId      = $input['id'] ?? ('prog-' . rand(100, 999));
            $record     = [
                'id'            => $newId,
                'name'          => $input['name'] ?? 'New Programme',
                'code'          => strtoupper($input['code'] ?? 'PROG'),
                'durationYears' => intval($input['durationYears'] ?? 4),
                'degreeAwarded' => $input['degreeAwarded'] ?? 'B.Sc.',
                'department'    => $input['department'] ?? $canonicalDepartments[0],
            ];
            // Upsert
            $idx = array_search($newId, array_column($programmes, 'id'));
            if ($idx !== false) { $programmes[$idx] = $record; }
            else                { array_unshift($programmes, $record); }
            writePStore($programmesFile, $programmes);

        } elseif ($type === 'faculty') {
            $faculties = readPStore($facultiesFile) ?: $canonicalFaculties;
            $newId     = $input['id'] ?? ('fac-' . rand(100, 999));
            $record    = [
                'id'          => $newId,
                'name'        => $input['name'] ?? 'New Faculty',
                'code'        => strtoupper($input['code'] ?? 'FAC'),
                'description' => $input['description'] ?? '',
                'departments' => $input['departments'] ?? [],
            ];
            $idx = array_search($newId, array_column($faculties, 'id'));
            if ($idx !== false) { $faculties[$idx] = $record; }
            else                { array_unshift($faculties, $record); }
            writePStore($facultiesFile, $faculties);

        } elseif ($type === 'department') {
            $departments = readPStore($departmentsFile) ?: $canonicalDepartments;
            $newId       = $input['id'] ?? ('dept-' . rand(1000, 9999));
            $record      = [
                'id'   => $newId,
                'name' => $input['name'] ?? 'New Department',
                'code' => strtoupper($input['code'] ?? 'DEPT'),
            ];
            $idx = array_search($newId, array_column($departments, 'id'));
            if ($idx !== false) { $departments[$idx] = $record; }
            else                { array_unshift($departments, $record); }
            writePStore($departmentsFile, $departments);
        }

        echo json_encode([
            'success' => true,
            'message' => ucfirst($type) . ' saved successfully.',
        ], JSON_UNESCAPED_SLASHES);
        exit();
    }

    if ($method === 'DELETE') {
        $type  = $input['type'] ?? 'programme';
        $delId = $input['id'] ?? '';

        if ($type === 'programme') {
            $items = readPStore($programmesFile);
            $items = array_values(array_filter($items, fn($x) => ($x['id'] ?? '') !== $delId));
            writePStore($programmesFile, $items);
        } elseif ($type === 'faculty') {
            $items = readPStore($facultiesFile);
            $items = array_values(array_filter($items, fn($x) => ($x['id'] ?? '') !== $delId));
            writePStore($facultiesFile, $items);
        } elseif ($type === 'department') {
            $items = readPStore($departmentsFile);
            $items = array_values(array_filter($items, fn($x) => ($x['id'] ?? '') !== $delId));
            writePStore($departmentsFile, $items);
        }

        echo json_encode(['success' => true, 'message' => ucfirst($type) . ' deleted successfully.']);
        exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
} catch (Throwable $e) {
    echo json_encode([
        'success'     => true,
        'programmes'  => $canonicalProgrammes,
        'faculties'   => $canonicalFaculties,
        'departments' => $canonicalDepartments,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}
exit();
