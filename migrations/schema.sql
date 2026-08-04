-- ============================================================
-- CrestOak College — Full Database Migration
-- Run this in phpMyAdmin SQL tab against: crestoa2_crestoak_db
-- ============================================================

-- 1. Fix users table: change role from ENUM to VARCHAR(50)
--    so we can store ADMIN, LECTURER, HOD, DEAN, REGISTRAR, STUDENT, BURSAR, etc.
ALTER TABLE users
    MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'student';

-- 2. Add missing columns to users table if not present
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 3. Ensure sessions table has correct structure
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(128) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    csrf_token VARCHAR(128),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Fix staff table structure to match login.php expectations
--    Add missing columns for direct staff authentication
ALTER TABLE staff
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'LECTURER',
    ADD COLUMN IF NOT EXISTS role_name VARCHAR(50) DEFAULT 'LECTURER',
    ADD COLUMN IF NOT EXISTS department_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS isDeleted TINYINT(1) DEFAULT 0;

-- 5. Fix students table structure to match login.php expectations
ALTER TABLE students
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS department_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS level INT DEFAULT 100,
    ADD COLUMN IF NOT EXISTS isDeleted TINYINT(1) DEFAULT 0;

-- 6. Ensure admissions table exists
CREATE TABLE IF NOT EXISTS admissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    program_applied VARCHAR(100) NOT NULL,
    status ENUM('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Ensure other tables exist
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    grade VARCHAR(2) NOT NULL,
    term VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING','PAID','OVERDUE') DEFAULT 'PENDING',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    published_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA — Run AFTER generating hashes via test.php
-- Replace PASTE_*_HASH_HERE with your actual bcrypt hashes
-- ============================================================

-- Update admin1 with correct role
UPDATE users SET role = 'ADMIN' WHERE username = 'admin1';

-- Add a test staff member (logs in via staff table directly)
-- Replace PASTE_STAFF_HASH_HERE with your generated staff hash
INSERT INTO staff (first_name, last_name, email, username, staff_no, password_hash, role, role_name, department_name, department_id, isDeleted)
VALUES (
    'Staff',
    'Member',
    'staff1@crestoakcollege.com.ng',
    'staff1',
    'STAFF/001/2026',
    'PASTE_STAFF_HASH_HERE',
    'LECTURER',
    'LECTURER',
    'General Studies',
    'GEN',
    0
) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Add a test student (logs in via students table directly)
-- Replace PASTE_STUDENT_HASH_HERE with your generated student hash
INSERT INTO students (first_name, last_name, email, matric_no, password_hash, department_id, department_name, level, isDeleted)
VALUES (
    'Test',
    'Student',
    'student1@crestoakcollege.com.ng',
    'COH/2026/001',
    'PASTE_STUDENT_HASH_HERE',
    'GEN',
    'General Studies',
    100,
    0
) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);
