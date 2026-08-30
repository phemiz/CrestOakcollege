<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/admin/db.php';

$conn = getDbConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

$res = $conn->query("SELECT id, reviewer_name, reviewer_role, review_text, photo_url, category, program_or_relation, outcome FROM reviews WHERE status = 'ACTIVE' ORDER BY display_order ASC, created_at DESC");
$reviews = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $reviews[] = [
            "id" => $row['id'],
            "name" => $row['reviewer_name'],
            "role" => $row['reviewer_role'],
            "text" => $row['review_text'],
            "photoUrl" => $row['photo_url'],
            "category" => $row['category'],
            "programOrRelation" => $row['program_or_relation'],
            "outcome" => $row['outcome']
        ];
    }
}
$conn->close();

echo json_encode(["success" => true, "reviews" => $reviews], JSON_UNESCAPED_SLASHES);
