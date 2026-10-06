<?php
require_once __DIR__ . '/_common.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    planner_read_session();
    $conn = planner_db();
    $out = [];
    $q = 'SELECT id, name, session_label, semester, status,'
       . ' created_at, published_at FROM tt_versions ORDER BY id DESC';
    $res = $conn->query($q);
    while ($r = $res->fetch_assoc()) {
        $out[] = [
            'id' => (int)$r['id'],
            'name' => $r['name'],
            'sessionLabel' => $r['session_label'],
            'semester' => $r['semester'],
            'status' => $r['status'],
            'createdAt' => $r['created_at'],
            'publishedAt' => $r['published_at']
        ];
    }
    planner_json(['success' => true, 'versions' => $out]);
}

if ($method !== 'POST') {
    planner_json(['success' => false, 'message' => 'Method not allowed.'], 405);
}

planner_write_session();
$conn = planner_db();
$in = planner_input();
$action = $in['action'] ?? '';

if ($action === 'create') {
    $name = trim($in['name'] ?? '');
    $sess = trim($in['sessionLabel'] ?? '');
    $sem = strtoupper(trim($in['semester'] ?? ''));
    if ($name === '' || !preg_match('/^\d{4}\/\d{4}$/', $sess)
        || !in_array($sem, ['FIRST', 'SECOND'], true)) {
        planner_json(['success' => false,
            'message' => 'Name, session (e.g. 2026/2027) and semester are required.'], 400);
    }
    $st = $conn->prepare('INSERT INTO tt_versions'
        . ' (name, session_label, semester) VALUES (?,?,?)');
    $st->bind_param('sss', $name, $sess, $sem);
    $st->execute();
    planner_json(['success' => true, 'id' => (int)$conn->insert_id]);
}

$id = (int)($in['id'] ?? 0);
if ($id <= 0) {
    planner_json(['success' => false, 'message' => 'Version id required.'], 400);
}
$st = $conn->prepare('SELECT status, session_label, semester'
    . ' FROM tt_versions WHERE id = ?');
$st->bind_param('i', $id);
$st->execute();
$v = $st->get_result()->fetch_assoc();
if (!$v) {
    planner_json(['success' => false, 'message' => 'Version not found.'], 404);
}

if ($action === 'publish') {
    if ($v['status'] !== 'DRAFT') {
        planner_json(['success' => false, 'message' => 'Only a draft can be published.'], 400);
    }
    try {
        $conn->begin_transaction();
        $st = $conn->prepare("UPDATE tt_versions SET status='ARCHIVED'"
            . " WHERE session_label=? AND semester=? AND status='PUBLISHED'");
        $st->bind_param('ss', $v['session_label'], $v['semester']);
        $st->execute();
        $st = $conn->prepare("UPDATE tt_versions SET status='PUBLISHED',"
            . ' published_at=NOW() WHERE id=?');
        $st->bind_param('i', $id);
        $st->execute();
        $conn->commit();
        planner_json(['success' => true]);
    } catch (Throwable $e) {
        $conn->rollback();
        error_log('planner versions: ' . $e->getMessage());
        planner_json(['success' => false, 'message' => 'Could not publish.'], 500);
    }
}

if ($action === 'delete') {
    if ($v['status'] !== 'DRAFT') {
        planner_json(['success' => false, 'message' => 'Only a draft can be deleted.'], 400);
    }
    $st = $conn->prepare('DELETE FROM tt_versions WHERE id = ?');
    $st->bind_param('i', $id);
    $st->execute();
    planner_json(['success' => true]);
}

planner_json(['success' => false, 'message' => 'Unknown action.'], 400);
