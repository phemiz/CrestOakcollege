<?php
require_once __DIR__ . '/_common.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    planner_read_session();
    $conn = planner_db();
    $vid = (int)($_GET['version_id'] ?? 0);
    if ($vid <= 0) {
        planner_json(['success' => false, 'message' => 'version_id required.'], 400);
    }
    $st = $conn->prepare('SELECT s.id, s.tt_course_id, s.day_of_week,'
        . ' s.period_no, s.is_locked, c.code, c.title, c.level_no,'
        . ' c.programme_code, c.lecturer_id, l.full_name'
        . ' FROM tt_slots s JOIN tt_courses c ON c.id = s.tt_course_id'
        . ' LEFT JOIN tt_lecturers l ON l.id = c.lecturer_id'
        . ' WHERE s.version_id = ? ORDER BY s.day_of_week, s.period_no');
    $st->bind_param('i', $vid);
    $st->execute();
    $res = $st->get_result();
    $slots = [];
    while ($r = $res->fetch_assoc()) {
        $slots[] = [
            'id' => (int)$r['id'],
            'courseId' => (int)$r['tt_course_id'],
            'day' => (int)$r['day_of_week'],
            'period' => (int)$r['period_no'],
            'locked' => (bool)$r['is_locked'],
            'code' => $r['code'],
            'title' => $r['title'],
            'level' => (int)$r['level_no'],
            'programmeCode' => $r['programme_code'],
            'lecturerId' => $r['lecturer_id'] === null ? null : (int)$r['lecturer_id'],
            'lecturerName' => $r['full_name']
        ];
    }
    $periods = [];
    $res = $conn->query('SELECT period_no, label FROM tt_periods ORDER BY period_no');
    while ($p = $res->fetch_assoc()) {
        $periods[] = ['period' => (int)$p['period_no'], 'label' => $p['label']];
    }
    planner_json(['success' => true, 'slots' => $slots, 'periods' => $periods]);
}

if ($method !== 'POST') {
    planner_json(['success' => false, 'message' => 'Method not allowed.'], 405);
}

planner_write_session();
$conn = planner_db();
$in = planner_input();
$action = $in['action'] ?? '';

function one($conn, string $sql, string $types, array $args) {
    $st = $conn->prepare($sql);
    $st->bind_param($types, ...$args);
    $st->execute();
    return $st->get_result()->fetch_assoc();
}

function draft_or_stop($conn, int $vid): void {
    $v = one($conn, 'SELECT status FROM tt_versions WHERE id = ?', 'i', [$vid]);
    if (!$v) {
        planner_json(['success' => false, 'message' => 'Version not found.'], 404);
    }
    if ($v['status'] !== 'DRAFT') {
        planner_json(['success' => false,
            'message' => 'Only a draft timetable can be changed.'], 400);
    }
}

function find_conflicts($conn, array $c, int $day, int $period, int $skip): array {
    $vid = (int)$c['version_id'];
    $cid = (int)$c['id'];
    $out = [];
    if (!empty($c['lecturer_id'])) {
        $lid = (int)$c['lecturer_id'];
        $r = one($conn, 'SELECT c.code FROM tt_slots s JOIN tt_courses c'
            . ' ON c.id = s.tt_course_id WHERE s.version_id=? AND'
            . ' s.day_of_week=? AND s.period_no=? AND s.id<>? AND'
            . ' c.lecturer_id=? LIMIT 1', 'iiiii',
            [$vid, $day, $period, $skip, $lid]);
        if ($r) {
            $out[] = 'The lecturer is already teaching ' . $r['code'] . ' in this period.';
        }
        $n = one($conn, 'SELECT COUNT(*) AS n FROM tt_availability'
            . ' WHERE lecturer_id=?', 'i', [$lid]);
        if ((int)$n['n'] > 0) {
            $ok = one($conn, 'SELECT COUNT(*) AS n FROM tt_availability a'
                . ' JOIN tt_periods p ON p.period_no=? WHERE a.lecturer_id=?'
                . ' AND a.day_of_week=? AND a.start_time<=p.start_time'
                . ' AND a.end_time>=p.end_time', 'iii', [$period, $lid, $day]);
            if ((int)$ok['n'] === 0) {
                $out[] = 'This period is outside the lecturer\'s available times.';
            }
        }
    }
    $lvl = (int)$c['level_no'];
    $prog = $c['programme_code'];
    $r = one($conn, 'SELECT c.code FROM tt_slots s JOIN tt_courses c'
        . ' ON c.id = s.tt_course_id WHERE s.version_id=? AND'
        . ' s.day_of_week=? AND s.period_no=? AND s.id<>? AND'
        . ' c.level_no=? AND c.programme_code <=> ? LIMIT 1', 'iiiiis',
        [$vid, $day, $period, $skip, $lvl, $prog]);
    if ($r) {
        $out[] = 'This level and programme already has ' . $r['code'] . ' in this period.';
    }
    return $out;
}

if ($action === 'place') {
    $cid = (int)($in['courseId'] ?? 0);
    $day = (int)($in['day'] ?? 0);
    $period = (int)($in['period'] ?? 0);
    if ($cid <= 0 || $day < 1 || $day > 5 || $period < 1 || $period > 8) {
        planner_json(['success' => false, 'message' => 'Course, day (1-5) and period (1-8) required.'], 400);
    }
    $c = one($conn, 'SELECT * FROM tt_courses WHERE id = ?', 'i', [$cid]);
    if (!$c) {
        planner_json(['success' => false, 'message' => 'Course not found.'], 404);
    }
    draft_or_stop($conn, (int)$c['version_id']);
    $n = one($conn, 'SELECT COUNT(*) AS n FROM tt_slots WHERE tt_course_id=?', 'i', [$cid]);
    if ((int)$n['n'] >= (int)$c['sessions_per_week']) {
        planner_json(['success' => false,
            'message' => 'This course already has all its weekly sessions placed.'], 409);
    }
    $bad = find_conflicts($conn, $c, $day, $period, 0);
    if ($bad) {
        planner_json(['success' => false, 'message' => $bad[0], 'conflicts' => $bad], 409);
    }
    $locked = !empty($in['locked']) ? 1 : 0;
    $vid = (int)$c['version_id'];
    $st = $conn->prepare('INSERT INTO tt_slots (version_id, tt_course_id,'
        . ' day_of_week, period_no, is_locked) VALUES (?,?,?,?,?)');
    $st->bind_param('iiiii', $vid, $cid, $day, $period, $locked);
    $st->execute();
    planner_json(['success' => true, 'id' => (int)$conn->insert_id]);
}

$sid = (int)($in['id'] ?? 0);
$slot = one($conn, 'SELECT * FROM tt_slots WHERE id = ?', 'i', [$sid]);
if (!$slot) {
    planner_json(['success' => false, 'message' => 'Slot not found.'], 404);
}
draft_or_stop($conn, (int)$slot['version_id']);

if ($action === 'move') {
    $day = (int)($in['day'] ?? 0);
    $period = (int)($in['period'] ?? 0);
    if ($day < 1 || $day > 5 || $period < 1 || $period > 8) {
        planner_json(['success' => false, 'message' => 'Day (1-5) and period (1-8) required.'], 400);
    }
    $c = one($conn, 'SELECT * FROM tt_courses WHERE id = ?', 'i', [(int)$slot['tt_course_id']]);
    $bad = find_conflicts($conn, $c, $day, $period, $sid);
    if ($bad) {
        planner_json(['success' => false, 'message' => $bad[0], 'conflicts' => $bad], 409);
    }
    $st = $conn->prepare('UPDATE tt_slots SET day_of_week=?, period_no=? WHERE id=?');
    $st->bind_param('iii', $day, $period, $sid);
    $st->execute();
    planner_json(['success' => true]);
}

if ($action === 'lock') {
    $locked = !empty($in['locked']) ? 1 : 0;
    $st = $conn->prepare('UPDATE tt_slots SET is_locked=? WHERE id=?');
    $st->bind_param('ii', $locked, $sid);
    $st->execute();
    planner_json(['success' => true]);
}

if ($action === 'remove') {
    $st = $conn->prepare('DELETE FROM tt_slots WHERE id = ?');
    $st->bind_param('i', $sid);
    $st->execute();
    planner_json(['success' => true]);
}

planner_json(['success' => false, 'message' => 'Unknown action.'], 400);
