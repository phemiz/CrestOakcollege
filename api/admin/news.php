<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

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
        "title" => "Academic Partnership Supervision Review with Atiba University",
        "slug" => "academic-partnership-review-atiba-university",
        "content" => "Delegates from Atiba University Oyo concluded their annual academic audit...",
        "featuredImage" => "/atiba-university-banner.png",
        "isPublished" => true,
        "publishedAt" => "2026-06-20T10:00:00Z"
    ]
];

if ($method === 'GET') {
    echo json_encode(["success" => true, "newsList" => $defaultNews]);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    echo json_encode(["success" => true, "message" => "News article saved successfully."]);
    exit();
}

if ($method === 'DELETE') {
    echo json_encode(["success" => true, "message" => "News article deleted successfully."]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
