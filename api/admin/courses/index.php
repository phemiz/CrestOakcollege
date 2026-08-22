<?php
http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../db.php';

$conn = getDbConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
$conn->set_charset('utf8mb4');

// Auto-create courses and course_registrations tables
$conn->query("CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    units INT NOT NULL DEFAULT 3,
    faculty_id INT DEFAULT NULL,
    semester ENUM('FIRST', 'SECOND') DEFAULT 'FIRST',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$conn->query("CREATE TABLE IF NOT EXISTS course_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY student_course (student_id, course_id)
)");

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch course catalog or student registered courses
if ($method === 'GET') {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
    
    if ($studentId > 0) {
        $stmt = $conn->prepare("SELECT c.* FROM courses c INNER JOIN course_registrations cr ON c.id = cr.course_id WHERE cr.student_id = ?");
        $stmt->bind_param("i", $studentId);
        $stmt->execute();
        $res = $stmt->get_result();
    } else {
        $res = $conn->query("SELECT * FROM courses ORDER BY code ASC");
    }

    $courses = [];
    while ($row = $res->fetch_assoc()) { $courses[] = $row; }
    echo json_encode(['success' => true, 'data' => $courses]);
    $conn->close();
    exit;
}

// POST: Register student for course or create course
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    
    // Action 1: Student Course Registration
    if (isset($input['student_id']) && isset($input['course_id'])) {
        $studentId = (int)$input['student_id'];
        $courseId = (int)$input['course_id'];

        $stmt = $conn->prepare("INSERT IGNORE INTO course_registrations (student_id, course_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $studentId, $courseId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Course registered successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed.']);
        }
        $conn->close();
        exit;
    }

    // Action 2: New Course Creation (Admin)
    $code = strtoupper(trim($input['code'] ?? ''));
    $title = trim($input['title'] ?? '');
    $units = (int)($input['units'] ?? 3);

    if (empty($code) || empty($title)) {
        echo json_encode(['success' => false, 'message' => 'Code and Title are required.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO courses (code, title, units) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $code, $title, $units);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Course created successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Course already exists.']);
    }
    $conn->close();
    exit;
}
