<?php
require_once __DIR__ . '/_common.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    planner_read_session();
    $conn = planner_db();
    $rows = [];
    $q = 'SELECT id, full_name, email, phone, is_permanent'
       . ' FROM tt_lecturers ORDER BY full_name';
    $res = $conn->query($q);
    while ($r = $res->fetch_assoc()) {
        $id = (int)$r['id'];
        $rows[$id] = [
            'id' => $id,
            'fullName' => $r['full_name'],
            'email' => $r['email'],
            'phone' => $r['phone'],
            'isPermanent' => (bool)$r['is_permanent'],
            'availability' => []
        ];
    }
    $q = 'SELECT lecturer_id, day_of_week,'
       . ' TIME_FORMAT(start_time, "%H:%i") AS s,'
       . ' TIME_FORMAT(end_time, "%H:%i") AS e'
       . ' FROM tt_availability ORDER BY day_of_week, start_time';
    $res = $conn->query($q);
    while ($a = $res->fetch_assoc()) {
        $lid = (int)$a['lecturer_id'];
        if (isset($rows[$lid])) {
            $rows[$lid]['availability'][] = [
                'day' => (int)$a['day_of_week'],
                'start' => $a['s'],
                'end' => $a['e']
            ];
        }
    }
    planner_json(['success' => true, 'lecturers' => array_values($rows)]);
}

if ($method !== 'POST') {
    planner_json(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$sess = planner_write_session();
$conn = planner_db();
$in = planner_input();
$action = $in['action'] ?? 'save';

if ($action === 'delete') {
    $id = (int)($in['id'] ?? 0);
    if ($id <= 0) {
        planner_json(['success' => false, 'message' => 'Lecturer id required.'], 400);
    }
    $st = $conn->prepare('DELETE FROM tt_lecturers WHERE id = ?');
    $st->bind_param('i', $id);
    $st->execute();
    planner_json(['success' => true]);
}

function norm_time($t) {
    if (!preg_match('/^([01]?\d|2[0-3]):([0-5]\d)$/', (string)$t, $m)) {
        return null;
    }
    return sprintf('%02d:%s:00', $m[1], $m[2]);
}

$name = trim($in['fullName'] ?? '');
if ($name === '') {
    planner_json(['success' => false, 'message' => 'Lecturer name is required.'], 400);
}
$email = trim($in['email'] ?? '');
$email = ($email === '') ? null : $email;
$phone = trim($in['phone'] ?? '');
$phone = ($phone === '') ? null : $phone;
$perm = !empty($in['isPermanent']) ? 1 : 0;
$id = (int)($in['id'] ?? 0);

$avail = [];
foreach (($in['availability'] ?? []) as $a) {
    $d = (int)($a['day'] ?? 0);
    $t1 = norm_time($a['start'] ?? '');
    $t2 = norm_time($a['end'] ?? '');
    if ($d < 1 || $d > 5 || !$t1 || !$t2 || $t1 >= $t2
        || $t1 < '08:00:00' || $t2 > '16:00:00') {
        planner_json(['success' => false,
            'message' => 'Availability must be Mon-Fri, between 8:00 AM and 4:00 PM.'], 400);
    }
    $avail[] = [$d, $t1, $t2];
}

try {
    $conn->begin_transaction();
    if ($id > 0) {
        $st = $conn->prepare('UPDATE tt_lecturers SET full_name=?, email=?,'
            . ' phone=?, is_permanent=? WHERE id=?');
        $st->bind_param('sssii', $name, $email, $phone, $perm, $id);
        $st->execute();
    } else {
        $st = $conn->prepare('INSERT INTO tt_lecturers'
            . ' (full_name, email, phone, is_permanent) VALUES (?,?,?,?)');
        $st->bind_param('sssi', $name, $email, $phone, $perm);
        $st->execute();
        $id = (int)$conn->insert_id;
    }
    $st = $conn->prepare('DELETE FROM tt_availability WHERE lecturer_id = ?');
    $st->bind_param('i', $id);
    $st->execute();
    $st = $conn->prepare('INSERT INTO tt_availability'
        . ' (lecturer_id, day_of_week, start_time, end_time) VALUES (?,?,?,?)');
    foreach ($avail as $w) {
        $st->bind_param('iiss', $id, $w[0], $w[1], $w[2]);
        $st->execute();
    }
    $conn->commit();
    planner_json(['success' => true, 'id' => $id]);
} catch (Throwable $e) {
    $conn->rollback();
    error_log('planner lecturers: ' . $e->getMessage());
    planner_json(['success' => false, 'message' => 'Could not save lecturer.'], 500);
}
