# Guide d'Exécution du Scénario de Test

## 🎯 Objectif
Tester le système 100% dynamique avec des données réalistes qui déclenchent toutes les fonctionnalités IA.

---

## 📋 Étape 1 : Préparation

### 1.1 Démarrer les Services
```bash
# Terminal 1 - Backend
cd /home/molly-ye/Bureau/lbp_projet/backend
npm run start:dev

# Terminal 2 - Frontend  
cd /home/molly-ye/Bureau/lbp_projet
npm run dev
```

### 1.2 Vérifier la Connexion à la Base
```bash
# Tester la connexion PostgreSQL
psql -U votre_user -d lbp_db -c "SELECT COUNT(*) FROM colis;"
```

---

## 📊 Étape 2 : Charger les Données de Test

### 2.1 Exécuter le Script SQL
```bash
cd /home/molly-ye/Bureau/lbp_projet/backend
psql -U votre_user -d lbp_db -f test-data-scenario.sql
```

**Ce script va créer** :
- ✅ 7 clients (5 actifs, 2 inactifs)
- ✅ ~1150 colis sur 7 mois :
  - 6 mois historiques : ~200 colis/mois (volume stable)
  - 1 mois actuel : 50 colis (chute de 75% !)
- ✅ Prix augmentés de 15% ce mois-ci
- ✅ 70% de trafic maritime ce mois (vs 40% avant)
- ✅ Paiements du jour pour tester les revenus temps réel

### 2.2 Vérifier le Chargement
Le script affiche automatiquement :
```
NOTICE:  Mois -6 : 195 colis créés
NOTICE:  Mois -5 : 203 colis créés
...
NOTICE:  Mois actuel : 50 colis créés (CHUTE DE 75%)
NOTICE:  Paiements du jour créés
```

---

## 🧪 Étape 3 : Tests sur le Dashboard

### 3.1 Se Connecter
1. Ouvrir `http://localhost:5173/login`
2. Utiliser vos identifiants réels (pas de mock !)
3. Vérifier que le token JWT est stocké

### 3.2 Vérifier les Statistiques Globales
**Attendu** :
- **Total Colis** : ~1150
- **Clients Actifs** : 5
- **Revenu Total** : ~57 500 000 FCFA
- **Revenu du Jour** : ~250 000 FCFA

**Validation** :
```sql
-- Comparer avec la base
SELECT COUNT(*) FROM colis; -- Doit correspondre au dashboard
```

### 3.3 Vérifier les Graphiques

#### Graphique "Évolution des Colis"
**Attendu** : 6 mois stables (~200 colis) puis chute brutale à 50

**Validation SQL** :
```sql
SELECT 
  TO_CHAR(date_envoi, 'Mon') as mois,
  COUNT(*) as total
FROM colis
WHERE date_envoi >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY TO_CHAR(date_envoi, 'YYYY-MM'), TO_CHAR(date_envoi, 'Mon')
ORDER BY TO_CHAR(date_envoi, 'YYYY-MM');
```

#### Graphique "Répartition du Trafic"
**Attendu** : ~70% Maritime (anormal par rapport à l'historique)

**Validation SQL** :
```sql
SELECT 
  trafic_envoi,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pct
FROM colis
WHERE date_envoi >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY trafic_envoi;
```

---

## 🤖 Étape 4 : Validation de l'IA

### 4.1 Panneau "Analyses & Recommandations IA"
**Localisation** : En bas à droite du dashboard

**Résultat Attendu** :
```
🚨 ALERTE : Chute d'Activité Structurelle

Votre volume projeté est en baisse de 75% par rapport à votre moyenne trimestrielle.

Cause identifiée : 
  Dépendance excessive au trafic maritime qui subit une chute séculaire.
  OU
  Sensibilité au prix détectée : Vos tarifs moyens ont augmenté de plus de 10%.

Action recommandée : 
  DIVERSIFICATION : Boostez les offres Aériennes (transit plus rapide) pour compenser.
  OU
  AJUSTEMENT TARIFAIRE : Revoyez vos marges sur les produits phares...
```

### 4.2 Vérifier la Logique de Détection

**Test 1 : Chute >20% détectée ?**
```sql
-- Moyenne des 3 derniers mois
SELECT AVG(nb) as moyenne_3_mois FROM (
  SELECT COUNT(*) as nb
  FROM colis
  WHERE date_envoi >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
    AND date_envoi < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY TO_CHAR(date_envoi, 'YYYY-MM')
) t;
-- Résultat attendu : ~200

-- Mois actuel
SELECT COUNT(*) as mois_actuel FROM colis
WHERE date_envoi >= DATE_TRUNC('month', CURRENT_DATE);
-- Résultat attendu : 50

-- Chute = (200 - 50) / 200 = 75% ✅
```

**Test 2 : Corrélation avec le trafic maritime ?**
```sql
-- Vérifier si >60% maritime
SELECT 
  ROUND(COUNT(*) FILTER (WHERE trafic_envoi IN ('IMPORT_MARITIME', 'EXPORT_MARITIME')) * 100.0 / COUNT(*), 1) as pct_maritime
FROM colis
WHERE date_envoi >= DATE_TRUNC('month', CURRENT_DATE);
-- Résultat attendu : ~70% ✅
```

**Test 3 : Augmentation des prix >10% ?**
```sql
-- Prix moyen ancien
SELECT ROUND(AVG(prix_unit), 0) as prix_ancien
FROM marchandise m
JOIN colis c ON m.colis_id = c.id
WHERE c.date_envoi < DATE_TRUNC('month', CURRENT_DATE)
  AND c.date_envoi >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months';
-- Résultat attendu : ~50 000 FCFA

-- Prix moyen actuel
SELECT ROUND(AVG(prix_unit), 0) as prix_actuel
FROM marchandise m
JOIN colis c ON m.colis_id = c.id
WHERE c.date_envoi >= DATE_TRUNC('month', CURRENT_DATE);
-- Résultat attendu : ~57 000 FCFA

-- Augmentation = (57000 - 50000) / 50000 = 14% ✅
```

---

## 📈 Étape 5 : Tests Temps Réel

### 5.1 Créer un Nouveau Colis
1. Aller sur `/admin/colis/nouveau`
2. Remplir le formulaire
3. Soumettre

**Attendu** :
- Le compteur "Total Colis" passe à 1151 (après 30 sec max)
- Une nouvelle activité apparaît dans "Activités Récentes"

### 5.2 Enregistrer un Paiement
1. Créer un paiement pour une facture
2. Valider le paiement

**Attendu** :
- "Revenu du Jour" augmente du montant
- Activité "Paiement reçu" visible

---

## ✅ Checklist de Validation Finale

### Données Dynamiques
- [ ] Statistiques = requêtes SQL réelles
- [ ] Graphiques alimentés par `/analytics/chart-data`
- [ ] Aucune donnée hardcodée visible

### Intelligence Artificielle
- [ ] Chute de 75% détectée
- [ ] Cause identifiée (maritime OU prix)
- [ ] Recommandation affichée
- [ ] Corrélation logique entre cause et action

### Temps Réel
- [ ] Nouveau colis → Stats mises à jour
- [ ] Nouveau paiement → Revenus actualisés
- [ ] Rafraîchissement automatique (30 sec)

### Audit Zéro Mock
- [ ] Pas de `USE_MOCK_AUTH` actif
- [ ] Pas de `generateMockData()` appelé
- [ ] Connexion JWT uniquement

---

## 🎉 Résultat Attendu

Si tous les tests passent, vous avez confirmé que :
1. ✅ Le système est 100% dynamique
2. ✅ L'IA détecte et diagnostique correctement
3. ✅ Les recommandations sont contextuelles
4. ✅ Le temps réel fonctionne

**Félicitations ! Votre système est prêt pour la production.** 🚀
