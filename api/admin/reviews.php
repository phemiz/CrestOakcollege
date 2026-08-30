<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN']);
$conn = getDbConnection();
if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = $conn->query("SELECT id, reviewer_name, reviewer_role, review_text, photo_url, display_order, status, category, program_or_relation, outcome, created_at FROM reviews ORDER BY display_order ASC, created_at DESC");
    $reviews = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $reviews[] = $row;
        }
    }
    echo json_encode(["success" => true, "reviews" => $reviews], JSON_UNESCAPED_SLASHES);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

function handlePhotoUpload($input, $existingUrl = null) {
    if (!empty($input['photoBase64'])) {
        $photoData = $input['photoBase64'];
        if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $matches)) {
            $ext = strtolower($matches[1]);
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                return ['error' => 'Unsupported image format.'];
            }
            $raw = base64_decode(substr($photoData, strpos($photoData, ',') + 1));
            $filename = 'review-' . uniqid() . '.' . $ext;
            $uploadDir = __DIR__ . '/../../uploads/reviews/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            file_put_contents($uploadDir . $filename, $raw);
            return ['url' => '/uploads/reviews/' . $filename];
        }
    }
    return ['url' => $existingUrl];
}

if ($method === 'POST') {
    $name = trim($input['reviewerName'] ?? '');
    $role = trim($input['reviewerRole'] ?? '');
    $text = trim($input['reviewText'] ?? '');
    $order = intval($input['displayOrder'] ?? 0);
    $status = trim($input['status'] ?? 'ACTIVE');
    $category = trim($input['category'] ?? 'students');
    $programOrRelation = trim($input['programOrRelation'] ?? '');
    $outcome = trim($input['outcome'] ?? '');

    if (empty($name) || empty($text)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Reviewer name and review text are required."]);
        exit();
    }

    $photoResult = handlePhotoUpload($input);
    if (isset($photoResult['error'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $photoResult['error']]);
        exit();
    }
    $photoUrl = $photoResult['url'];

    $stmt = $conn->prepare("INSERT INTO reviews (reviewer_name, reviewer_role, review_text, photo_url, display_order, status, category, program_or_relation, outcome) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssissss", $name, $role, $text, $photoUrl, $order, $status, $category, $programOrRelation, $outcome);
    $ok = $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    if (!$ok) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Could not save review."]);
        exit();
    }
    echo json_encode(["success" => true, "message" => "Review added successfully.", "id" => $newId, "photoUrl" => $photoUrl], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'PUT') {
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Review ID is required."]);
        exit();
    }
    $name = trim($input['reviewerName'] ?? '');
    $role = trim($input['reviewerRole'] ?? '');
    $text = trim($input['reviewText'] ?? '');
    $order = intval($input['displayOrder'] ?? 0);
    $status = trim($input['status'] ?? 'ACTIVE');
    $category = trim($input['category'] ?? 'students');
    $programOrRelation = trim($input['programOrRelation'] ?? '');
    $outcome = trim($input['outcome'] ?? '');

    $photoResult = handlePhotoUpload($input, $input['existingPhotoUrl'] ?? null);
    if (isset($photoResult['error'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $photoResult['error']]);
        exit();
    }
    $photoUrl = $photoResult['url'];

    $stmt = $conn->prepare("UPDATE reviews SET reviewer_name=?, reviewer_role=?, review_text=?, photo_url=?, display_order=?, status=?, category=?, program_or_relation=?, outcome=? WHERE id=?");
    $stmt->bind_param("ssssissssi", $name, $role, $text, $photoUrl, $order, $status, $category, $programOrRelation, $outcome, $id);
    $ok = $stmt->execute();
    $stmt->close();

    if (!$ok) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Could not update review."]);
        exit();
    }
    echo json_encode(["success" => true, "message" => "Review updated successfully.", "photoUrl" => $photoUrl], JSON_UNESCAPED_SLASHES);
    exit();
}

if ($method === 'DELETE') {
    $id = intval($input['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Review ID is required."]);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM reviews WHERE id=?");
    $stmt->bind_param("i", $id);
    $ok = $stmt->execute();
    $stmt->close();

    if (!$ok) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Could not delete review."]);
        exit();
    }
    echo json_encode(["success" => true, "message" => "Review deleted successfully."]);
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Invalid request method."]);
