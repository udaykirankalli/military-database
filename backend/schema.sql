-- ============================================================================
-- Military Asset Management System - Complete Database Schema
-- Database: PostgreSQL 13+
-- Created: January 2025
-- 
-- This schema creates all necessary tables, relationships, indexes,
-- and populates sample data for testing and demonstration
-- ============================================================================

-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS expenditures CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS personnel CASCADE;
DROP TABLE IF EXISTS equipment_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS bases CASCADE;

-- ============================================================================
-- TABLE: bases
-- Purpose: Military installations/bases
-- ============================================================================
CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255),
    commander_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE bases IS 'Military installations where assets are stored';
COMMENT ON COLUMN bases.name IS 'Unique name of the military base';
COMMENT ON COLUMN bases.location IS 'Geographic location of the base';

-- ============================================================================
-- TABLE: users
-- Purpose: System users with authentication and RBAC
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'commander', 'logistics')),
    base_id INTEGER REFERENCES bases(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON COLUMN users.role IS 'User role: admin (full access), commander (base-specific), logistics (limited)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.base_id IS 'Assigned base for commanders, NULL for admins';

-- ============================================================================
-- TABLE: equipment_types
-- Purpose: Categories and types of military equipment
-- ============================================================================
CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20) DEFAULT 'unit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE equipment_types IS 'Types and categories of military equipment';
COMMENT ON COLUMN equipment_types.category IS 'Equipment category (Weapons, Vehicles, Equipment, etc.)';
COMMENT ON COLUMN equipment_types.unit_of_measure IS 'How equipment is counted (unit, rounds, etc.)';

-- ============================================================================
-- TABLE: personnel
-- Purpose: Military personnel who can be assigned equipment
-- ============================================================================
CREATE TABLE personnel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rank VARCHAR(50),
    unit VARCHAR(100),
    base_id INTEGER REFERENCES bases(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE personnel IS 'Military personnel eligible for equipment assignments';
COMMENT ON COLUMN personnel.rank IS 'Military rank (Sergeant, Lieutenant, etc.)';

-- ============================================================================
-- TABLE: assets
-- Purpose: Current inventory of equipment at each base
-- ============================================================================
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_id, equipment_type_id)
);

COMMENT ON TABLE assets IS 'Current inventory of equipment at each base';
COMMENT ON COLUMN assets.quantity IS 'Current quantity available at this base';

-- ============================================================================
-- TABLE: purchases
-- Purpose: Record of all equipment purchases
-- ============================================================================
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    cost DECIMAL(12, 2) CHECK (cost >= 0),
    purchase_date DATE NOT NULL,
    supplier VARCHAR(255),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE purchases IS 'Equipment purchase records';
COMMENT ON COLUMN purchases.cost IS 'Total cost of purchase in base currency';

-- ============================================================================
-- TABLE: transfers
-- Purpose: Inter-base equipment transfers
-- ============================================================================
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    from_base_id INTEGER NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
    to_base_id INTEGER NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    transfer_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (from_base_id != to_base_id)
);

COMMENT ON TABLE transfers IS 'Equipment transfers between bases';
COMMENT ON COLUMN transfers.status IS 'Transfer status: pending, in_transit, completed, cancelled';

-- ============================================================================
-- TABLE: assignments
-- Purpose: Equipment assigned to personnel
-- ============================================================================
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id) ON DELETE CASCADE,
    personnel_id INTEGER NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    serial_number VARCHAR(100),
    assignment_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'lost', 'damaged')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE assignments IS 'Equipment assignments to personnel';
COMMENT ON COLUMN assignments.serial_number IS 'Unique serial number of assigned equipment';
COMMENT ON COLUMN assignments.status IS 'Assignment status: active, returned, lost, damaged';

-- ============================================================================
-- TABLE: expenditures
-- Purpose: Equipment consumed or expended
-- ============================================================================
CREATE TABLE expenditures (
    id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expenditure_date DATE NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE expenditures IS 'Equipment consumed during operations or training';

-- ============================================================================
-- TABLE: audit_logs
-- Purpose: Complete audit trail of all system operations
-- ============================================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Complete audit trail for compliance and security';
COMMENT ON COLUMN audit_logs.details IS 'JSON details of the action performed';

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Assets indexes
CREATE INDEX idx_assets_base ON assets(base_id);
CREATE INDEX idx_assets_equipment ON assets(equipment_type_id);

-- Purchases indexes
CREATE INDEX idx_purchases_base ON purchases(base_id);
CREATE INDEX idx_purchases_equipment ON purchases(equipment_type_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_purchases_created_by ON purchases(created_by);

-- Transfers indexes
CREATE INDEX idx_transfers_from ON transfers(from_base_id);
CREATE INDEX idx_transfers_to ON transfers(to_base_id);
CREATE INDEX idx_transfers_equipment ON transfers(equipment_type_id);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_date ON transfers(transfer_date);

-- Assignments indexes
CREATE INDEX idx_assignments_base ON assignments(base_id);
CREATE INDEX idx_assignments_equipment ON assignments(equipment_type_id);
CREATE INDEX idx_assignments_personnel ON assignments(personnel_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_date ON assignments(assignment_date);

-- Audit logs indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_base ON users(base_id);

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert Bases
INSERT INTO bases (name, location, commander_name) VALUES
('Base Alpha', 'Northern Command, Sector 1', 'Col. James Mitchell'),
('Base Beta', 'Eastern Command, Sector 2', 'Col. Sarah Johnson'),
('Base Charlie', 'Western Command, Sector 3', 'Col. Robert Chen'),
('Central Depot', 'Central Command HQ', 'Gen. Michael Adams');

-- Insert Users
-- NOTE: Password hashes are placeholders. Run generateHashes.js to get real hashes
-- Default password for all users: demo123
INSERT INTO users (email, password_hash, name, role, base_id) VALUES
('admin@military.gov', '$2a$10$placeholder.hash.will.be.generated.by.script', 'Admin User', 'admin', NULL),
('commander.alpha@military.gov', '$2a$10$placeholder.hash.will.be.generated.by.script', 'James Mitchell', 'commander', 1),
('commander.beta@military.gov', '$2a$10$placeholder.hash.will.be.generated.by.script', 'Sarah Johnson', 'commander', 2),
('logistics@military.gov', '$2a$10$placeholder.hash.will.be.generated.by.script', 'David Williams', 'logistics', 4);

-- Insert Equipment Types
INSERT INTO equipment_types (name, category, description, unit_of_measure) VALUES
('M4 Rifle', 'Weapons', 'Standard issue assault rifle', 'unit'),
('M9 Pistol', 'Weapons', 'Standard issue sidearm', 'unit'),
('Body Armor', 'Protective Gear', 'Ballistic protection vest', 'unit'),
('Combat Helmet', 'Protective Gear', 'Standard combat helmet', 'unit'),
('Humvee', 'Vehicles', 'High Mobility Multipurpose Wheeled Vehicle', 'unit'),
('M1A2 Abrams', 'Vehicles', 'Main battle tank', 'unit'),
('Tactical Radio', 'Communications', 'Secure tactical communication system', 'unit'),
('Night Vision Goggles', 'Equipment', 'Night vision device', 'unit'),
('5.56mm Ammunition', 'Ammunition', 'Standard rifle ammunition', 'rounds'),
('9mm Ammunition', 'Ammunition', 'Pistol ammunition', 'rounds');

-- Insert Personnel
INSERT INTO personnel (name, rank, unit, base_id, status) VALUES
('John Smith', 'Sergeant', 'Alpha Company', 1, 'active'),
('Emily Davis', 'Corporal', 'Bravo Company', 1, 'active'),
('Michael Brown', 'Lieutenant', 'Charlie Company', 2, 'active'),
('Jessica Wilson', 'Sergeant', 'Delta Company', 2, 'active'),
('Robert Taylor', 'Captain', 'Echo Company', 3, 'active'),
('Amanda Martinez', 'Corporal', 'Alpha Company', 1, 'active'),
('David Anderson', 'Lieutenant', 'Bravo Company', 2, 'active');

-- Insert Initial Assets (Current Inventory)
INSERT INTO assets (base_id, equipment_type_id, quantity) VALUES
-- Base Alpha
(1, 1, 250),  -- 250 M4 Rifles
(1, 2, 100),  -- 100 M9 Pistols
(1, 3, 300),  -- 300 Body Armor
(1, 4, 300),  -- 300 Combat Helmets
(1, 5, 15),   -- 15 Humvees
(1, 7, 50),   -- 50 Tactical Radios

-- Base Beta
(2, 1, 200),  -- 200 M4 Rifles
(2, 2, 80),   -- 80 M9 Pistols
(2, 3, 250),  -- 250 Body Armor
(2, 5, 12),   -- 12 Humvees
(2, 6, 3),    -- 3 M1A2 Tanks

-- Base Charlie
(3, 1, 180),  -- 180 M4 Rifles
(3, 3, 200),  -- 200 Body Armor
(3, 5, 10),   -- 10 Humvees

-- Central Depot (Storage)
(4, 1, 500),  -- 500 M4 Rifles
(4, 2, 200),  -- 200 M9 Pistols
(4, 3, 400),  -- 400 Body Armor
(4, 9, 100000), -- 100,000 rounds 5.56mm
(4, 10, 50000); -- 50,000 rounds 9mm

-- Insert Sample Purchases
INSERT INTO purchases (base_id, equipment_type_id, quantity, cost, purchase_date, supplier, notes, created_by) VALUES
(1, 1, 50, 75000.00, '2024-01-15', 'Defense Contractors Inc.', 'Quarterly procurement', 1),
(2, 5, 5, 350000.00, '2024-01-20', 'Military Vehicles Corp.', 'Vehicle upgrade program', 1),
(1, 3, 100, 120000.00, '2024-02-10', 'Armor Systems Ltd.', 'Protective gear replenishment', 2),
(3, 1, 75, 112500.00, '2024-02-15', 'Defense Contractors Inc.', 'Standard procurement', 1),
(4, 9, 50000, 25000.00, '2024-03-01', 'Ammunition Depot', 'Ammunition stock replenishment', 4);

-- Insert Sample Transfers
INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, notes, created_by) VALUES
(1, 2, 1, 30, '2024-01-25', 'completed', 'Support for training exercise', 1),
(4, 1, 1, 100, '2024-02-05', 'completed', 'Monthly distribution from central depot', 1),
(2, 3, 5, 3, '2024-02-20', 'in_transit', 'Vehicle reallocation', 2),
(4, 2, 9, 10000, '2024-03-10', 'completed', 'Ammunition distribution', 4);

-- Insert Sample Assignments
INSERT INTO assignments (base_id, equipment_type_id, personnel_id, serial_number, assignment_date, status, notes, created_by) VALUES
(1, 1, 1, 'M4-2024-001', '2024-01-20', 'active', 'Standard issue', 2),
(1, 2, 2, 'M9-2024-015', '2024-01-22', 'active', 'Sidearm assignment', 2),
(2, 1, 3, 'M4-2024-087', '2024-02-01', 'active', 'Officer weapon', 3),
(2, 5, 4, 'HV-2024-005', '2024-02-05', 'active', 'Squad vehicle', 3),
(1, 3, 6, 'BA-2024-120', '2024-02-10', 'active', 'Body armor', 2),
(2, 7, 7, 'TR-2024-045', '2024-02-15', 'active', 'Communication equipment', 3);

-- Insert Sample Expenditures
INSERT INTO expenditures (base_id, equipment_type_id, quantity, expenditure_date, reason, notes, created_by) VALUES
(1, 9, 5000, '2024-01-30', 'Training exercise', 'Range qualification training', 2),
(2, 9, 3000, '2024-02-15', 'Qualification range', 'Annual weapons qualification', 3),
(1, 10, 1000, '2024-02-20', 'Tactical training', 'Close quarters combat training', 2),
(3, 9, 2500, '2024-03-05', 'Live fire exercise', 'Battalion training event', 1);

-- Insert Initial Audit Log
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'SYSTEM_INIT', 'SYSTEM', 0, '{"message": "Database initialized with sample data", "version": "1.0"}');

-- ============================================================================
-- CREATE TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_bases_updated_at BEFORE UPDATE ON bases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_types_updated_at BEFORE UPDATE ON equipment_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these to verify data after running the schema

-- SELECT 'Bases:', COUNT(*) FROM bases;
-- SELECT 'Users:', COUNT(*) FROM users;
-- SELECT 'Equipment Types:', COUNT(*) FROM equipment_types;
-- SELECT 'Personnel:', COUNT(*) FROM personnel;
-- SELECT 'Assets:', COUNT(*) FROM assets;
-- SELECT 'Purchases:', COUNT(*) FROM purchases;
-- SELECT 'Transfers:', COUNT(*) FROM transfers;
-- SELECT 'Assignments:', COUNT(*) FROM assignments;
-- SELECT 'Expenditures:', COUNT(*) FROM expenditures;
-- SELECT 'Audit Logs:', COUNT(*) FROM audit_logs;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Run: node generateHashes.js';
    RAISE NOTICE '2. Update user password hashes';
    RAISE NOTICE '3. Run: node testDatabase.js';
    RAISE NOTICE '4. Start backend: npm run dev';
    RAISE NOTICE '============================================';
END $$;