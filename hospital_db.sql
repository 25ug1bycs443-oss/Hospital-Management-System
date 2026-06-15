-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- DROP TABLES IF THEY EXIST (IN REVERSE ORDER OF FOREIGN KEYS)
DROP TABLE IF EXISTS BILL;
DROP TABLE IF EXISTS BED;
DROP TABLE IF EXISTS WARD;
DROP TABLE IF EXISTS APPOINTMENT;
DROP TABLE IF EXISTS DOCTOR;
DROP TABLE IF EXISTS PATIENT;

-- PATIENT TABLE
CREATE TABLE PATIENT (
    patient_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    registration_date DATE DEFAULT (CURRENT_DATE)
);

-- DOCTOR TABLE
CREATE TABLE DOCTOR (
    doctor_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(50) NOT NULL,
    experience_years INT NOT NULL
);

-- APPOINTMENT TABLE
CREATE TABLE APPOINTMENT (
    appointment_id VARCHAR(10) PRIMARY KEY,
    patient_id VARCHAR(10) NOT NULL,
    doctor_id VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(255),
    hospital_name VARCHAR(100) DEFAULT 'Tulsi Premier Hospital',
    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES DOCTOR(doctor_id) ON DELETE CASCADE
);

-- WARD TABLE
CREATE TABLE WARD (
    ward_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    floor INT NOT NULL
);

-- BED TABLE
CREATE TABLE BED (
    bed_id VARCHAR(10) PRIMARY KEY,
    ward_id VARCHAR(10) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ward_id) REFERENCES WARD(ward_id) ON DELETE CASCADE
);

-- BILL TABLE
CREATE TABLE BILL (
    bill_id VARCHAR(10) PRIMARY KEY,
    patient_id VARCHAR(10) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    bill_date DATE NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id) ON DELETE CASCADE
);

-- ==========================================
-- SEED DATA INSERTS
-- ==========================================

-- 1. SEED PATIENTS (Representing different registration months for Chart.js)
INSERT INTO PATIENT (patient_id, name, age, gender, contact, blood_group, registration_date) VALUES
('P-101', 'Rajesh Kumar', 45, 'Male', '9876543210', 'O+', '2026-05-10'),
('P-102', 'Priya Sharma', 32, 'Female', '9876543211', 'A+', '2026-05-12'),
('P-103', 'Amit Patel', 50, 'Male', '9876543212', 'B+', '2026-01-15'),
('P-104', 'Sneha Reddy', 28, 'Female', '9876543213', 'AB+', '2026-02-20'),
('P-105', 'Vikram Singh', 60, 'Male', '9876543214', 'O-', '2026-03-05'),
('P-106', 'Anjali Gupta', 22, 'Female', '9876543215', 'A-', '2026-03-25'),
('P-107', 'Rohan Mehta', 35, 'Male', '9876543216', 'B-', '2026-04-10'),
('P-108', 'Kavita Rao', 55, 'Female', '9876543217', 'O+', '2026-04-22'),
('P-109', 'Sanjay Dutt', 41, 'Male', '9876543218', 'A+', '2026-05-01'),
('P-110', 'Pooja Hegde', 29, 'Female', '9876543219', 'AB-', '2026-06-02'),
('P-111', 'Rahul Dravid', 48, 'Male', '9876543220', 'O+', '2026-06-10');

-- 2. SEED DOCTORS (Various specializations for analytics & directory)
INSERT INTO DOCTOR (doctor_id, name, specialization, experience_years) VALUES
('D-201', 'Dr. Suresh Iyer', 'Cardiologist', 15),
('D-202', 'Dr. Meena Nair', 'Neurologist', 12),
('D-203', 'Dr. Alok Pandey', 'Pediatrician', 18),
('D-204', 'Dr. Sarah Smith', 'Cardiologist', 8),
('D-205', 'Dr. James Carter', 'Orthopedist', 14),
('D-206', 'Dr. Lisa Ray', 'Gynecologist', 10),
('D-207', 'Dr. Vikas Khanna', 'General Medicine', 20),
('D-208', 'Dr. Sunita Kapoor', 'Dermatologist', 7);

-- 3. SEED APPOINTMENTS (Matching My Appointments Screenshot #2)
INSERT INTO APPOINTMENT (appointment_id, patient_id, doctor_id, date, time, status, reason, hospital_name) VALUES
('A-301', 'P-101', 'D-201', '2026-05-17', '10:00 AM', 'PENDING', 'Cardiac Checkup', 'Tulsi Premier Hospital'),
('A-302', 'P-102', 'D-202', '2026-05-18', '10:00 AM', 'CONFIRMED', 'Neurology Consultation', 'Tulsi Diagnostics Center'),
('A-303', 'P-103', 'D-203', '2026-06-01', '11:30 AM', 'CONFIRMED', 'Pediatric Followup', 'Tulsi Premier Hospital'),
('A-304', 'P-105', 'D-205', '2026-06-15', '09:00 AM', 'CONFIRMED', 'Joint Pain Review', 'Tulsi Sterling Hospital'),
('A-305', 'P-107', 'D-207', '2026-06-16', '02:00 PM', 'PENDING', 'Fever Checkup', 'Tulsi Premier Hospital'),
('A-306', 'P-109', 'D-208', '2026-06-17', '04:30 PM', 'PENDING', 'Skin Allergy Consult', 'Tulsi Apollo Hospital'),
('A-307', 'P-104', 'D-201', '2026-05-10', '09:00 AM', 'CONFIRMED', 'ECG Report Review', 'Tulsi Premier Hospital'),
('A-308', 'P-106', 'D-206', '2026-05-12', '11:00 AM', 'CONFIRMED', 'Prenatal Checkup', 'Tulsi Diagnostics Center');

-- 4. SEED WARDS
-- Creating W1 to W24 (24 wards in total, matching Wards & Beds Screenshot #3)
-- We need:
-- W-1 (General Ward): Floor 1, Capacity 4
-- W-2 (ICU Ward): Floor 2, Capacity 4
-- W-3 to W-24: Capacity 4 or 5, distributed to get exactly 101 beds in total.
-- Let's define the 24 wards:
INSERT INTO WARD (ward_id, name, capacity, floor) VALUES
('W-01', 'General Ward', 4, 1),
('W-02', 'ICU', 4, 2),
('W-03', 'Pediatric Ward', 4, 1),
('W-04', 'Maternity Ward', 4, 1),
('W-05', 'Orthopedic Ward', 4, 2),
('W-06', 'Surgical Ward', 4, 2),
('W-07', 'Cardiac ICU', 4, 3),
('W-08', 'Neurology Ward', 4, 3),
('W-09', 'Emergency Ward', 4, 1),
('W-10', 'Oncology Ward', 4, 4),
('W-11', 'ENT Ward', 4, 2),
('W-12', 'Ophthalmology Ward', 4, 2),
('W-13', 'Psychiatry Ward', 4, 4),
('W-14', 'Dermatology Ward', 4, 3),
('W-15', 'Gastroenterology Ward', 4, 3),
('W-16', 'Urology Ward', 4, 3),
('W-17', 'Pulmonology Ward', 4, 2),
('W-18', 'Nephrology Ward', 4, 3),
('W-19', 'Isolation Ward', 4, 4),
('W-20', 'Recovery Ward', 4, 1),
('W-21', 'Semi-Special Ward A', 4, 2),
('W-22', 'Semi-Special Ward B', 4, 2),
('W-23', 'Special Private Ward', 4, 3),
('W-24', 'Deluxe Suite Ward', 9, 4);

-- 5. SEED BEDS
-- Total installed beds: 101
-- Total occupied: 50
-- Available beds: 51
-- W-01 (General Ward): 4 beds. B-1, B-2, B-3 (occupied), B-4 (available). 3 occupied, 1 available.
-- W-02 (ICU): 4 beds. B-5, B-6 (occupied), B-7, B-8 (available). 2 occupied, 2 available.
-- W-03 to W-23 (21 wards * 4 beds/ward = 84 beds). We set 2 occupied, 2 available per ward -> 42 occupied, 42 available.
-- W-24 (Deluxe Suite Ward): 9 beds. We set 3 occupied, 6 available -> 3 occupied, 6 available.
-- Summing up:
-- Total Beds = 4 + 4 + 84 + 9 = 101.
-- Total Occupied = 3 + 2 + 42 + 3 = 50.
-- Total Available = 1 + 2 + 42 + 6 = 51.

-- W-01 Beds (General Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-1', 'W-01', TRUE),
('B-2', 'W-01', TRUE),
('B-3', 'W-01', TRUE),
('B-4', 'W-01', FALSE);

-- W-02 Beds (ICU)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-5', 'W-02', TRUE),
('B-6', 'W-02', TRUE),
('B-7', 'W-02', FALSE),
('B-8', 'W-02', FALSE);

-- W-03 Beds (Pediatric Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-9', 'W-03', TRUE), ('B-10', 'W-03', TRUE), ('B-11', 'W-03', FALSE), ('B-12', 'W-03', FALSE);

-- W-04 Beds (Maternity Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-13', 'W-04', TRUE), ('B-14', 'W-04', TRUE), ('B-15', 'W-04', FALSE), ('B-16', 'W-04', FALSE);

-- W-05 Beds (Orthopedic Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-17', 'W-05', TRUE), ('B-18', 'W-05', TRUE), ('B-19', 'W-05', FALSE), ('B-20', 'W-05', FALSE);

-- W-06 Beds (Surgical Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-21', 'W-06', TRUE), ('B-22', 'W-06', TRUE), ('B-23', 'W-06', FALSE), ('B-24', 'W-06', FALSE);

-- W-07 Beds (Cardiac ICU)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-25', 'W-07', TRUE), ('B-26', 'W-07', TRUE), ('B-27', 'W-07', FALSE), ('B-28', 'W-07', FALSE);

-- W-08 Beds (Neurology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-29', 'W-08', TRUE), ('B-30', 'W-08', TRUE), ('B-31', 'W-08', FALSE), ('B-32', 'W-08', FALSE);

-- W-09 Beds (Emergency Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-33', 'W-09', TRUE), ('B-34', 'W-09', TRUE), ('B-35', 'W-09', FALSE), ('B-36', 'W-09', FALSE);

-- W-10 Beds (Oncology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-37', 'W-10', TRUE), ('B-38', 'W-10', TRUE), ('B-39', 'W-10', FALSE), ('B-40', 'W-10', FALSE);

-- W-11 Beds (ENT Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-41', 'W-11', TRUE), ('B-42', 'W-11', TRUE), ('B-43', 'W-11', FALSE), ('B-44', 'W-11', FALSE);

-- W-12 Beds (Ophthalmology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-45', 'W-12', TRUE), ('B-46', 'W-12', TRUE), ('B-47', 'W-12', FALSE), ('B-48', 'W-12', FALSE);

-- W-13 Beds (Psychiatry Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-49', 'W-13', TRUE), ('B-50', 'W-13', TRUE), ('B-51', 'W-13', FALSE), ('B-52', 'W-13', FALSE);

-- W-14 Beds (Dermatology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-53', 'W-14', TRUE), ('B-54', 'W-14', TRUE), ('B-55', 'W-14', FALSE), ('B-56', 'W-14', FALSE);

-- W-15 Beds (Gastroenterology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-57', 'W-15', TRUE), ('B-58', 'W-15', TRUE), ('B-59', 'W-15', FALSE), ('B-60', 'W-15', FALSE);

-- W-16 Beds (Urology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-61', 'W-16', TRUE), ('B-62', 'W-16', TRUE), ('B-63', 'W-16', FALSE), ('B-64', 'W-16', FALSE);

-- W-17 Beds (Pulmonology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-65', 'W-17', TRUE), ('B-66', 'W-17', TRUE), ('B-67', 'W-17', FALSE), ('B-68', 'W-17', FALSE);

-- W-18 Beds (Nephrology Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-69', 'W-18', TRUE), ('B-70', 'W-18', TRUE), ('B-71', 'W-18', FALSE), ('B-72', 'W-18', FALSE);

-- W-19 Beds (Isolation Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-73', 'W-19', TRUE), ('B-74', 'W-19', TRUE), ('B-75', 'W-19', FALSE), ('B-76', 'W-19', FALSE);

-- W-20 Beds (Recovery Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-77', 'W-20', TRUE), ('B-78', 'W-20', TRUE), ('B-79', 'W-20', FALSE), ('B-80', 'W-20', FALSE);

-- W-21 Beds (Semi-Special Ward A)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-81', 'W-21', TRUE), ('B-82', 'W-21', TRUE), ('B-83', 'W-21', FALSE), ('B-84', 'W-21', FALSE);

-- W-22 Beds (Semi-Special Ward B)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-85', 'W-22', TRUE), ('B-86', 'W-22', TRUE), ('B-87', 'W-22', FALSE), ('B-88', 'W-22', FALSE);

-- W-23 Beds (Special Private Ward)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-89', 'W-23', TRUE), ('B-90', 'W-23', TRUE), ('B-91', 'W-23', FALSE), ('B-92', 'W-23', FALSE);

-- W-24 Beds (Deluxe Suite Ward - 9 beds)
INSERT INTO BED (bed_id, ward_id, is_occupied) VALUES
('B-93', 'W-24', TRUE),
('B-94', 'W-24', TRUE),
('B-95', 'W-24', TRUE),
('B-96', 'W-24', FALSE),
('B-97', 'W-24', FALSE),
('B-98', 'W-24', FALSE),
('B-99', 'W-24', FALSE),
('B-100', 'W-24', FALSE),
('B-101', 'W-24', FALSE);


-- 6. SEED BILLS (Various payment dates for Chart.js)
INSERT INTO BILL (bill_id, patient_id, total_amount, payment_status, bill_date) VALUES
('B-401', 'P-101', 1500.00, 'PAID', '2026-05-17'),
('B-402', 'P-102', 3500.00, 'UNPAID', '2026-05-18'),
('B-403', 'P-103', 12500.00, 'PAID', '2026-01-20'),
('B-404', 'P-104', 4200.00, 'PAID', '2026-02-25'),
('B-405', 'P-105', 8900.00, 'UNPAID', '2026-03-10'),
('B-406', 'P-106', 1200.00, 'PAID', '2026-03-28'),
('B-407', 'P-107', 6700.00, 'PAID', '2026-04-12'),
('B-408', 'P-108', 15400.00, 'PAID', '2026-04-29'),
('B-409', 'P-109', 300.00, 'PAID', '2026-05-02'),
('B-410', 'P-110', 9800.00, 'UNPAID', '2026-06-03'),
('B-411', 'P-111', 2500.00, 'PAID', '2026-06-11');
