-- ============================================================
-- CrestOak College — Full Database Migration
-- Run this in phpMyAdmin SQL tab against: crestoa2_crestoak_db
-- ============================================================

-- 1. Fix users table: change role from ENUM to VARCHAR(50)
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

-- 4. Fix staff table structure
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    username VARCHAR(100) NULL,
    staff_no VARCHAR(100) NULL,
    password_hash VARCHAR(255) NULL,
    role VARCHAR(50) DEFAULT 'LECTURER',
    role_name VARCHAR(50) DEFAULT 'LECTURER',
    department_name VARCHAR(255) NULL,
    department_id VARCHAR(50) NULL,
    isDeleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE staff
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS staff_no VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'LECTURER',
    ADD COLUMN IF NOT EXISTS role_name VARCHAR(50) DEFAULT 'LECTURER',
    ADD COLUMN IF NOT EXISTS department_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS department_id VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS isDeleted TINYINT(1) DEFAULT 0;

-- 5. Fix students table structure
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    matric_no VARCHAR(100) NULL,
    password_hash VARCHAR(255) NULL,
    department_id VARCHAR(50) NULL,
    department_name VARCHAR(255) NULL,
    level INT DEFAULT 100,
    isDeleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS matric_no VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS department_id VARCHAR(50) NULL,
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

CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ident_ip (identifier, ip_address),
    INDEX idx_attempted (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA — Default accounts for Staff & Students
-- ============================================================

-- Update admin1 role if user exists
UPDATE users SET role = 'ADMIN' WHERE username = 'admin1';

-- Add test staff member (Password: Staff@2026!)
INSERT INTO staff (first_name, last_name, email, username, staff_no, password_hash, role, role_name, department_name, department_id, isDeleted)
VALUES (
    'Staff',
    'Member',
    'staff1@crestoakcollege.com.ng',
    'staff1',
    'STAFF/001/2026',
    '$2y$10$wN9tM5j05V/nIqHhS4H3xOBXwR2yH2zD6fTzO.9Qh/z5XQ8oJvQG2',
    'LECTURER',
    'LECTURER',
    'General Studies',
    'GEN',
    0
) ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Add test student member (Password: Student@2026!)
INSERT INTO students (first_name, last_name, email, matric_no, password_hash, department_id, department_name, level, isDeleted)
VALUES (
    'Test',
    'Student',
    'student1@crestoakcollege.com.ng',
    'COH/2026/001',
    '$2y$10$wN9tM5j05V/nIqHhS4H3xOBXwR2yH2zD6fTzO.9Qh/z5XQ8oJvQG2',
    'GEN',
    'General Studies',
    100,
    0
) ON DUPLICATE KEY UPDATE level = VALUES(level);
