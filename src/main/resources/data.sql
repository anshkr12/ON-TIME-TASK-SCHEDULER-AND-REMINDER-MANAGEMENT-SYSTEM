-- ===================================================================
-- Initial Seed Data: ON TIME Task Scheduler & Reminder Management
-- Demonstrates: DML, Roles, Users, BCrypt Password hashes, Tasks, Reminders
-- ===================================================================

-- 1. Insert Standard Roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_ADMIN');

-- 2. Insert Default Users (Password: Password123)
-- BCrypt hash for 'Password123'
INSERT INTO users (id, full_name, email, password, enabled, created_at, updated_at)
VALUES (1, 'Alex Morgan', 'user@example.com', '$2a$10$eACCYoNOHEqgkZ8aW8WBO.H6yO0C2q1C22VnLomr2R9L3R9a/E0eq', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, full_name, email, password, enabled, created_at, updated_at)
VALUES (2, 'System Administrator', 'admin@example.com', '$2a$10$eACCYoNOHEqgkZ8aW8WBO.H6yO0C2q1C22VnLomr2R9L3R9a/E0eq', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Assign Roles
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1); -- Alex has ROLE_USER
INSERT INTO user_roles (user_id, role_id) VALUES (2, 1); -- Admin has ROLE_USER
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2); -- Admin has ROLE_ADMIN

-- 4. Initial Sample Tasks
INSERT INTO tasks (id, user_id, title, description, category, priority, status, deadline, completed, created_at, updated_at)
VALUES (1, 1, 'Finalize Spring Boot Architecture Document', 'Prepare comprehensive Java architecture and syllabus mapping for university submission', 'Work', 'HIGH', 'IN_PROGRESS', DATEADD('DAY', 1, CURRENT_TIMESTAMP), FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (id, user_id, title, description, category, priority, status, deadline, completed, created_at, updated_at)
VALUES (2, 1, 'Review JSP Views and Servlet Filters', 'Verify session tracking, cookies, and RequestDispatcher forward/include examples', 'Study', 'MEDIUM', 'TODO', DATEADD('DAY', 2, CURRENT_TIMESTAMP), FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (id, user_id, title, description, category, priority, status, deadline, completed, created_at, updated_at)
VALUES (3, 1, 'Submit Project Postman Collection', 'Test all REST endpoints with URI, header, and parameter versioning', 'Project', 'LOW', 'DONE', DATEADD('DAY', -1, CURRENT_TIMESTAMP), TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Initial Sample Reminders
INSERT INTO reminders (id, task_id, user_id, reminder_time, reminder_message, status, created_at, updated_at)
VALUES (1, 1, 1, DATEADD('HOUR', 4, CURRENT_TIMESTAMP), 'Reminder: Submit Spring Boot pom.xml and JPA entities before 5 PM', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO reminders (id, task_id, user_id, reminder_time, reminder_message, status, created_at, updated_at)
VALUES (2, 2, 1, DATEADD('HOUR', 24, CURRENT_TIMESTAMP), 'Reminder: Test HttpServlet doGet/doPost with RequestDispatcher', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
