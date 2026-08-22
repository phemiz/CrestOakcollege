<?php
error_reporting(0);
ini_set("display_errors", 0);
while (ob_get_level()) { ob_end_clean(); }
ob_start();
http_response_code(200);
header("Content-Type: application/json; charset=utf-8");
$origin = $_SERVER["HTTP_ORIGIN"] ?? "*";
header("Access-Control-Allow-Origin: {$origin}");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "OPTIONS") { ob_end_clean(); exit(0); }
$dbFile = "/home/crestoa2/domains/crestoakcollege.com.ng/public_html/api/admin/db.php";
$conn = false;
if (file_exists($dbFile)) { require_once $dbFile; if (function_exists("getDbConnection")) { $conn = @getDbConnection(); } }

$faculties = [
    ["id" => 1, "name" => "Faculty of Health Sciences", "code" => "FHS", "departmentsCount" => 3],
    ["id" => 2, "name" => "Faculty of Management & Applied Sciences", "code" => "FMAS", "departmentsCount" => 2]
];
ob_end_clean();
echo json_encode(["success" => true, "status" => "success", "faculties" => $faculties, "data" => $faculties]);
exit(0);
