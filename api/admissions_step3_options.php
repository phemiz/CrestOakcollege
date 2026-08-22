<?php
error_reporting(0);
ini_set('display_errors', 0);

while (ob_get_level()) { ob_end_clean(); }
ob_start();

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'https://crestoakcollege.com.ng',
    'https://admin.crestoakcollege.com.ng',
    'https://portal.crestoakcollege.com.ng'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://crestoakcollege.com.ng"));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { ob_end_clean(); exit(0); }

require_once __DIR__ . '/admissions_apply_step3.php';

$programLevels = [
    "Undergraduate Degree (B.Sc. / B.N.Sc. / BMLS / LL.B - 4 Years / Direct Entry)",
    "National Diploma (ND - 2 Years)",
    "Higher National Diploma (HND - 2 Years)",
    "Professional Certificate / College Diploma"
];

$studyModes = [
    "Full-Time Regular",
    "Part-Time / Hybrid",
    "Direct Entry"
];

ob_end_clean();
echo json_encode([
    'success' => true,
    'status' => 'success',
    'programLevels' => $programLevels,
    'studyModes' => $studyModes,
    'facultiesAndCourses' => $facultiesAndCourses
]);
exit(0);
