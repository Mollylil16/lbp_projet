-- Fix for permissions module column migration issue
-- This script clears the permissions data to allow TypeORM to add the NOT NULL module column

-- First, clear dependent data
TRUNCATE TABLE lbp_role_permissions CASCADE;
TRUNCATE TABLE lbp_permissions CASCADE;

-- Drop and recreate the enum type if it exists
DROP TYPE IF EXISTS "public"."lbp_permissions_module_enum" CASCADE;

-- The enum will be recreated by TypeORM when the app starts
