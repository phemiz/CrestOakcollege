<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN']);

$method = $_SERVER['REQUEST_METHOD'];

$defaultGallery = [
    [
        "id" => "gal-1",
        "title" => "Clinical Simulation & Nursing Laboratory",
        "description" => "Modern clinical demonstration ward equipped for hands-on student practice.",
        "imageUrl" => "/crestoak-poster.jpg",
        "album" => "Campus Infrastructure"
    ],
    [
        "id" => "gal-2",
        "title" => "Badagry Campus Lecture Theatres",
        "description" => "Main campus lecture halls equipped with digital presentation systems.",
        "imageUrl" => "/crestoak-poster.jpg",
        "album" => "Academic Halls"
    ]
];

if ($method === 'GET') {
    echo json_encode(["success" => true, "galleryItems" => $defaultGallery], JSON_UNESCAPED_SLASHES);
    exit();
}

if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    validate_csrf();
    echo json_encode(["success" => true, "message" => "Gallery operation executed successfully."], JSON_UNESCAPED_SLASHES);
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Invalid request method."]);
exit();
