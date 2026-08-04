<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/admin/db.php';

$method = $_SERVER['REQUEST_METHOD'];

$defaultTestimonials = [
    [
        "id" => "test-1",
        "name" => "Blessing Okon",
        "role" => "Community Health Graduate",
        "quote" => "The rigorous clinical exposures and high-tech lab equipment at CrestOak College gave me the practical edge needed to pass my licensing board exams seamlessly.",
        "avatar" => "/rector-enhanced.png",
        "rating" => 5
    ],
    [
        "id" => "test-2",
        "name" => "Adebayo Chukwuma",
        "role" => "Computer Science & Health Informatics Student",
        "quote" => "Combining health science with computing and modern IT labs at CrestOak opened up incredible career paths in telemedicine and software development.",
        "avatar" => "/rector-enhanced.png",
        "rating" => 5
    ],
    [
        "id" => "test-3",
        "name" => "Dr. Elizabeth Johnson",
        "role" => "Senior Clinical Instructor",
        "quote" => "Our focus at CrestOak is hands-on competency and research-backed healthcare delivery. Our students hit the ground running upon graduation.",
        "avatar" => "/rector.jpg",
        "rating" => 5
    ]
];

if ($method === 'GET') {
    echo json_encode(["success" => true, "testimonials" => $defaultTestimonials]);
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
