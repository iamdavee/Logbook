-- ============================================================
--  SIWES Logbook Database
--  Import this file in phpMyAdmin or run:
--  mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS siwes_logbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siwes_logbook;

-- ------------------------------------------------------------
--  Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    role          ENUM('student','industry_supervisor','school_coordinator','admin') NOT NULL,
    matric_number VARCHAR(50)   DEFAULT NULL UNIQUE,
    department    VARCHAR(150)  DEFAULT NULL,
    level         VARCHAR(20)   DEFAULT NULL,
    company       VARCHAR(150)  DEFAULT NULL,
    avatar        VARCHAR(255)  DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  Log Entries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_entries (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id     INT UNSIGNED NOT NULL,
    entry_date     DATE         NOT NULL,
    week_number    TINYINT      NOT NULL,
    day_of_week    ENUM('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
    company        VARCHAR(150) DEFAULT NULL,
    task           TEXT         NOT NULL,
    skills_learned TEXT         DEFAULT NULL,
    attachment_url VARCHAR(255) DEFAULT NULL,
    status         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_entry (student_id, week_number, day_of_week)
);

-- ------------------------------------------------------------
--  Reviews (supervisor comments / approve / reject)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    log_entry_id  INT UNSIGNED NOT NULL,
    supervisor_id INT UNSIGNED NOT NULL,
    action        ENUM('approved','rejected') NOT NULL,
    comment       TEXT         DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_entry_id)  REFERENCES log_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  Student ↔ Supervisor Assignments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_supervisors (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id    INT UNSIGNED NOT NULL,
    supervisor_id INT UNSIGNED NOT NULL,
    type          ENUM('industry','school') NOT NULL,
    FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (student_id, supervisor_id, type)
);

-- ============================================================
--  Seed Data  (passwords are bcrypt of the shown plaintext)
-- ============================================================

-- Admin  |  password: admin123
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@siwes.edu',
 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Industry Supervisor  |  password: super123
INSERT INTO users (name, email, password, role) VALUES
('Dr. Chukwu Emeka', 'emeka@company.com',
 '$2y$10$TKh8H1.PfbuUMmstQD1XguV82p7d7DsAlg3m7mmTelS7z1RMnSCHC', 'industry_supervisor');

-- School Coordinator  |  password: super123
INSERT INTO users (name, email, password, role) VALUES
('Prof. Emeka Obi', 'emeka@university.edu',
 '$2y$10$TKh8H1.PfbuUMmstQD1XguV82p7d7DsAlg3m7mmTelS7z1RMnSCHC', 'school_coordinator');

-- Students  |  password: student123
INSERT INTO users (name, email, password, role, matric_number, department, level, company) VALUES
('David Adibite-Daniel', 'david@student.edu',
 '$2y$10$e0NRtBCgQkBGy7BPhVMmBOWvuCGsv63P0DqQwMKiVDi0L.9c7IgVa',
 'student', 'STU/2023/001', 'Computer Science', '400', 'Tech Solutions Ltd'),
('Chioma Nwankwo', 'chioma@student.edu',
 '$2y$10$e0NRtBCgQkBGy7BPhVMmBOWvuCGsv63P0DqQwMKiVDi0L.9c7IgVa',
 'student', 'STU/2023/015', 'Information Technology', '400', 'DataVault Inc'),
('Ibrahim Yusuf', 'ibrahim@student.edu',
 '$2y$10$e0NRtBCgQkBGy7BPhVMmBOWvuCGsv63P0DqQwMKiVDi0L.9c7IgVa',
 'student', 'STU/2023/042', 'Computer Engineering', '400', 'NetBridge Systems'),
('Fatima Bello', 'fatima@student.edu',
 '$2y$10$e0NRtBCgQkBGy7BPhVMmBOWvuCGsv63P0DqQwMKiVDi0L.9c7IgVa',
 'student', 'STU/2023/008', 'Electrical Engineering', '400', 'CloudPeak Africa');

-- Assign all students to both supervisors
INSERT INTO student_supervisors (student_id, supervisor_id, type)
SELECT s.id, sup.id, 'industry'
FROM users s, users sup
WHERE s.role = 'student' AND sup.email = 'emeka@company.com';

INSERT INTO student_supervisors (student_id, supervisor_id, type)
SELECT s.id, sup.id, 'school'
FROM users s, users sup
WHERE s.role = 'student' AND sup.email = 'emeka@university.edu';

-- Sample log entries for David (student id=4 after seed order)
INSERT INTO log_entries (student_id, entry_date, week_number, day_of_week, company, task, status)
SELECT id, '2026-01-05', 1, 'Monday',    'Tech Solutions Ltd', 'Orientation and introduction to company structure', 'approved' FROM users WHERE email='david@student.edu';
INSERT INTO log_entries (student_id, entry_date, week_number, day_of_week, company, task, status)
SELECT id, '2026-01-06', 1, 'Tuesday',   'Tech Solutions Ltd', 'Setup of development environment and tools', 'approved' FROM users WHERE email='david@student.edu';
INSERT INTO log_entries (student_id, entry_date, week_number, day_of_week, company, task, status)
SELECT id, '2026-01-07', 1, 'Wednesday', 'Tech Solutions Ltd', 'Reading documentation for internal systems', 'pending' FROM users WHERE email='david@student.edu';
INSERT INTO log_entries (student_id, entry_date, week_number, day_of_week, company, task, skills_learned, status)
SELECT id, '2026-01-12', 2, 'Monday',    'Tech Solutions Ltd', 'Database design and normalization for inventory module', 'SQL normalization, ERD design', 'approved' FROM users WHERE email='david@student.edu';
INSERT INTO log_entries (student_id, entry_date, week_number, day_of_week, company, task, status)
SELECT id, '2026-01-13', 2, 'Tuesday',   'Tech Solutions Ltd', 'Implemented REST API endpoints for user management', 'pending' FROM users WHERE email='david@student.edu';
INSERT INTO log_entries (student_id, entry_date, week_number, day_of_week, company, task, skills_learned, status)
SELECT id, '2026-01-21', 3, 'Wednesday', 'Tech Solutions Ltd', 'Frontend UI development for login and dashboard', 'React, Tailwind CSS', 'approved' FROM users WHERE email='david@student.edu';
INSERT INTO log_entries (student_id, entry_date, week_number, day_of_week, company, task, status)
SELECT id, '2026-01-23', 3, 'Friday',    'Tech Solutions Ltd', 'Network configuration and firewall setup', 'rejected' FROM users WHERE email='david@student.edu';

-- Sample reviews for David's non-pending entries
INSERT INTO reviews (log_entry_id, supervisor_id, action, comment)
SELECT le.id, sup.id, le.status, IF(le.status='approved','Good work','Needs more detail')
FROM log_entries le, users sup
WHERE sup.email = 'emeka@company.com' AND le.status IN ('approved','rejected');
