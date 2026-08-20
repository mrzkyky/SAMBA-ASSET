-- SQL DDL Schema & Initial Seed Data for National Asset Management System

-- Drop tables if exists (for clean init)
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Branches Table (Level 1)
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sites / Mitra Table (Level 2)
CREATE TABLE sites (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    partner_name VARCHAR(100) NOT NULL,
    site_name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table (Level 3)
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Assets Table (Level 4) - serial_number set to TEXT to support unlimited Multi-SN strings
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number TEXT NOT NULL,
    location_detail VARCHAR(100) DEFAULT 'Main Rack',
    unit_count INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Rusak', 'Cadangan')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Users Table (Role-Based Access Control)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Auditor' CHECK (role IN ('Super Admin', 'Branch Admin', 'Auditor')),
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_sites_branch_id ON sites(branch_id);
CREATE INDEX idx_assets_site_id ON assets(site_id);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_brand_model ON assets(brand, model);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branch_id ON users(branch_id);

-- Seed Data: Branches
INSERT INTO branches (code, name, province) VALUES
('BR-BRB', 'Branch Brebes', 'Jawa Tengah'),
('BR-BDG', 'Branch Bandung', 'Jawa Barat'),
('BR-SBY', 'Branch Surabaya', 'Jawa Timur'),
('BR-JKT', 'Branch Jakarta Pusat', 'DKI Jakarta'),
('BR-MDN', 'Branch Medan', 'Sumatera Utara');

-- Seed Data: Sites
INSERT INTO sites (branch_id, partner_name, site_name, address) VALUES
(1, 'Mitra Telkom', 'Site Brebes Kota', 'Jl. Sudirman No. 45, Brebes'),
(1, 'Mitra PLN', 'Site Substation Jatibarang', 'Jl. Raya Jatibarang No. 12, Brebes'),
(1, 'Mitra Indosat', 'Site Tower Ketanggungan', 'Jl. Lucu No. 88, Ketanggungan, Brebes'),
(2, 'Mitra XL Axiata', 'Site Dago POP', 'Jl. Ir. H. Juanda No. 102, Bandung'),
(2, 'Mitra Telkom', 'Site Gedung Sate Core', 'Jl. Diponegoro No. 22, Bandung'),
(3, 'Mitra Smartfren', 'Site Gubeng Core', 'Jl. Stasiun Gubeng No. 5, Surabaya'),
(3, 'Mitra PLN', 'Site Rungkut Data Center', 'Jl. Rungkut Industri No. 18, Surabaya'),
(4, 'Mitra Lintasarta', 'Site Sudirman Hub', 'Jl. Jend. Sudirman Kav 52, Jakarta Pusat'),
(4, 'Mitra Biznet', 'Site Cyber Building', 'Jl. Kuningan Barat No. 8, Jakarta Selatan');

-- Seed Data: 29 Device Categories
INSERT INTO categories (name) VALUES
('Access Point'),
('AOC'),
('Akses Kontrol'),
('ATN'),
('Baterai'),
('CRS'),
('DCDU'),
('Firewall'),
('Inline Atenuator'),
('Inverter'),
('Kipas Mini'),
('LHG'),
('MC'),
('Microwave (ODU, IDU, Kabel)'),
('MikroTik'),
('OLT'),
('ONT'),
('OTB'),
('Patch Cord'),
('PSU'),
('Rack Server'),
('Rectifier'),
('Router'),
('RTN'),
('Server'),
('SFP'),
('Step Down / Step Up'),
('Switch'),
('UPS & Power');

-- Seed Data: Assets
INSERT INTO assets (site_id, category_id, brand, model, serial_number, location_detail, unit_count, status, notes) VALUES
(1, 28, 'MikroTik', 'CCR2004-16G-2S+', 'SN-MT-2004-BRB01', 'Rack 01 - U12', 1, 'Aktif', 'Main Core Gateway Brebes'),
(1, 28, 'Cisco', 'Catalyst 2960X-48TS', 'SN-CS-2960-BRB02', 'Rack 01 - U14', 2, 'Aktif', 'Distribution Switch'),
(1, 25, 'Dell', 'PowerEdge R740', 'SN-DELL-R740-BRB03', 'Rack 02 - U05', 1, 'Aktif', 'Local Monitoring Server'),
(1, 3, 'Hikvision', 'DS-K1T671M', 'SN-HIK-AC-BRB04', 'Pintu Masuk Ruang Server', 1, 'Aktif', 'Biometric Access Door'),
(2, 23, 'Cisco', 'ISR 4331/K9', 'SN-CS-4331-JTB01', 'Rack Substation U02', 1, 'Aktif', 'SCADA Network Gateway'),
(2, 8, 'Fortinet', 'FortiGate 60F', 'SN-FG-60F-JTB02', 'Rack Substation U04', 1, 'Cadangan', 'Backup Firewall Unit'),
(3, 15, 'MikroTik', 'RB1100AHx4', 'SN-MT-1100-KTG01', 'Cabinet Tower U01', 1, 'Rusak', 'Perlu penggantian power supply');

-- Seed Data: Users (Default Passwords: admin123, brebes123, auditor123)
INSERT INTO users (username, email, password_hash, role, branch_id) VALUES
('admin', 'admin@national-asset.id', '$2a$10$2J9DpBWHjwJ.PnX8nWoTOO86mPBPhaW8C.8/42z8.DwfpfMciOHz2', 'Super Admin', NULL),
('admin_brebes', 'brebes@national-asset.id', '$2a$10$OySKeuF3p4.hpZCTVUZ6COEzzwhLJgSY2cJjmOHUAe6FXugQnG0re', 'Branch Admin', 1),
('auditor', 'auditor@national-asset.id', '$2a$10$.J47sE8P40pMdWAEWHF8oOZkLHYO4FMR.roJIqL3OrmVEuwQ.p33W', 'Auditor', NULL);
