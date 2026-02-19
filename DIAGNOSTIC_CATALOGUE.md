# Diagnostic: Catalogue de Produits Vide

## 🔍 Problème
Le champ "Produit du catalogue" affiche "Aucune donnée" malgré la présence de 70+ produits dans la base.

---

## ✅ Vérifications Effectuées

1. **Base de données** : ✅ 70+ produits présents (seed exécuté)
2. **Backend endpoint** : ✅ Corrigé (`@Query` au lieu de `@Param`)
3. **Frontend hook** : ✅ `useProduitsCatalogue()` correctement implémenté

---

## 🧪 Tests à Effectuer

### Test 1 : Vérifier la Console du Navigateur

1. Ouvrir la page du formulaire de colis
2. Appuyer sur `F12` pour ouvrir les DevTools
3. Aller dans l'onglet **Console**
4. Rechercher des erreurs rouges liées à `/produits-catalogue`

**Erreurs possibles** :
- ❌ `401 Unauthorized` → Problème d'authentification JWT
- ❌ `404 Not Found` → Route backend non trouvée
- ❌ `CORS error` → Problème de configuration CORS
- ❌ `Network error` → Backend non démarré

### Test 2 : Vérifier l'Onglet Network

1. Dans les DevTools, aller dans **Network**
2. Rafraîchir la page
3. Chercher la requête `produits-catalogue`
4. Cliquer dessus et vérifier :
   - **Status** : Doit être `200 OK`
   - **Response** : Doit contenir un tableau JSON avec les produits
   - **Headers** → **Authorization** : Doit contenir `Bearer <token>`

### Test 3 : Tester l'API Manuellement

Ouvrir un terminal et exécuter :

```bash
# 1. Se connecter pour obtenir un token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"manager123"}' \
  | jq -r '.token'

# Copier le token retourné, puis :

# 2. Tester l'endpoint produits-catalogue
curl -X GET http://localhost:3000/produits-catalogue \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  | jq '.[0:3]'  # Afficher les 3 premiers produits
```

**Résultat attendu** :
```json
[
  {
    "id": 1,
    "nom": "ATTIEKE",
    "categorie": "DENREE",
    "nature": "PRIX_UNITAIRE",
    "actif": true
  },
  ...
]
```

---

## 🔧 Solutions Possibles

### Solution 1 : Vider le Cache du Navigateur
```
1. Appuyer sur Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
2. Ou : DevTools → Application → Clear Storage → Clear site data
```

### Solution 2 : Vérifier que le Backend est Bien Redémarré
```bash
# Arrêter le backend (Ctrl+C dans le terminal)
# Puis relancer :
cd /home/molly-ye/Bureau/lbp_projet/backend
npm run start:dev
```

### Solution 3 : Vérifier le Token JWT
Ouvrir la console du navigateur et exécuter :
```javascript
localStorage.getItem('lbp_auth_token')
```

Si `null` ou vide → Se reconnecter

### Solution 4 : Vérifier la Configuration API
Fichier : `/home/molly-ye/Bureau/lbp_projet/src/services/api.service.ts`

Vérifier que :
- `baseURL` pointe vers `http://localhost:3000`
- Le token JWT est bien ajouté dans les headers

---

## 📋 Checklist de Diagnostic

Cochez au fur et à mesure :

- [ ] Backend démarré sur `http://localhost:3000`
- [ ] Frontend démarré sur `http://localhost:5173`
- [ ] Connecté avec `manager/manager123`
- [ ] Token JWT présent dans localStorage
- [ ] Console navigateur sans erreur 401/404
- [ ] Requête `/produits-catalogue` retourne 200 OK
- [ ] Response contient un tableau de produits

---

## 🚨 Si Toujours Bloqué

**Partagez avec moi** :
1. Capture d'écran de la console (F12 → Console)
2. Capture d'écran de Network → produits-catalogue (Headers + Response)
3. Résultat de : `localStorage.getItem('lbp_auth_token')`

Je pourrai alors identifier précisément le problème !
