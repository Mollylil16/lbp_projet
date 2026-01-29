# 📋 ANALYSE COMPLÈTE DES BESOINS - LBP (La Belle Porte)

## 1. SYSTÈME DE RÔLES ET PERMISSIONS

### 1.1 Rôles identifiés dans STTINTER (à adapter pour LBP)

#### Rôles principaux:
1. **SUPER_ADMIN** - Accès total
2. **ADMIN** - Gestion complète sauf paramètres système
3. **OPERATEUR_COLIS** - Création/modification de colis
4. **VALIDATEUR** - Validation des factures et paiements
5. **CAISSIER** - Gestion des encaissements
6. **AGENCE_MANAGER** - Gestion d'une agence spécifique
7. **LECTURE_SEULE** - Consultation uniquement
8. **OPERATEUR_GROUPAGE** - Uniquement module groupage

### 1.2 Permissions CODEACCES (STTINTER)

| CODE | Description | Application LBP |
|------|-------------|-----------------|
| 1 | Validation ouverture dossier | Validation création colis |
| 2 | Accès total | SUPER_ADMIN |
| 5 | Impossible de supprimer | Protection suppression |
| 6 | Impossible de modifier | Protection modification |
| 7 | Validation minute | Validation documents |
| 8 | Page individuelle | Voir uniquement ses données |
| 9 | Page agence | Limiter à une agence |
| 10 | Validation proforma | Validation factures |
| 11 | Validation définitif | Validation définitive |
| 12 | Uniquement groupage | Module groupage seul |
| 13 | Ajout module utilisateur | Gestion utilisateurs |
| 14 | Voir toutes agences | Multi-agences |
| 15 | Super action | Actions système |
| 16 | Annuler encaissement groupage | Annulation paiements |

### 1.3 Modules et permissions LBP

#### Module: COLIS
- `colis.groupage.read` - Voir groupage
- `colis.groupage.create` - Créer groupage
- `colis.groupage.update` - Modifier groupage
- `colis.groupage.delete` - Supprimer groupage
- `colis.autres-envois.read` - Voir autres envois
- `colis.autres-envois.create` - Créer autres envois
- `colis.autres-envois.update` - Modifier autres envois
- `colis.autres-envois.delete` - Supprimer autres envois

#### Module: CLIENTS
- `clients.read` - Voir clients
- `clients.create` - Créer client
- `clients.update` - Modifier client
- `clients.delete` - Supprimer client

#### Module: FACTURES
- `factures.read` - Voir factures
- `factures.create` - Créer facture
- `factures.validate` - Valider facture
- `factures.cancel` - Annuler facture
- `factures.print` - Imprimer facture

#### Module: PAIEMENTS
- `paiements.read` - Voir paiements
- `paiements.create` - Enregistrer paiement
- `paiements.cancel` - Annuler paiement
- `paiements.validate` - Valider paiement

#### Module: RAPPORTS
- `rapports.view` - Voir rapports
- `rapports.export` - Exporter rapports

#### Module: DASHBOARD
- `dashboard.view` - Voir dashboard
- `dashboard.admin` - Dashboard administrateur complet

#### Module: CAISSE
- `caisse.view` - Voir point caisse
- `caisse.operations` - Opérations caisse

#### Module: UTILISATEURS
- `users.read` - Voir utilisateurs
- `users.create` - Créer utilisateur
- `users.update` - Modifier utilisateur
- `users.delete` - Supprimer utilisateur
- `users.permissions` - Gérer permissions

## 2. STRUCTURE DES DONNÉES COLIS

### 2.1 Champs obligatoires Groupage
- `trafic_envoi`: Import Aérien, Import Maritime, Export Aérien, Export Maritime
- `date_envoi`: Date d'envoi
- `mode_envoi`: Toujours "groupage"
- Informations expéditeur (client_colis):
  - `nom_exp`: Nom expéditeur
  - `type_piece_exp`: Type de pièce d'identité
  - `num_piece_exp`: Numéro de pièce
  - `tel_exp`: Téléphone
  - `email_exp`: Email (optionnel)
- Informations marchandise (table marchandise):
  - `nom_marchandise`: Nom de la marchandise
  - `nbre_colis`: Nombre de colis
  - `nbre_articles`: Nombre d'articles
  - `poids_total`: Poids total
  - `prix_unit`: Prix unitaire
  - `prix_emballage`: Prix emballage
  - `prix_assurance`: Prix assurance
  - `prix_agence`: Prix agence
  - `total_montant`: Total
- Informations destinataire:
  - `nom_destinataire`: Nom destinataire
  - `lieu_dest`: Lieu de destination
  - `tel_dest`: Téléphone
  - `email_dest`: Email (optionnel)
- Informations récupérateur (optionnel):
  - `nom_recup`: Nom récupérateur
  - `adresse_recup`: Adresse
  - `tel_recup`: Téléphone
  - `email_recup`: Email

### 2.2 Champs Autres Envois
- Mêmes champs que groupage SAUF:
  - `mode_envoi`: DHL, Colis Rapides Export, Colis Rapides Import, Autres

### 2.3 Génération Référence Colis
- Format: `{CODE_AGENCE}{NUMERO_INCREMENTAL}`
- Exemple: ECO-0124-001

## 3. SYSTÈME DE FACTURATION

### 3.1 Types de factures
1. **Facture Proforma** - Facture temporaire avant paiement
2. **Facture Définitive** - Facture validée après paiement

### 3.2 Éléments facture
- En-tête avec logo LBP
- Informations entreprise (nom, adresse, contacts, RCCM, NIF, etc.)
- Numéro facture: `FCO{MM}{YY}/{NUMERO}`
- Date facture
- Informations client expéditeur
- Détails colis:
  - Référence colis
  - Nom marchandise
  - Quantité, poids
  - Prix unitaire
  - Sous-totaux
- Totaux:
  - Total HT
  - TVA (si applicable)
  - Total TTC
- Règlement:
  - Mode paiement
  - Montant payé
  - Restant à payer
- Pied de page:
  - Date édition
  - Utilisateur qui a édité
  - Message de remerciement

### 3.3 Processus facturation
1. Création colis → Génération automatique facture proforma
2. Validation facture proforma → Génération facture définitive
3. Encaissement paiement → Mise à jour statut
4. Impression PDF facture

## 4. SYSTÈME DE PAIEMENTS

### 4.1 Types paiements
- Comptant
- 30 jours
- 45 jours
- 60 jours
- 90 jours

### 4.2 Processus encaissement
1. Sélection colis à encaisser
2. Affichage montant total
3. Calcul montant déjà payé
4. Calcul restant à payer
5. Saisie montant encaissé
6. Sélection mode paiement
7. Calcul monnaie rendue (si comptant)
8. Validation encaissement
9. Mise à jour point caisse

## 5. RAPPORTS ET STATISTIQUES

### 5.1 Rapports Colis
- Rapport par période
- Rapport par trafic (Import/Export Aérien/Maritime)
- Rapport par mode envoi
- Rapport par client
- Export Excel/PDF

### 5.2 Statistiques Dashboard
- Colis créés aujourd'hui
- Colis en transit
- Colis livrés
- Revenus jour/mois
- Clients actifs
- Factures à valider
- Point caisse du jour

## 6. INFORMATIONS ENTREPRISE LBP

### 6.1 Données à configurer
- Nom: "LA BELLE PORTE" ou "LBP"
- Siège social: À définir
- Adresse complète
- Téléphones
- Email
- Site web
- RCCM
- NIF/Numéro contribuable
- Numéro compte bancaire
- Logo (fichier image)

### 6.2 Style factures
- Logo en en-tête
- Couleurs: À définir (différent de STTINTER)
- Format: PDF A4 portrait
- Police: Professionnelle

## 7. MODULES À DÉVELOPPER

### Priorité 1 (Essentiels)
1. ✅ Authentification et permissions
2. ✅ Dashboard avec statistiques
3. ⏳ Gestion Colis (Groupage + Autres Envois) - CRUD complet
4. ⏳ Gestion Clients Expéditeurs - CRUD complet
5. ⏳ Système Facturation (Proforma + Définitive)
6. ⏳ Système Paiements/Encaissements
7. ⏳ Rapports Colis
8. ⏳ Point Caisse

### Priorité 2 (Important)
9. ⏳ Gestion Utilisateurs et Permissions
10. ⏳ Configuration entreprise
11. ⏳ Export PDF factures
12. ⏳ Export Excel rapports

### Priorité 3 (Amélioration)
13. ⏳ Notifications
14. ⏳ Historique des actions
15. ⏳ Recherche avancée
16. ⏳ Filtres complexes

## 8. SÉPARATION STTINTER / LBP

### 8.1 Dossiers complètement séparés
- ✅ `/lbp-frontend/` - Frontend React LBP (déjà créé)
- ⏳ `/lbp-backend/` - Backend NestJS LBP (à créer)
- ⏳ `/lbp-database/` - Schéma BDD LBP (à créer)

### 8.2 Différences clés
- Nom logiciel: "LBP" vs "STTINTER"
- Logo et branding différents
- Tables BDD préfixées `lbp_` vs `stt_inter_`
- Variables d'environnement séparées
- Configurations indépendantes

## 9. ESTHÉTIQUE ET UI/UX

### 9.1 Thème LBP
- Couleurs primaires: À définir (suggestion: bleu/vert moderne)
- Logo: À créer
- Typographie: Moderne et lisible
- Icônes: Ant Design Icons
- Layout: Sidebar + Header + Content

### 9.2 Composants UI
- Tables: Ant Design Table avec pagination
- Formulaires: Ant Design Form avec validation
- Modales: Ant Design Modal
- Notifications: React Hot Toast
- Charts: Recharts pour graphiques

## 10. VALIDATION ET TESTS

### 10.1 Validation formulaires
- Champs obligatoires
- Formats (email, téléphone, dates)
- Montants positifs
- Cohérence des données

### 10.2 Tests à prévoir
- Tests unitaires composants
- Tests d'intégration API
- Tests E2E scénarios critiques
