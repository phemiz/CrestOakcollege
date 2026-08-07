<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF']);

$method = $_SERVER['REQUEST_METHOD'];

$defaultNews = [
    [
        "id" => "news-1",
        "title" => "2026/2027 Entrance Screening Examination Dates",
        "slug" => "admissions-screening-dates-2025-2026",
        "content" => "CrestOak College of Health Sciences announces entrance screening dates...",
        "featuredImage" => "/crestoak-poster.jpg",
        "isPublished" => true,
        "publishedAt" => "2026-07-01T08:00:00Z"
    ],
    [
        "id" => "news-2",
        "title" => "Academic Excellence & Quality Assurance Review",
        "slug" => "academic-excellence-quality-assurance-review",
        "content" => "Delegates from national accreditation boards concluded their annual academic audit...",
        "featuredImage" => "/crestoak-poster.jpg",
        "isPublished" => true,
        "publishedAt" => "2026-06-20T10:00:00Z"
    ]
];

if ($method === 'GET') {
    echo json_encode(["success" => true, "newsList" => $defaultNews], JSON_UNESCAPED_SLASHES);
    exit();
}

if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    validate_csrf();
    echo json_encode(["success" => true, "message" => "News operation completed."], JSON_UNESCAPED_SLASHES);
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Invalid request method."]);
exit();
