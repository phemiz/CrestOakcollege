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
    $st = $conn->prepare('SELECT c.id, c.course_id, c.code, c.title,'
        . ' c.programme_code, c.department, c.level_no, c.lecturer_id,'
        . ' c.sessions_per_week, l.full_name'
        . ' FROM tt_courses c LEFT JOIN tt_lecturers l'
        . ' ON l.id = c.lecturer_id WHERE c.version_id = ?'
        . ' ORDER BY c.level_no, c.code');
    $st->bind_param('i', $vid);
    $st->execute();
    $res = $st->get_result();
    $out = [];
    while ($r = $res->fetch_assoc()) {
        $out[] = [
            'id' => (int)$r['id'],
            'courseId' => $r['course_id'] === null ? null : (int)$r['course_id'],
            'code' => $r['code'],
            'title' => $r['title'],
            'programmeCode' => $r['programme_code'],
            'department' => $r['department'],
            'level' => (int)$r['level_no'],
            'lecturerId' => $r['lecturer_id'] === null ? null : (int)$r['lecturer_id'],
            'lecturerName' => $r['full_name'],
            'sessionsPerWeek' => (int)$r['sessions_per_week']
        ];
    }
    planner_json(['success' => true, 'courses' => $out]);
}

if ($method !== 'POST') {
    planner_json(['success' => false, 'message' => 'Method not allowed.'], 405);
}

planner_write_session();
$conn = planner_db();
$in = planner_input();
$action = $in['action'] ?? 'save';

function must_be_draft($conn, int $vid): void {
    $st = $conn->prepare('SELECT status FROM tt_versions WHERE id = ?');
    $st->bind_param('i', $vid);
    $st->execute();
    $v = $st->get_result()->fetch_assoc();
    if (!$v) {
        planner_json(['success' => false, 'message' => 'Version not found.'], 404);
    }
    if ($v['status'] !== 'DRAFT') {
        planner_json(['success' => false,
            'message' => 'Only a draft timetable can be changed.'], 400);
    }
}

if ($action === 'delete') {
    $id = (int)($in['id'] ?? 0);
    $st = $conn->prepare('SELECT version_id FROM tt_courses WHERE id = ?');
    $st->bind_param('i', $id);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();
    if (!$row) {
        planner_json(['success' => false, 'message' => 'Course not found.'], 404);
    }
    must_be_draft($conn, (int)$row['version_id']);
    $st = $conn->prepare('DELETE FROM tt_courses WHERE id = ?');
    $st->bind_param('i', $id);
    $st->execute();
    planner_json(['success' => true]);
}

$id = (int)($in['id'] ?? 0);
$vid = (int)($in['versionId'] ?? 0);
if ($id > 0) {
    $st = $conn->prepare('SELECT version_id FROM tt_courses WHERE id = ?');
    $st->bind_param('i', $id);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();
    if (!$row) {
        planner_json(['success' => false, 'message' => 'Course not found.'], 404);
    }
    $vid = (int)$row['version_id'];
}
if ($vid <= 0) {
    planner_json(['success' => false, 'message' => 'versionId required.'], 400);
}
must_be_draft($conn, $vid);

$code = strtoupper(trim($in['code'] ?? ''));
$title = trim($in['title'] ?? '');
$prog = trim($in['programmeCode'] ?? '');
$prog = ($prog === '') ? null : $prog;
$dept = trim($in['department'] ?? '');
$dept = ($dept === '') ? null : $dept;
$level = (int)($in['level'] ?? 0);
$spw = (int)($in['sessionsPerWeek'] ?? 1);
$lec = (int)($in['lecturerId'] ?? 0);
$lec = ($lec > 0) ? $lec : null;
$cid = (int)($in['courseId'] ?? 0);
$cid = ($cid > 0) ? $cid : null;

if ($code === '' || $title === '' || $level < 100 || $level > 600
    || $spw < 1 || $spw > 5) {
    planner_json(['success' => false,
        'message' => 'Code, title, level (100-600) and 1-5 sessions are required.'], 400);
}

try {
    if ($id > 0) {
        $st = $conn->prepare('UPDATE tt_courses SET course_id=?, code=?,'
            . ' title=?, programme_code=?, department=?, level_no=?,'
            . ' lecturer_id=?, sessions_per_week=? WHERE id=?');
        $st->bind_param('issssiiii', $cid, $code, $title, $prog,
            $dept, $level, $lec, $spw, $id);
        $st->execute();
    } else {
        $st = $conn->prepare('INSERT INTO tt_courses (version_id, course_id,'
            . ' code, title, programme_code, department, level_no,'
            . ' lecturer_id, sessions_per_week) VALUES (?,?,?,?,?,?,?,?,?)');
        $st->bind_param('iissssiii', $vid, $cid, $code, $title,
            $prog, $dept, $level, $lec, $spw);
        $st->execute();
        $id = (int)$conn->insert_id;
    }
    planner_json(['success' => true, 'id' => $id]);
} catch (Throwable $e) {
    error_log('planner courses: ' . $e->getMessage());
    planner_json(['success' => false, 'message' => 'Could not save course.'], 500);
}
