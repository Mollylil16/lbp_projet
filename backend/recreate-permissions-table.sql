-- Recreate permissions table with correct schema matching TypeORM entity

-- Drop dependent tables first
DROP TABLE IF EXISTS lbp_role_permissions CASCADE;
DROP TABLE IF EXISTS lbp_user_actions_speciales CASCADE;
DROP TABLE IF EXISTS lbp_actions_speciales CASCADE;

-- Drop the old permissions table
DROP TABLE IF EXISTS lbp_permissions CASCADE;

-- Drop old enum types
DROP TYPE IF EXISTS "public"."lbp_permissions_module_enum" CASCADE;
DROP TYPE IF EXISTS "public"."lbp_actions_speciales_type_enum" CASCADE;

-- TypeORM will recreate these tables with the correct schema when the app starts
