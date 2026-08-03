<?php
// Mirror — delegate to main api/admin/programmes.php
$target = realpath(__DIR__ . '/../../api/admin/programmes.php');
if ($target && file_exists($target)) { require_once $target; exit; }

// Inline fallback — return canonical list; store-based CRUD only via main file
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0); error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$dir = realpath(__DIR__ . '/../../api/admin') ?: __DIR__;
function readPP($p) { $d=@json_decode(@file_get_contents($p),true); return is_array($d)?$d:[]; }

$departments = file_exists($dir.'/departments_store.json') ? readPP($dir.'/departments_store.json') : [
    ['id'=>'dept-health-001','name'=>'Department of Nursing Sciences','code'=>'NUR'],
    ['id'=>'dept-health-002','name'=>'Department of Medical Laboratory Science','code'=>'MLS'],
    ['id'=>'dept-health-003','name'=>'Department of Community Health Sciences','code'=>'CHEW'],
    ['id'=>'dept-mgmt-001','name'=>'Department of Business Administration','code'=>'BUS'],
    ['id'=>'dept-tech-001','name'=>'Department of Computer Science & IT','code'=>'CSC'],
];
$faculties   = file_exists($dir.'/faculties_store.json')   ? readPP($dir.'/faculties_store.json')   : [];
$programmes  = file_exists($dir.'/programmes_store.json')  ? readPP($dir.'/programmes_store.json')  : [
    ['id'=>'prog-001','name'=>'Nursing Sciences (B.N.Sc)','code'=>'NUR','durationYears'=>5,'degreeAwarded'=>'B.N.Sc.'],
    ['id'=>'prog-002','name'=>'Medical Laboratory Science (B.MLS)','code'=>'MLS','durationYears'=>5,'degreeAwarded'=>'B.MLS'],
    ['id'=>'prog-003','name'=>'Community Health Extension Worker (CHEW)','code'=>'CHEW','durationYears'=>3,'degreeAwarded'=>'Diploma / CHEW'],
    ['id'=>'prog-004','name'=>'Business Administration & Management (B.Sc)','code'=>'BUS','durationYears'=>4,'degreeAwarded'=>'B.Sc.'],
    ['id'=>'prog-005','name'=>'Computer Science & Artificial Intelligence (B.Sc)','code'=>'CSC','durationYears'=>4,'degreeAwarded'=>'B.Sc.'],
];

echo json_encode(['success'=>true,'programmes'=>$programmes,'faculties'=>$faculties,'departments'=>$departments],JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
