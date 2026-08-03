<?php
// Mirror — delegate to main api/admin/stats.php
$target = realpath(__DIR__ . '/../../api/admin/stats.php');
if ($target && file_exists($target)) { require_once $target; exit; }

// Inline fallback (same logic, adjusted path)
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0); error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

function readStoreP($path) {
    if (!file_exists($path)) return [];
    $d = @json_decode(@file_get_contents($path), true);
    return is_array($d) ? $d : [];
}
$dir = realpath(__DIR__ . '/../../api/admin') ?: __DIR__;
$staffData   = readStoreP($dir . '/staff_store.json');
$staffData   = array_values(array_filter($staffData, fn($s) => !empty($s['sin'] ?? $s['staffNo'] ?? '') && ($s['sin'] ?? '') !== 'STAFF-PENDING'));
$staffCount  = count($staffData);
$studentsCount = count(readStoreP($dir . '/students_store.json'));
$admData     = readStoreP($dir . '/admissions_store.json');
$pending     = count(array_filter($admData, fn($a) => in_array(strtoupper($a['status'] ?? ''), ['PENDING','SUBMITTED'])));
$progs       = readStoreP($dir . '/programmes_store.json');
$activeCourses = count($progs) > 0 ? count($progs) : 6;
echo json_encode(['success'=>true,'stats'=>['totalStaff'=>$staffCount,'totalStudents'=>$studentsCount,'activeCourses'=>$activeCourses,'departments'=>5,'pendingAdmissions'=>$pending],'data'=>['staffCount'=>$staffCount,'studentsCount'=>$studentsCount,'coursesCount'=>$activeCourses,'pendingAppsCount'=>$pending,'totalRevenue'=>0,'activeSession'=>['name'=>'2026/2027 Academic Session'],'recentAudits'=>[]]],JSON_UNESCAPED_SLASHES);
