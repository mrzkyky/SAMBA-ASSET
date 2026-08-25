-- SQL DDL Schema & Initial Seed Data for National Asset Management System
-- NON-DESTRUCTIVE: Safe for production database updates without dropping existing user data.

-- 1. Branches Table (Level 1)
CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sites / Mitra Table (Level 2)
CREATE TABLE IF NOT EXISTS sites (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    partner_name VARCHAR(100) NOT NULL,
    site_name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table (Level 3)
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3b. Segments Table (Service Segments: Kemitraan, POP, Local Loop, Corporate)
CREATE TABLE IF NOT EXISTS segments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    color VARCHAR(20) DEFAULT '#06b6d4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Assets Table (Level 4) - serial_number set to TEXT to support unlimited Multi-SN strings
CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    segment_id BIGINT REFERENCES segments(id) ON DELETE SET NULL,
    asset_type VARCHAR(50) NOT NULL DEFAULT 'Aktif',
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number TEXT NOT NULL,
    location_detail VARCHAR(100) DEFAULT 'Main Rack',
    unit_count INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
    condition VARCHAR(50) NOT NULL DEFAULT 'Baik',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Users Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Auditor' CHECK (role IN ('Super Admin', 'Branch Admin', 'Auditor')),
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Asset Transfers Table (Mutasi Perangkat)
CREATE TABLE IF NOT EXISTS asset_transfers (
    id BIGSERIAL PRIMARY KEY,
    reference_no VARCHAR(50) UNIQUE NOT NULL,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    from_site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    to_site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    unit_count INT NOT NULL DEFAULT 1,
    serial_numbers TEXT,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    performed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Logs Table (Catatan Log Aktivitas)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes (Safe IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);
CREATE INDEX IF NOT EXISTS idx_sites_branch_id ON sites(branch_id);
CREATE INDEX IF NOT EXISTS idx_assets_site_id ON assets(site_id);
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_brand_model ON assets(brand, model);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_transfers_asset_id ON asset_transfers(asset_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_site ON asset_transfers(from_site_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_site ON asset_transfers(to_site_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Seed Data: Branches (ON CONFLICT DO NOTHING)
INSERT INTO branches (code, name, province) VALUES
('BR-BRB', 'Branch Brebes', 'Jawa Tengah'),
('BR-BDG', 'Branch Bandung', 'Jawa Barat'),
('BR-SBY', 'Branch Surabaya', 'Jawa Timur'),
('BR-JKT', 'Branch Jakarta Pusat', 'DKI Jakarta'),
('BR-MDN', 'Branch Medan', 'Sumatera Utara')
ON CONFLICT (code) DO NOTHING;

-- Seed Data: 29 Device Categories (ON CONFLICT DO NOTHING)
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
('UPS & Power')
ON CONFLICT (name) DO NOTHING;

-- Seed Data: 4 Service Segments (ON CONFLICT DO NOTHING)
INSERT INTO segments (name, description, color) VALUES
('Kemitraan', 'Aset perangkat untuk layanan kemitraan/partnership', '#06b6d4'),
('POP', 'Point of Presence — aset jaringan inti', '#8b5cf6'),
('Local Loop', 'Aset untuk konektivitas last-mile', '#f59e0b'),
('Corporate', 'Aset untuk layanan enterprise/korporat', '#10b981')
ON CONFLICT (name) DO NOTHING;

-- Seed Data: Default Users (ON CONFLICT DO NOTHING)
-- Bcrypt cost=14 hashes matching jwt.go HashPassword function (admin password: accessup123)
INSERT INTO users (username, email, password_hash, role, branch_id) VALUES
('admin', 'admin@national-asset.id', '$2a$14$HBWw9h0/1rb4CizATfCmU.yXLXuLJjyLyqtZf9hHpRnUG4Br2aeqe', 'Super Admin', NULL),
('admin_brebes', 'brebes@national-asset.id', '$2a$14$kSOH1yW4RrAEKKqrXE74Cu1RytXuR338lhgQ4BHjSX0fHgnS0Ujo6', 'Branch Admin', 1),
('auditor', 'auditor@national-asset.id', '$2a$14$t5ifqWuRwS/iV4oPKbHPp..8ZqoLwgNVCDVBp69rWjuYs3T8RRMfG', 'Auditor', NULL)
ON CONFLICT (username) DO NOTHING;
