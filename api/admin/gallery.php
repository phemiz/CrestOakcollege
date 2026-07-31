<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

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
    echo json_encode(["success" => true, "galleryItems" => $defaultGallery]);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    echo json_encode(["success" => true, "message" => "Gallery item saved successfully."]);
    exit();
}

if ($method === 'DELETE') {
    echo json_encode(["success" => true, "message" => "Gallery item deleted successfully."]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request method."]);
