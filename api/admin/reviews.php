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
    $res = $conn->query("SELECT id, reviewer_name, reviewer_role, review_text, photo_url, display_order, status, created_at FROM reviews ORDER BY display_order ASC, created_at DESC");
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

if ($method === 'POST') {
    $name = trim($input['reviewerName'] ?? '');
    $role = trim($input['reviewerRole'] ?? '');
    $text = trim($input['reviewText'] ?? '');
    $order = intval($input['displayOrder'] ?? 0);
    $status = trim($input['status'] ?? 'ACTIVE');
    $photoUrl = null;

    if (empty($name) || empty($text)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Reviewer name and review text are required."]);
        exit();
    }

    if (!empty($input['photoBase64'])) {
        $photoData = $input['photoBase64'];
        if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $matches)) {
            $ext = strtolower($matches[1]);
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Unsupported image format."]);
                exit();
            }
            $raw = base64_decode(substr($photoData, strpos($photoData, ',') + 1));
            $filename = 'review-' . uniqid() . '.' . $ext;
            $uploadDir = __DIR__ . '/../../uploads/reviews/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            file_put_contents($uploadDir . $filename, $raw);
            $photoUrl = '/uploads/reviews/' . $filename;
        }
    }

    $stmt = $conn->prepare("INSERT INTO reviews (reviewer_name, reviewer_role, review_text, photo_url, display_order, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssis", $name, $role, $text, $photoUrl, $order, $status);
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

    $photoUrl = $input['existingPhotoUrl'] ?? null;
    if (!empty($input['photoBase64'])) {
        $photoData = $input['photoBase64'];
        if (preg_match('/^data:image\/(\w+);base64,/', $photoData, $matches)) {
            $ext = strtolower($matches[1]);
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                $raw = base64_decode(substr($photoData, strpos($photoData, ',') + 1));
                $filename = 'review-' . uniqid() . '.' . $ext;
                $uploadDir = __DIR__ . '/../../uploads/reviews/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                file_put_contents($uploadDir . $filename, $raw);
                $photoUrl = '/uploads/reviews/' . $filename;
            }
        }
    }

    $stmt = $conn->prepare("UPDATE reviews SET reviewer_name=?, reviewer_role=?, review_text=?, photo_url=?, display_order=?, status=? WHERE id=?");
    $stmt->bind_param("ssssisi", $name, $role, $text, $photoUrl, $order, $status, $id);
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
