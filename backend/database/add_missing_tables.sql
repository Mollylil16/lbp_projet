-- Script SQL pour ajouter les tables manquantes à la base de données LBP existante
-- Date: 04/02/2026

-- ============================================
-- 1. TABLE: lbp_roles
-- ============================================
CREATE TABLE IF NOT EXISTS lbp_roles (
    id SERIAL PRIMARY KEY,
    nom_role VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. TABLE: lbp_permissions
-- ============================================
CREATE TABLE IF NOT EXISTS lbp_permissions (
    id SERIAL PRIMARY KEY,
    code_acces INTEGER NOT NULL UNIQUE,
    nom_permission VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. TABLE: lbp_role_permissions (relation many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS lbp_role_permissions (
    role_id INTEGER NOT NULL REFERENCES lbp_roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES lbp_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- 4. TABLE: lbp_agences
-- ============================================
CREATE TABLE IF NOT EXISTS lbp_agences (
    id SERIAL PRIMARY KEY,
    nom_agence VARCHAR(100) NOT NULL,
    code_agence VARCHAR(10) UNIQUE,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. TABLE: lbp_audit_logs
-- ============================================
CREATE TABLE IF NOT EXISTS lbp_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    duration INTEGER,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Ajouter colonnes manquantes à lbp_users (si nécessaire)
-- ============================================
DO $$
BEGIN
    -- Ajouter id_role si n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lbp_users' AND column_name='id_role') THEN
        ALTER TABLE lbp_users ADD COLUMN id_role INTEGER REFERENCES lbp_roles(id);
    END IF;

    -- Ajouter id_agence si n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lbp_users' AND column_name='id_agence') THEN
        ALTER TABLE lbp_users ADD COLUMN id_agence INTEGER REFERENCES lbp_agences(id);
    END IF;
END $$;

-- ============================================
-- 7. Ajouter colonnes manquantes à lbp_colis (si nécessaire)
-- ============================================
DO $$
BEGIN
    -- Ajouter id_agence si n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lbp_colis' AND column_name='id_agence') THEN
        ALTER TABLE lbp_colis ADD COLUMN id_agence INTEGER REFERENCES lbp_agences(id);
    END IF;
END $$;

-- ============================================
-- 8. Ajouter colonnes manquantes à lbp_caisses (si nécessaire)
-- ============================================
DO $$
BEGIN
    -- Ajouter id_agence si n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lbp_caisses' AND column_name='id_agence') THEN
        ALTER TABLE lbp_caisses ADD COLUMN id_agence INTEGER REFERENCES lbp_agences(id);
    END IF;
END $$;

-- ============================================
-- 9. SEED DATA: Rôles
-- ============================================
INSERT INTO lbp_roles (nom_role, description) VALUES
    ('SUPER_ADMIN', 'Administrateur système avec tous les droits'),
    ('ADMIN', 'Administrateur avec droits étendus'),
    ('COMPTABLE', 'Gestion comptabilité et finances'),
    ('AGENT', 'Agent de saisie'),
    ('CAISSIER', 'Gestion caisse uniquement'),
    ('CONSULTANT', 'Lecture seule')
ON CONFLICT (nom_role) DO NOTHING;

-- ============================================
-- 10. SEED DATA: Permissions (16 CODEACCES)
-- ============================================
INSERT INTO lbp_permissions (code_acces, nom_permission, description) VALUES
    (1, 'GESTION_UTILISATEURS', 'Créer, modifier, supprimer utilisateurs'),
    (2, 'GESTION_ROLES', 'Gérer les rôles et permissions'),
    (3, 'GESTION_COLIS', 'Créer, modifier colis'),
    (4, 'VALIDATION_COLIS', 'Valider les colis'),
    (5, 'GESTION_FACTURES', 'Créer, modifier factures'),
    (6, 'VALIDATION_FACTURES', 'Valider les factures'),
    (7, 'GESTION_PAIEMENTS', 'Enregistrer paiements'),
    (8, 'PAGE_INDIVIDUELLE', 'Accès page individuelle'),
    (9, 'PAGE_AGENCE', 'Accès page agence'),
    (10, 'GESTION_CAISSE', 'Gérer la caisse'),
    (11, 'RAPPORTS', 'Accès aux rapports'),
    (12, 'EXPORTS', 'Exporter données (PDF, Excel)'),
    (13, 'SUPPRESSION', 'Supprimer des enregistrements'),
    (14, 'CONFIGURATION', 'Modifier paramètres système'),
    (15, 'AUDIT', 'Consulter logs d''audit'),
    (16, 'BACKUP', 'Gérer sauvegardes')
ON CONFLICT (code_acces) DO NOTHING;

-- ============================================
-- 11. SEED DATA: Permissions par rôle
-- ============================================

-- SUPER_ADMIN: Toutes les permissions
INSERT INTO lbp_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM lbp_roles r, lbp_permissions p
WHERE r.nom_role = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- ADMIN: Presque toutes sauf backup
INSERT INTO lbp_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM lbp_roles r, lbp_permissions p
WHERE r.nom_role = 'ADMIN' AND p.code_acces IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15)
ON CONFLICT DO NOTHING;

-- COMPTABLE: Factures, paiements, caisse, rapports
INSERT INTO lbp_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM lbp_roles r, lbp_permissions p
WHERE r.nom_role = 'COMPTABLE' AND p.code_acces IN (5,6,7,9,10,11,12)
ON CONFLICT DO NOTHING;

-- AGENT: Colis, factures (création uniquement)
INSERT INTO lbp_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM lbp_roles r, lbp_permissions p
WHERE r.nom_role = 'AGENT' AND p.code_acces IN (3,5,8,9)
ON CONFLICT DO NOTHING;

-- CAISSIER: Caisse et paiements uniquement
INSERT INTO lbp_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM lbp_roles r, lbp_permissions p
WHERE r.nom_role = 'CAISSIER' AND p.code_acces IN (7,10)
ON CONFLICT DO NOTHING;

-- CONSULTANT: Lecture seule
INSERT INTO lbp_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM lbp_roles r, lbp_permissions p
WHERE r.nom_role = 'CONSULTANT' AND p.code_acces IN (8,9,11)
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. SEED DATA: Agence par défaut
-- ============================================
INSERT INTO lbp_agences (nom_agence, code_agence, adresse, telephone, email) VALUES
    ('Agence Principale', 'LBP01', 'Adresse principale', '+225 XX XX XX XX', 'contact@lbp.com')
ON CONFLICT (code_agence) DO NOTHING;

-- ============================================
-- 13. SEED DATA: Utilisateur admin par défaut
-- ============================================
DO $$
DECLARE
    v_role_id INTEGER;
    v_agence_id INTEGER;
BEGIN
    -- Récupérer l'ID du rôle SUPER_ADMIN
    SELECT id INTO v_role_id FROM lbp_roles WHERE nom_role = 'SUPER_ADMIN';
    
    -- Récupérer l'ID de l'agence principale
    SELECT id INTO v_agence_id FROM lbp_agences WHERE code_agence = 'LBP01';
    
    -- Créer l'utilisateur admin s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM lbp_users WHERE email = 'admin@lbp.com') THEN
        INSERT INTO lbp_users (nom, email, password, id_role, id_agence)
        VALUES (
            'Administrateur',
            'admin@lbp.com',
            '$2b$10$YourHashedPasswordHere', -- À remplacer par un vrai hash
            v_role_id,
            v_agence_id
        );
    END IF;
END $$;

-- ============================================
-- 14. Créer des index pour performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON lbp_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON lbp_audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON lbp_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_colis_ref ON lbp_colis(ref_colis);
CREATE INDEX IF NOT EXISTS idx_factures_num ON lbp_factures(num_facture);
CREATE INDEX IF NOT EXISTS idx_paiements_facture ON lbp_paiements(id_facture);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
COMMIT;
