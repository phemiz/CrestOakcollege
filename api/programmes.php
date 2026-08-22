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

$programmes = [
    ["id" => 1, "title" => "Community Health (CHEW)", "code" => "CHEW", "department" => "Health Sciences", "duration" => "3 Years"],
    ["id" => 2, "title" => "Medical Laboratory Science", "code" => "MLS", "department" => "Health Sciences", "duration" => "3 Years"],
    ["id" => 3, "title" => "Computer Science", "code" => "CSC", "department" => "Applied Technologies", "duration" => "2 Years"],
    ["id" => 4, "title" => "Business Administration", "code" => "BUS", "department" => "Management", "duration" => "2 Years"]
];
ob_end_clean();
echo json_encode(["success" => true, "status" => "success", "programmes" => $programmes, "data" => $programmes]);
exit(0);
