<?php
require_once __DIR__.'/../auth/session.php';
require_session(['ADMIN','SUPERADMIN']);
// Mirror — delegate to main api/admin/admissions.php
$target = realpath(__DIR__ . '/../../api/admin/admissions.php');
if ($target && file_exists($target)) { require_once $target; exit; }

// Inline fallback: return live admissions_store data, no hardcoded records
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0); error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$dir       = realpath(__DIR__ . '/../../api/admin') ?: __DIR__;
$storePath = $dir . '/admissions_store.json';

function readA($p) {
    if (!file_exists($p)) { @file_put_contents($p,'[]'); return []; }
    $d = @json_decode(@file_get_contents($p), true);
    return is_array($d) ? $d : [];
}
function writeA($p, $d) {
    $ok = @file_put_contents($p, json_encode($d, JSON_PRETTY_PRINT)) !== false;
    if ($ok) @chmod($p, 0644); return $ok;
}

$method = $_SERVER['REQUEST_METHOD'];
$input  = @json_decode(@file_get_contents('php://input'), true) ?: [];

if ($method === 'GET') {
    echo json_encode(['success'=>true,'applications'=>readA($storePath),'total'=>count(readA($storePath))],JSON_UNESCAPED_SLASHES); exit;
}
if ($method === 'POST') {
    validate_csrf();
    $apps    = readA($storePath);
    $appId   = $input['applicationId'] ?? $input['id'] ?? '';
    $status  = strtoupper($input['decision'] ?? $input['status'] ?? 'APPROVED');
    foreach ($apps as &$a) { if (($a['id']??'') === $appId) { $a['status'] = $status; $a['updatedAt'] = date('c'); break; } }
    writeA($storePath, $apps);
    echo json_encode(['success'=>true,'message'=>'Status updated to '.$status.'.','applicationId'=>$appId,'status'=>$status],JSON_UNESCAPED_SLASHES); exit;
}
echo json_encode(['success'=>false,'message'=>'Invalid method.']);
