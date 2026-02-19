-- Create product catalog table manually
CREATE TYPE "public"."lbp_produits_catalogue_categorie_enum" AS ENUM ('DENREE', 'HUILE_ET_KARITE', 'DIVERS', 'COLIS_RAPIDE_EXPORT');
CREATE TYPE "public"."lbp_produits_catalogue_nature_enum" AS ENUM ('PRIX_UNITAIRE', 'PRIX_FORFAITAIRE');

CREATE TABLE IF NOT EXISTS "public"."lbp_produits_catalogue" (
    "id" SERIAL PRIMARY KEY,
    "nom" VARCHAR(100) NOT NULL,
    "categorie" "public"."lbp_produits_catalogue_categorie_enum" NOT NULL,
    "nature" "public"."lbp_produits_catalogue_nature_enum",
    "prix_unitaire" DECIMAL(10,2),
    "prix_forfaitaire" DECIMAL(10,2),
    "poids_min" DECIMAL(5,2),
    "poids_max" DECIMAL(5,2),
    "description" TEXT,
    "actif" BOOLEAN DEFAULT true NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS "IDX_produits_catalogue_categorie" ON "public"."lbp_produits_catalogue" ("categorie");
CREATE INDEX IF NOT EXISTS "IDX_produits_catalogue_actif" ON "public"."lbp_produits_catalogue" ("actif");
