-- Fix lbp_roles migration issue
-- Step 1: Add code column as nullable first
ALTER TABLE lbp_roles ADD COLUMN IF NOT EXISTS code character varying(50);

-- Step 2: Update existing rows with code based on nom_role
UPDATE lbp_roles SET code = LOWER(REPLACE(nom_role, ' ', '_')) WHERE code IS NULL;

-- Step 3: Make code NOT NULL and unique
ALTER TABLE lbp_roles ALTER COLUMN code SET NOT NULL;
ALTER TABLE lbp_roles ADD CONSTRAINT lbp_roles_code_unique UNIQUE (code);

-- Step 4: Drop old nom_role column if it exists
ALTER TABLE lbp_roles DROP COLUMN IF EXISTS nom_role;
