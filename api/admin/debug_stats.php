<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth/session.php';
$session = require_session(['ADMIN','SUPERADMIN','STAFF','LECTURER','BURSARY']);
echo "Session OK: " . json_encode($session);
