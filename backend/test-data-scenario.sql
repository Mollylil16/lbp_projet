-- ================================================================
-- SCRIPT DE CRÉATION DE DONNÉES RÉELLES POUR TEST IA
-- ================================================================
-- Objectif : Créer un scénario réaliste pour tester :
--   1. Dashboard dynamique (graphiques, stats)
--   2. Détection IA des chutes d'activité
--   3. Analyse de corrélation (prix, trafic)
--   4. Recommandations intelligentes
-- ================================================================

-- ================================================================
-- PARTIE 1 : NETTOYAGE (OPTIONNEL - À UTILISER AVEC PRÉCAUTION)
-- ================================================================
-- ATTENTION : Décommenter uniquement si vous voulez repartir de zéro
-- DELETE FROM paiement;
-- DELETE FROM facture;
-- DELETE FROM marchandise;
-- DELETE FROM colis;
-- DELETE FROM client WHERE id > 5; -- Garder les clients de base

-- ================================================================
-- PARTIE 2 : CRÉATION DE CLIENTS DE TEST
-- ================================================================

-- Clients actifs
INSERT INTO client (nom_exp, prenom_exp, tel_exp, email_exp, adresse_exp, ville_exp, pays_exp, "isActive", created_at)
VALUES 
  ('TRAORE', 'Mamadou', '+225 07 12 34 56 78', 'mamadou.traore@email.ci', 'Cocody Riviera', 'Abidjan', 'Côte d''Ivoire', true, NOW() - INTERVAL '6 months'),
  ('KONE', 'Fatou', '+225 05 98 76 54 32', 'fatou.kone@email.ci', 'Plateau', 'Abidjan', 'Côte d''Ivoire', true, NOW() - INTERVAL '5 months'),
  ('DIALLO', 'Ibrahim', '+225 01 23 45 67 89', 'ibrahim.diallo@email.ci', 'Marcory', 'Abidjan', 'Côte d''Ivoire', true, NOW() - INTERVAL '4 months'),
  ('KOUASSI', 'Aya', '+225 07 11 22 33 44', 'aya.kouassi@email.ci', 'Yopougon', 'Abidjan', 'Côte d''Ivoire', true, NOW() - INTERVAL '3 months'),
  ('BAMBA', 'Seydou', '+225 05 55 66 77 88', 'seydou.bamba@email.ci', 'Adjamé', 'Abidjan', 'Côte d''Ivoire', true, NOW() - INTERVAL '2 months')
ON CONFLICT DO NOTHING;

-- Clients inactifs (pour tester la recommandation de réactivation)
INSERT INTO client (nom_exp, prenom_exp, tel_exp, email_exp, adresse_exp, ville_exp, pays_exp, "isActive", created_at)
VALUES 
  ('OUATTARA', 'Aminata', '+225 07 99 88 77 66', 'aminata.ouattara@email.ci', 'Abobo', 'Abidjan', 'Côte d''Ivoire', false, NOW() - INTERVAL '8 months'),
  ('TOURE', 'Moussa', '+225 05 44 33 22 11', 'moussa.toure@email.ci', 'Port-Bouët', 'Abidjan', 'Côte d''Ivoire', false, NOW() - INTERVAL '7 months')
ON CONFLICT DO NOTHING;

-- ================================================================
-- PARTIE 3 : HISTORIQUE 6 MOIS (Volume Stable ~200 colis/mois)
-- ================================================================

-- Fonction helper pour générer des colis
DO $$
DECLARE
  v_client_id INTEGER;
  v_month_offset INTEGER;
  v_colis_count INTEGER;
  v_date DATE;
  v_ref_colis VARCHAR;
  v_colis_id INTEGER;
  v_forme_envoi VARCHAR;
  v_trafic_envoi VARCHAR;
  v_prix_unit NUMERIC;
BEGIN
  -- Boucle sur les 6 derniers mois (de -6 à -1)
  FOR v_month_offset IN 1..6 LOOP
    v_date := DATE_TRUNC('month', CURRENT_DATE) - (v_month_offset || ' months')::INTERVAL;
    
    -- Volume stable : 180-220 colis par mois
    v_colis_count := 180 + FLOOR(RANDOM() * 40);
    
    FOR i IN 1..v_colis_count LOOP
      -- Sélectionner un client aléatoire parmi les actifs
      SELECT id INTO v_client_id FROM client WHERE "isActive" = true ORDER BY RANDOM() LIMIT 1;
      
      -- Forme d'envoi : 60% GROUPAGE, 40% AUTRES_ENVOI
      v_forme_envoi := CASE WHEN RANDOM() < 0.6 THEN 'GROUPAGE' ELSE 'AUTRES_ENVOI' END;
      
      -- Trafic : 40% Maritime, 60% Aérien (distribution normale)
      v_trafic_envoi := CASE 
        WHEN RANDOM() < 0.2 THEN 'IMPORT_MARITIME'
        WHEN RANDOM() < 0.4 THEN 'EXPORT_MARITIME'
        WHEN RANDOM() < 0.7 THEN 'IMPORT_AERIEN'
        ELSE 'EXPORT_AERIEN'
      END;
      
      -- Référence unique
      v_ref_colis := 'LBP-' || TO_CHAR(v_date, 'YYMM') || '-' || LPAD(i::TEXT, 3, '0');
      
      -- Créer le colis
      INSERT INTO colis (
        ref_colis, client_id, nom_dest, prenom_dest, tel_dest, 
        lieu_dest, adresse_dest, forme_envoi, trafic_envoi,
        date_envoi, created_at, updated_at
      ) VALUES (
        v_ref_colis, v_client_id, 'DEST_' || i, 'Prenom', '+225070000000',
        'Paris', '123 Rue de Test', v_forme_envoi, v_trafic_envoi,
        v_date + (RANDOM() * 28)::INTEGER, v_date, v_date
      ) RETURNING id INTO v_colis_id;
      
      -- Prix unitaire : 45000-55000 FCFA (stable)
      v_prix_unit := 45000 + FLOOR(RANDOM() * 10000);
      
      -- Ajouter une marchandise
      INSERT INTO marchandise (
        colis_id, designation, quantite, poids, prix_unit, created_at
      ) VALUES (
        v_colis_id, 'Marchandise Test', 1, 5 + RANDOM() * 10, v_prix_unit, v_date
      );
      
      -- Créer une facture
      INSERT INTO facture (
        colis_id, num_facture, montant_ht, montant_ttc, etat, created_at
      ) VALUES (
        v_colis_id, 
        'FACT-' || TO_CHAR(v_date, 'YYMM') || '-' || LPAD(i::TEXT, 4, '0'),
        v_prix_unit, v_prix_unit * 1.18, 1, v_date
      );
      
    END LOOP;
    
    RAISE NOTICE 'Mois -% : % colis créés', v_month_offset, v_colis_count;
  END LOOP;
END $$;

-- ================================================================
-- PARTIE 4 : MOIS ACTUEL - SCÉNARIO DE CHUTE (50 colis seulement)
-- ================================================================
-- Objectif : Déclencher l'alerte IA "Chute d'Activité Structurelle"

DO $$
DECLARE
  v_client_id INTEGER;
  v_colis_id INTEGER;
  v_ref_colis VARCHAR;
  v_prix_unit NUMERIC;
BEGIN
  FOR i IN 1..50 LOOP
    SELECT id INTO v_client_id FROM client WHERE "isActive" = true ORDER BY RANDOM() LIMIT 1;
    
    v_ref_colis := 'LBP-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-' || LPAD(i::TEXT, 3, '0');
    
    -- Prix AUGMENTÉS de 15% (pour tester la détection de sensibilité au prix)
    v_prix_unit := 52000 + FLOOR(RANDOM() * 10000);
    
    INSERT INTO colis (
      ref_colis, client_id, nom_dest, prenom_dest, tel_dest,
      lieu_dest, adresse_dest, forme_envoi, trafic_envoi,
      date_envoi, created_at, updated_at
    ) VALUES (
      v_ref_colis, v_client_id, 'DEST_' || i, 'Prenom', '+225070000000',
      'Dakar', '456 Avenue Test', 
      CASE WHEN RANDOM() < 0.6 THEN 'GROUPAGE' ELSE 'AUTRES_ENVOI' END,
      -- 70% MARITIME pour tester la corrélation trafic
      CASE WHEN RANDOM() < 0.7 THEN 'IMPORT_MARITIME' ELSE 'IMPORT_AERIEN' END,
      CURRENT_DATE - (RANDOM() * 15)::INTEGER, CURRENT_DATE, CURRENT_DATE
    ) RETURNING id INTO v_colis_id;
    
    INSERT INTO marchandise (
      colis_id, designation, quantite, poids, prix_unit, created_at
    ) VALUES (
      v_colis_id, 'Marchandise Premium', 1, 5 + RANDOM() * 10, v_prix_unit, CURRENT_DATE
    );
    
    INSERT INTO facture (
      colis_id, num_facture, montant_ht, montant_ttc, etat, created_at
    ) VALUES (
      v_colis_id,
      'FACT-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-' || LPAD(i::TEXT, 4, '0'),
      v_prix_unit, v_prix_unit * 1.18, 1, CURRENT_DATE
    );
  END LOOP;
  
  RAISE NOTICE 'Mois actuel : 50 colis créés (CHUTE DE 75%%)';
END $$;

-- ================================================================
-- PARTIE 5 : PAIEMENTS RÉCENTS (pour tester "Revenu du Jour")
-- ================================================================

DO $$
DECLARE
  v_facture_id INTEGER;
  v_montant NUMERIC;
BEGIN
  -- Créer 5 paiements aujourd'hui
  FOR v_facture IN (
    SELECT id, montant_ttc 
    FROM facture 
    WHERE created_at >= CURRENT_DATE 
    ORDER BY RANDOM() 
    LIMIT 5
  ) LOOP
    INSERT INTO paiement (
      facture_id, montant, mode_paiement, etat_validation, created_at
    ) VALUES (
      v_facture.id, v_facture.montant_ttc, 'ESPECES', 1, CURRENT_TIMESTAMP
    );
  END LOOP;
  
  RAISE NOTICE 'Paiements du jour créés';
END $$;

-- ================================================================
-- PARTIE 6 : MOUVEMENTS DE CAISSE (pour tester l'analyse trésorerie)
-- ================================================================

-- Encaissements (paiements validés)
INSERT INTO mouvement_caisse (type, montant, description, created_at)
SELECT 
  'ENCAISSEMENT', 
  montant, 
  'Paiement facture ' || facture_id,
  created_at
FROM paiement 
WHERE etat_validation = 1 
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
LIMIT 20;

-- Décaissements (20% des encaissements - ratio sain)
INSERT INTO mouvement_caisse (type, montant, description, created_at)
SELECT 
  'DECAISSEMENT',
  montant * 0.2,
  'Charges opérationnelles',
  created_at + INTERVAL '1 day'
FROM paiement 
WHERE etat_validation = 1 
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
LIMIT 10;

-- ================================================================
-- PARTIE 7 : VÉRIFICATIONS
-- ================================================================

-- Vérifier les volumes par mois
SELECT 
  TO_CHAR(date_envoi, 'YYYY-MM') as mois,
  COUNT(*) as total_colis,
  COUNT(*) FILTER (WHERE forme_envoi = 'GROUPAGE') as groupage,
  COUNT(*) FILTER (WHERE forme_envoi = 'AUTRES_ENVOI') as autres
FROM colis
WHERE date_envoi >= CURRENT_DATE - INTERVAL '7 months'
GROUP BY TO_CHAR(date_envoi, 'YYYY-MM')
ORDER BY mois;

-- Vérifier la répartition du trafic actuel
SELECT 
  trafic_envoi,
  COUNT(*) as nb_colis,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pourcentage
FROM colis
WHERE date_envoi >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY trafic_envoi;

-- Vérifier les prix moyens (ancien vs nouveau)
SELECT 
  'Mois précédents' as periode,
  ROUND(AVG(prix_unit), 0) as prix_moyen
FROM marchandise m
JOIN colis c ON m.colis_id = c.id
WHERE c.date_envoi < DATE_TRUNC('month', CURRENT_DATE)
  AND c.date_envoi >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
UNION ALL
SELECT 
  'Mois actuel' as periode,
  ROUND(AVG(prix_unit), 0) as prix_moyen
FROM marchandise m
JOIN colis c ON m.colis_id = c.id
WHERE c.date_envoi >= DATE_TRUNC('month', CURRENT_DATE);

-- ================================================================
-- RÉSULTAT ATTENDU SUR LE DASHBOARD
-- ================================================================
-- 
-- 1. STATISTIQUES GLOBALES :
--    - Total Colis : ~1150 (6 mois × 200 + 50)
--    - Clients Actifs : 5
--    - Revenu Total : ~57 500 000 FCFA
--    - Revenu du Jour : ~250 000 FCFA (5 paiements)
--
-- 2. GRAPHIQUES :
--    - Évolution Colis : 6 mois stables (~200) puis chute à 50
--    - Répartition Trafic : ~70% Maritime (anormal)
--
-- 3. PANNEAU IA (ATTENDU) :
--    🚨 ALERTE : Chute d'Activité Structurelle
--    Votre volume projeté est en baisse de 75% par rapport à votre moyenne trimestrielle.
--    
--    Cause identifiée : Dépendance excessive au trafic maritime qui subit une chute séculaire.
--    OU
--    Cause identifiée : Sensibilité au prix détectée : Vos tarifs moyens ont augmenté de plus de 10%.
--    
--    Action recommandée : DIVERSIFICATION : Boostez les offres Aériennes...
--
-- ================================================================
