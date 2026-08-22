<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../auth/session.php';

$session = require_session(['ADMIN', 'SUPERADMIN', 'STAFF']);

$departments = [
    ['id'=>'dept-health-001','name'=>'Department of Nursing Sciences','code'=>'NUR'],
    ['id'=>'dept-health-002','name'=>'Department of Medical Laboratory Science','code'=>'MLS'],
    ['id'=>'dept-health-003','name'=>'Department of Community Health Sciences','code'=>'CHEW'],
    ['id'=>'dept-mgmt-001','name'=>'Department of Business Administration','code'=>'BUS'],
    ['id'=>'dept-tech-001','name'=>'Department of Computer Science & IT','code'=>'CSC'],
];
$faculties = [];
$programmes = [
    ['id'=>'prog-001','name'=>'Nursing Sciences (B.N.Sc)','code'=>'NUR','durationYears'=>5,'degreeAwarded'=>'B.N.Sc.'],
    ['id'=>'prog-002','name'=>'Medical Laboratory Science (B.MLS)','code'=>'MLS','durationYears'=>5,'degreeAwarded'=>'B.MLS'],
    ['id'=>'prog-003','name'=>'Community Health Extension Worker (CHEW)','code'=>'CHEW','durationYears'=>3,'degreeAwarded'=>'Diploma / CHEW'],
    ['id'=>'prog-004','name'=>'Business Administration & Management (B.Sc)','code'=>'BUS','durationYears'=>4,'degreeAwarded'=>'B.Sc.'],
    ['id'=>'prog-005','name'=>'Computer Science & Artificial Intelligence (B.Sc)','code'=>'CSC','durationYears'=>4,'degreeAwarded'=>'B.Sc.'],
];

echo json_encode(['success' => true, 'programmes' => $programmes, 'faculties' => $faculties, 'departments' => $departments], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
