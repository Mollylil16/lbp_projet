-- Script de nettoyage et recréation des tables pour le système de rôles et permissions
-- À exécuter manuellement dans votre base de données PostgreSQL

-- 1. Supprimer les tables existantes (dans le bon ordre pour respecter les contraintes)
DROP TABLE IF EXISTS "lbp_user_actions_speciales" CASCADE;
DROP TABLE IF EXISTS "lbp_role_permissions" CASCADE;
DROP TABLE IF EXISTS "lbp_actions_speciales" CASCADE;
DROP TABLE IF EXISTS "lbp_permissions" CASCADE;
DROP TABLE IF EXISTS "lbp_roles" CASCADE;

-- 2. Supprimer les types ENUM s'ils existent
DROP TYPE IF EXISTS "public"."lbp_permissions_module_enum" CASCADE;
DROP TYPE IF EXISTS "public"."lbp_permissions_action_enum" CASCADE;
DROP TYPE IF EXISTS "public"."lbp_actions_speciales_type_enum" CASCADE;

-- 3. Ajouter les colonnes manquantes à la table lbp_users si elles n'existent pas
DO $$
BEGIN
    -- Ajouter role_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lbp_users' AND column_name='role_id') THEN
        ALTER TABLE "lbp_users" ADD COLUMN "role_id" integer;
    END IF;

    -- Ajouter peut_voir_toutes_agences si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lbp_users' AND column_name='peut_voir_toutes_agences') THEN
        ALTER TABLE "lbp_users" ADD COLUMN "peut_voir_toutes_agences" boolean DEFAULT false;
    END IF;
END $$;

-- 4. Les tables seront recréées automatiquement par TypeORM au prochain démarrage
-- avec synchronize: true

COMMIT;
