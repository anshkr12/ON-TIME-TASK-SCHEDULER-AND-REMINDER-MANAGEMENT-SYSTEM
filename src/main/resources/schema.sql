-- ===================================================================
-- MySQL Database Schema: ON TIME Task Scheduler & Reminder Management
-- Demonstrates: DDL, Foreign Keys, Indexes, Relationships, Stored Procedures
-- ===================================================================

-- Drop existing tables if needed (in proper dependency order)
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
);

-- 3. User Roles Join Table (ManyToMany)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. Tasks Table (ManyToOne with Users)
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Work',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'TODO',
    deadline DATETIME NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_user_deadline (user_id, deadline),
    INDEX idx_task_status (status),
    INDEX idx_task_priority (priority)
);

-- 5. Reminders Table (ManyToOne with Tasks, ManyToOne with Users)
CREATE TABLE IF NOT EXISTS reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reminder_time DATETIME NOT NULL,
    reminder_message VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminders_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reminder_time_status (reminder_time, status)
);

-- 6. Stored Procedure for Module 1 (JDBC CallableStatement demonstration)
-- Note: MySQL syntax delimiter handled; inside H2/MySQL compatible blocks.
DROP PROCEDURE IF EXISTS sp_get_user_task_summary;

-- Procedure Definition:
-- Retrieves total tasks, completed count, and pending reminders for a given user
CREATE PROCEDURE sp_get_user_task_summary(
    IN p_user_id BIGINT,
    OUT p_total_tasks INT,
    OUT p_completed_tasks INT,
    OUT p_pending_reminders INT
)
BEGIN
    SELECT COUNT(*) INTO p_total_tasks FROM tasks WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO p_completed_tasks FROM tasks WHERE user_id = p_user_id AND completed = TRUE;
    SELECT COUNT(*) INTO p_pending_reminders FROM reminders WHERE user_id = p_user_id AND status = 'PENDING';
END;
