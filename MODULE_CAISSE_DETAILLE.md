# 💰 MODULE CAISSE DÉTAILLÉ - LBP

## 📋 ANALYSE DES BESOINS (D'après les images fournies)

### 🎯 OBJECTIF
Implémenter un module de **SUIVI CAISSE** complet avec gestion détaillée des :
- **APPRO** (Approvisionnements)
- **DÉCAISSEMENTS** (Sorties de caisse)
- **ENTRÉES DE CAISSE** (Chèques, Espèces, Virements)

---

## 📊 STRUCTURE IDENTIFIÉE DANS LES IMAGES

### 1. **APPRO (Approvisionnement)**

**Champs requis:**
- `DATE` - Date de l'approvisionnement
- `LIBELLE` - Libellé/Description
- `MONTANT` - Montant approvisionné

**Exemples:**
- Initialisation de caisse
- Versement en caisse
- Dépôt d'espèces

---

### 2. **DÉCAISSEMENT (Sorties de caisse)**

**Champs requis:**
- `NUMERO_DORDRE` - Numéro d'ordre du décaissement
- `DATE` - Date du décaissement
- `NOM_DU_DEMANDEUR` - Nom de la personne qui demande
- `NUMERO_DE_DOSSIER` - Numéro de dossier lié (colis)
- `LIBELLES` - Description du décaissement
- `MONTANT` - Montant décaissé
- `MONTANT_RESTANT` - Montant restant après décaissement

**Exemples:**
- Paiement fournisseur
- Frais de traitement
- Remboursement client

---

### 3. **ENTRÉES DE CAISSE**

#### 3.1 **CHEQUE (Chèque)**

**Champs requis:**
- `DATE` - Date de réception
- `NUMERO_DE_DOSSIER` - Numéro de dossier (colis)
- `NOM_DU_CLIENT` - Nom du client
- `NUMERO_DE_CHEQ` - Numéro du chèque
- `BANQUE_REMISE` - Banque où le chèque est remis
- `MONTANT_PERCU` - Montant perçu
- `RESTE_A_PAYER` - Reste à payer sur le dossier
- `SOLDE` - Solde de caisse après encaissement
- `LIBELLE` - Description

#### 3.2 **ESPECE (Espèces)**

**Champs requis:**
- `DATE` - Date de réception
- `NUMERO_DOSSIER` - Numéro de dossier (colis)
- `NOM_DU_CLIENT` - Nom du client
- `NUMERO_RECU` - Numéro de reçu
- `MONTANT_PERCU` - Montant perçu
- `RESTE_A_PAYER` - Reste à payer
- `SOLDE` - Solde de caisse
- `LIBELLE` - Description

#### 3.3 **VIREMENT BANK OF BANK (Virement bancaire)**

**Champs requis:**
- `DATE` - Date de réception
- `NUMERO_DU_DOSSIER` - Numéro de dossier (colis)
- `NOM_DU_CLIENT` - Nom du client
- `NUMERO_DORDRE_DE_VIREMENT` - Numéro d'ordre de virement
- `BANK_CREDITEE` - Banque créditée
- `NUMERO_DU_RECU` - Numéro du reçu
- `LIBELLE` - Description
- `MONTANT_PERCU` - Montant perçu
- `RESTE_A_PAYER` - Reste à payer
- `SOLDE` - Solde de caisse

---

### 4. **VERSEMENT GÉNÉRAL**

#### 4.1 **VERSEMENT ESPECE RECETTE**

**FICHE D'ENGAGEMENT:**
- `DATE`
- `NUMERO_DE_FICHE_RECETTE`
- `NUMERO_DE_VERSEMENT_INTERNE`
- `MONTANT`
- `PRODUIT`
- `NOM_DU_DEPOSANT`

**RETOUR DE VERSEMENT BANK:**
- `DATE`
- `NUMERO_DE_VERSEMENT_INTERNE` (doit donner l'info de fiche d'engagement et fiche de recette)
- `NUMERO_DE_BORDEREAU_DE_VERSEMENT_BANK`

#### 4.2 **REMISE CHEQUE**

- `DATE`
- `NUMERO_DE_FICHE_RECETTE`
- `NUMERO_DE_LA_REMISE`
- `NOM_DU_DEPOSANT`
- `MONTANT_TOTAL`

#### 4.3 **VIREMENT**

- `DATE`
- `NUMERO_DU_DOSSIER`
- `NUMERO_DORDRE_DE_VIREMENT`
- `NOM_DU_CLIENT`
- `MONTANT`

---

## ⚠️ EXIGENCES CRITIQUES (3ème image)

### 1. **Numéro d'ouverture de dossier**
> "LE LOGICIEL DOIT IMPOSER UN NUMERO D'OUVERTURE DE DOSSIER"

**Action:** Le système doit générer automatiquement un numéro unique pour chaque dossier/colis lors de sa création.

### 2. **Numéros de fiche recette et bordereaux**
> "LE LOGICIEL DOIT NOUS IMPOSER LES NUMEROS DE FICHE RECETTE ET BORDEREAUX DE VERSEMENT INTERNE"

**Action:** Le système doit générer automatiquement :
- Numéro de fiche recette
- Numéro de bordereau de versement interne

### 3. **Alerte saisie non conforme**
> "UNE ALERTE POUR LES SAISIR NON CONFORME"

**Action:** Le système doit alerter si :
- Un numéro de dossier est saisi incorrectement
- Un numéro de bordereau est saisi incorrectement
- Un montant ne correspond pas

### 4. **Rapport grandes lignes avec total**
> "LE RAPPORT DOIT DES GRANDES LIGNES DOIVENT DONNER UN MONTANT TOTAL"

**Action:** Le rapport "Grandes Lignes" doit afficher un montant total pour chaque section (APPRO, DÉCAISSEMENT, ENTREES).

---

## 📊 STRUCTURE BASE DE DONNÉES (STTINTER)

### Table `stt_inter_t_appro` (Mouvements de caisse)

```sql
CREATE TABLE `stt_inter_t_appro` (
  `id_t_appro` INT(11) NOT NULL,
  `Date` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `LIBELLE` VARCHAR(300) DEFAULT NULL,
  `MONTANT` INT(11) DEFAULT NULL,
  `SOLDE` INT(11) DEFAULT NULL,
  `CAISSIER` VARCHAR(50) DEFAULT NULL,
  `REF` VARCHAR(16) DEFAULT NULL,
  `R` INT(11) DEFAULT NULL,  -- 1 = Entrée, 2 = Sortie
  `CODEJ` VARCHAR(3) DEFAULT NULL,  -- Code journal (caisse)
  `Dossier` VARCHAR(14) DEFAULT NULL,  -- Numéro dossier/colis
  `MODE_REGL` VARCHAR(50) DEFAULT NULL,  -- ESPECE, CHEQUE, VIREMENT
  `optique` VARCHAR(255) DEFAULT NULL,  -- Type opération
  `NUMEROCHEQ` VARCHAR(255) DEFAULT NULL,  -- Numéro chèque
  `BENEFICIAIRE` VARCHAR(255) DEFAULT NULL,  -- Nom bénéficiaire
  `etat` INT(11) DEFAULT NULL,  -- 0 = Brouillon, 1 = Validé
  `id_colis` INT(11) DEFAULT NULL,
  `CODE_USER` VARCHAR(100) DEFAULT NULL,
  `DATE_CPTA` VARCHAR(10) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3;
```

**Champs importants:**
- `R = 1` → Entrée de caisse (APPRO, Paiements)
- `R = 2` → Sortie de caisse (Décaissement)
- `MODE_REGL` → ESPECE, CHEQUE, VIREMENT
- `Dossier` → Numéro de dossier/colis
- `SOLDE` → Solde de caisse après l'opération

---

## 🎯 CE QU'IL FAUT IMPLÉMENTER DANS LBP

### 1. **Module Suivi Caisse** (Nouveau)

#### 1.1 Page "SUIVI CAISSE"

**Sections:**
1. **APPRO (Approvisionnement)**
   - Formulaire pour ajouter un approvisionnement
   - Liste des approvisionnements
   - Total des approvisionnements

2. **DÉCAISSEMENT**
   - Formulaire pour enregistrer un décaissement
   - Liste des décaissements
   - Total des décaissements

3. **ENTRÉES DE CAISSE**
   - **Chèque:** Formulaire + Liste
   - **Espèce:** Formulaire + Liste
   - **Virement:** Formulaire + Liste

4. **Rapport "Grandes Lignes"**
   - Total APPRO
   - Total DÉCAISSEMENT
   - Total ENTREES (Chèque + Espèce + Virement)
   - Solde caisse actuel

---

### 2. **Génération Automatique de Numéros**

#### 2.1 Numéro d'ouverture de dossier
- Format: `{CODE_AGENCE}-{MMYY}-{NUM}`
- Exemple: `LBP-0124-001`
- Généré automatiquement à la création d'un colis

#### 2.2 Numéro de fiche recette
- Format: `FR{MM}{YY}/{NUM}`
- Exemple: `FR0124/001`
- Généré automatiquement lors d'un versement

#### 2.3 Numéro de bordereau de versement interne
- Format: `BVI{MM}{YY}/{NUM}`
- Exemple: `BVI0124/001`
- Généré automatiquement lors d'un versement

#### 2.4 Numéro d'ordre de décaissement
- Format: `DEC{MM}{YY}/{NUM}`
- Exemple: `DEC0124/001`
- Généré automatiquement lors d'un décaissement

---

### 3. **Validation et Alertes**

#### 3.1 Validation des numéros
- Vérifier que le numéro de dossier existe
- Vérifier que le numéro de bordereau est valide
- Vérifier que les montants correspondent

#### 3.2 Alertes
- Alerte si numéro de dossier non conforme
- Alerte si numéro de bordereau non conforme
- Alerte si montant ne correspond pas

---

### 4. **Calculs Automatiques**

#### 4.1 Solde de caisse
```typescript
Solde = Solde_Initial + Total_APPRO + Total_ENTREES - Total_DECAISSEMENT
```

#### 4.2 Reste à payer
```typescript
Reste_A_Payer = Montant_Total_Dossier - Total_Paiements_Effectues
```

---

## 📋 PLAN D'IMPLÉMENTATION

### Phase 1: Structure Base de Données

#### Table `lbp_mouvements_caisse`
```sql
CREATE TABLE `lbp_mouvements_caisse` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `type` ENUM('APPRO', 'DECAISSEMENT', 'ENTREE_CHEQUE', 'ENTREE_ESPECE', 'ENTREE_VIREMENT'),
  `libelle` VARCHAR(300),
  `montant` DECIMAL(15,2),
  `solde` DECIMAL(15,2),  -- Solde après l'opération
  `mode_reglement` ENUM('ESPECE', 'CHEQUE', 'VIREMENT'),
  `numero_dossier` VARCHAR(50),  -- RefColis
  `numero_cheque` VARCHAR(50),
  `numero_virement` VARCHAR(50),
  `numero_recu` VARCHAR(50),
  `numero_fiche_recette` VARCHAR(50),
  `numero_bordereau_versement` VARCHAR(50),
  `numero_ordre_decaissement` VARCHAR(50),
  `nom_client` VARCHAR(255),
  `nom_demandeur` VARCHAR(255),
  `banque_remise` VARCHAR(100),
  `banque_creditee` VARCHAR(100),
  `reste_a_payer` DECIMAL(15,2),
  `id_colis` INT,
  `id_caisse` INT,  -- ID de la caisse
  `code_user` VARCHAR(50),
  `etat` TINYINT DEFAULT 1,  -- 0 = Brouillon, 1 = Validé
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_colis`) REFERENCES `lbp_colis`(`id_colis`),
  FOREIGN KEY (`id_caisse`) REFERENCES `lbp_caisses`(`id`)
);
```

#### Table `lbp_caisses`
```sql
CREATE TABLE `lbp_caisses` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(50) UNIQUE,
  `libelle` VARCHAR(100),
  `montant_initial` DECIMAL(15,2) DEFAULT 0,
  `solde_actuel` DECIMAL(15,2) DEFAULT 0,
  `autorise` BOOLEAN DEFAULT TRUE,
  `id_agence` INT,
  `code_user` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Table `lbp_numeros_sequences`
```sql
CREATE TABLE `lbp_numeros_sequences` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `type` VARCHAR(50) UNIQUE,  -- 'DOSSIER', 'FICHE_RECETTE', 'BORDEREAU_VI', 'ORDRE_DEC'
  `prefixe` VARCHAR(10),
  `annee` INT,
  `mois` INT,
  `numero` INT DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Phase 2: Frontend React

#### 2.1 Composants à créer

1. **`SuiviCaissePage.tsx`** - Page principale
   - Tabs: APPRO, DÉCAISSEMENT, ENTREES, RAPPORT

2. **`ApproForm.tsx`** - Formulaire approvisionnement
3. **`ApproList.tsx`** - Liste approvisionnements

4. **`DecaissementForm.tsx`** - Formulaire décaissement
5. **`DecaissementList.tsx`** - Liste décaissements

6. **`EntreeCaisseForm.tsx`** - Formulaire entrée (Chèque/Espèce/Virement)
7. **`EntreeCaisseList.tsx`** - Liste entrées

8. **`RapportGrandesLignes.tsx`** - Rapport avec totaux

#### 2.2 Services API

- `caisse.service.ts` - Gestion mouvements caisse
- `numeros.service.ts` - Génération numéros automatiques

#### 2.3 Types TypeScript

```typescript
export interface MouvementCaisse {
  id: number
  date: string
  type: 'APPRO' | 'DECAISSEMENT' | 'ENTREE_CHEQUE' | 'ENTREE_ESPECE' | 'ENTREE_VIREMENT'
  libelle: string
  montant: number
  solde: number
  mode_reglement?: 'ESPECE' | 'CHEQUE' | 'VIREMENT'
  numero_dossier?: string
  numero_cheque?: string
  numero_virement?: string
  numero_recu?: string
  numero_fiche_recette?: string
  numero_bordereau_versement?: string
  numero_ordre_decaissement?: string
  nom_client?: string
  nom_demandeur?: string
  banque_remise?: string
  banque_creditee?: string
  reste_a_payer?: number
  id_colis?: number
  id_caisse: number
  code_user: string
  etat: number
}
```

---

### Phase 3: Backend NestJS

#### 3.1 Modules à créer

1. **`CaisseModule`**
   - `MouvementsCaisseController`
   - `MouvementsCaisseService`
   - `NumerosService` (génération automatique)

2. **`NumerosModule`**
   - Génération numéros séquentiels
   - Validation numéros

#### 3.2 Endpoints API

```
POST   /api/caisse/appro              - Créer approvisionnement
POST   /api/caisse/decaissement       - Créer décaissement
POST   /api/caisse/entree             - Créer entrée caisse
GET    /api/caisse/mouvements         - Liste mouvements
GET    /api/caisse/rapport-grandes-lignes - Rapport avec totaux
GET    /api/caisse/solde              - Solde actuel
POST   /api/numeros/generer           - Générer numéro automatique
POST   /api/numeros/valider           - Valider numéro
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Backend
- [ ] Créer table `lbp_mouvements_caisse`
- [ ] Créer table `lbp_caisses`
- [ ] Créer table `lbp_numeros_sequences`
- [ ] Implémenter génération numéros automatiques
- [ ] Implémenter validation numéros
- [ ] Implémenter calculs solde
- [ ] Créer APIs REST

### Frontend
- [ ] Créer page `SuiviCaissePage`
- [ ] Créer composants formulaires (APPRO, DÉCAISSEMENT, ENTREES)
- [ ] Créer composants listes
- [ ] Créer composant rapport "Grandes Lignes"
- [ ] Implémenter alertes validation
- [ ] Implémenter calculs automatiques
- [ ] Créer services API

### Tests
- [ ] Tests génération numéros
- [ ] Tests validation numéros
- [ ] Tests calculs solde
- [ ] Tests alertes

---

## 🎯 PRIORITÉS

### Priorité 1 (Critique)
1. Génération automatique numéros (dossier, fiche recette, bordereau)
2. Module APPRO (approvisionnement)
3. Module ENTREES (Chèque, Espèce, Virement)
4. Calculs automatiques (solde, reste à payer)

### Priorité 2 (Important)
5. Module DÉCAISSEMENT
6. Validation et alertes
7. Rapport "Grandes Lignes"

### Priorité 3 (Optionnel)
8. Historique complet
9. Export Excel/PDF
10. Graphiques statistiques

---

## 📝 NOTES IMPORTANTES

1. **Numéros obligatoires:** Le système DOIT générer automatiquement tous les numéros (pas de saisie manuelle)

2. **Validation stricte:** Tous les numéros doivent être validés avant enregistrement

3. **Alertes:** Le système doit alerter immédiatement si une saisie est non conforme

4. **Totaux:** Le rapport "Grandes Lignes" doit toujours afficher des totaux pour chaque section

5. **Traçabilité:** Tous les mouvements doivent être tracés avec date, utilisateur, et solde

---

**STATUS:** ⚠️ **À IMPLÉMENTER** - Module critique pour la gestion de caisse LBP
