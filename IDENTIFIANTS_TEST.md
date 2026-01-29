# 🔐 IDENTIFIANTS DE TEST - LBP Frontend

## 📋 MODE DÉVELOPPEMENT

En mode développement (sans backend), vous pouvez vous connecter avec les identifiants suivants :

---

## 👥 UTILISATEURS DISPONIBLES

### 1. **Super Administrateur** (Toutes les permissions)
- **Username:** `admin`
- **Password:** `admin123`
- **Rôle:** SUPER_ADMIN
- **Permissions:** Toutes (`*`)
- **Accès:** Tous les modules, toutes les actions

---

### 2. **Administrateur** (Gestion complète)
- **Username:** `manager`
- **Password:** `manager123`
- **Rôle:** ADMIN
- **Permissions:** Gestion complète (sauf configuration système)
- **Accès:** Tous les modules avec gestion complète

---

### 3. **Opérateur Colis** (CRUD Colis)
- **Username:** `operateur`
- **Password:** `operateur123`
- **Rôle:** OPERATEUR_COLIS
- **Permissions:** Créer, modifier, voir les colis
- **Accès:** 
  - ✅ Groupage (créer, modifier, voir)
  - ✅ Autres Envois (créer, modifier, voir)
  - ✅ Clients (créer, voir)
  - ✅ Factures (voir, imprimer)
  - ❌ Pas de suppression
  - ❌ Pas de validation

---

### 4. **Validateur** (Validation uniquement)
- **Username:** `validateur`
- **Password:** `validateur123`
- **Rôle:** VALIDATEUR
- **Permissions:** Validation uniquement
- **Accès:**
  - ✅ Voir colis
  - ✅ Valider colis
  - ✅ Voir factures
  - ✅ Valider factures
  - ✅ Voir paiements
  - ✅ Valider paiements
  - ❌ Pas de création/modification

---

### 5. **Caissier** (Paiements + Caisse)
- **Username:** `caissier`
- **Password:** `caissier123`
- **Rôle:** CAISSIER
- **Permissions:** Paiements et gestion de caisse
- **Accès:**
  - ✅ Voir colis
  - ✅ Voir factures
  - ✅ Créer paiements
  - ✅ Voir paiements
  - ✅ Suivi Caisse (APPRO, DÉCAISSEMENT, ENTREES)
  - ✅ Point Caisse
  - ❌ Pas de création/modification de colis

---

### 6. **Gestionnaire Agence** (Limité à agence)
- **Username:** `agence`
- **Password:** `agence123`
- **Rôle:** AGENCE_MANAGER
- **Permissions:** Gestion limitée à son agence
- **Accès:**
  - ✅ Voir/modifier colis de son agence
  - ✅ Créer colis
  - ✅ Voir clients
  - ✅ Créer clients
  - ✅ Voir factures
  - ✅ Créer factures
  - ✅ Voir paiements
  - ✅ Créer paiements
  - ✅ Rapports (limités à son agence)
  - ❌ Pas de suppression

---

### 7. **Lecture Seule** (Consultation uniquement)
- **Username:** `lecteur`
- **Password:** `lecteur123`
- **Rôle:** LECTURE_SEULE
- **Permissions:** Consultation uniquement
- **Accès:**
  - ✅ Voir colis
  - ✅ Voir clients
  - ✅ Voir factures
  - ✅ Voir paiements
  - ✅ Voir rapports
  - ✅ Voir dashboard
  - ❌ Pas de création
  - ❌ Pas de modification
  - ❌ Pas de suppression

---

## 🚀 COMMENT SE CONNECTER

1. **Lancez le serveur de développement:**
   ```bash
   cd lbp-frontend
   npm run dev
   ```

2. **Ouvrez votre navigateur:**
   - Allez sur `http://localhost:3000`
   - Vous serez redirigé vers `/login`

3. **Utilisez un des identifiants ci-dessus:**
   - Exemple: `admin` / `admin123`
   - Cliquez sur "Connexion"

4. **Vous serez redirigé vers le Dashboard**

---

## 💡 CONSEIL

Pour tester les différentes permissions, connectez-vous avec différents utilisateurs :
- **`admin`** → Voir toutes les fonctionnalités
- **`operateur`** → Voir les limitations (pas de suppression/validation)
- **`lecteur`** → Voir le mode consultation seule
- **`caissier`** → Tester le module Suivi Caisse

---

## ⚠️ NOTES IMPORTANTES

1. **Mode développement uniquement**
   - Ces identifiants fonctionnent uniquement en mode développement
   - En production, ils seront désactivés automatiquement

2. **Pas de backend requis**
   - L'authentification mock fonctionne sans backend
   - Les données sont stockées dans le localStorage du navigateur

3. **Déconnexion**
   - Cliquez sur votre nom en haut à droite
   - Sélectionnez "Déconnexion"
   - Ou utilisez le bouton de déconnexion dans le menu

4. **Réinitialisation**
   - Pour réinitialiser la session, videz le localStorage :
     - Ouvrez la console du navigateur (F12)
     - Tapez: `localStorage.clear()`
     - Rechargez la page

---

## 🎯 TESTER LES PERMISSIONS

Pour voir comment les permissions fonctionnent :

1. Connectez-vous avec `operateur`
2. Essayez de supprimer un colis → Le bouton ne devrait pas apparaître
3. Connectez-vous avec `admin`
4. Essayez de supprimer un colis → Le bouton devrait apparaître

---

**Bon test ! 🎉**
