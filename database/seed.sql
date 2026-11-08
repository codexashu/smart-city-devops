-- ==============================================================================
-- Smart City Complaint & Infrastructure Management System - Seed Data
-- ==============================================================================

-- 1. Departments
INSERT INTO departments (id, name, description, contact_email, head_name) VALUES
(1, 'Roads & Bridges', 'Potholes, paving, road markings and bridge inspections', 'roads@smartcity.gov', 'Rajesh Sharma'),
(2, 'Water & Sewage', 'Water supply, pipe leaks, sewage blockage and drainage', 'water@smartcity.gov', 'Sunita Verma'),
(3, 'Electricity & Power', 'Street lights, electrical hazards, power outages and transformers', 'power@smartcity.gov', 'Anil Kumar'),
(4, 'Sanitation & Waste', 'Garbage cleanup, bio-waste collection and public sanitization', 'sanitation@smartcity.gov', 'Pooja Mehra'),
(5, 'Street Lighting', 'LED fixtures, timer control, cabling and street illumination', 'lighting@smartcity.gov', 'Vikas Gupta')
ON CONFLICT (id) DO NOTHING;

-- 2. Users (Passwords: Admin@12345, Officer@12345, Citizen@12345)
-- Bcrypt hash: $2b$12$e6m2k4Z35HjOQoP7W1hA8edX...
INSERT INTO users (id, email, hashed_password, full_name, phone, role, department_id) VALUES
(1, 'admin@smartcity.gov', '$2b$12$K8yR2u0hNqV6cKjYQ/z9g.O5a5b5/NqjLq4uQcKvK5qH7o8a6v1Ky', 'Municipal Commissioner Admin', '+91-9876543210', 'ADMIN', NULL),
(2, 'officer.roads@smartcity.gov', '$2b$12$K8yR2u0hNqV6cKjYQ/z9g.O5a5b5/NqjLq4uQcKvK5qH7o8a6v1Ky', 'Er. Rajesh Sharma', '+91-9876543211', 'DEPARTMENT_OFFICER', 1),
(3, 'officer.water@smartcity.gov', '$2b$12$K8yR2u0hNqV6cKjYQ/z9g.O5a5b5/NqjLq4uQcKvK5qH7o8a6v1Ky', 'Er. Sunita Verma', '+91-9876543212', 'DEPARTMENT_OFFICER', 2),
(4, 'citizen@smartcity.gov', '$2b$12$K8yR2u0hNqV6cKjYQ/z9g.O5a5b5/NqjLq4uQcKvK5qH7o8a6v1Ky', 'Ashutosh Pandey', '+91-9876543213', 'CITIZEN', NULL)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence numbers
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
