# 🚀 DÉMARRAGE RAPIDE - LBP Frontend

## 📋 PRÉREQUIS

- Node.js 18+ installé
- npm ou yarn installé

## 🔧 INSTALLATION

```bash
cd lbp-frontend
npm install
```

## ▶️ LANCER LE SERVEUR DE DÉVELOPPEMENT

```bash
npm run dev
```

Le serveur démarre sur : **http://localhost:3000**

## 🌐 ACCÈS À L'APPLICATION

Une fois le serveur lancé, ouvrez votre navigateur et accédez à :

**http://localhost:3000**

### Pages disponibles :

- **Login** : `http://localhost:3000/login`
- **Dashboard** : `http://localhost:3000/dashboard` (nécessite authentification)
- **Suivi Colis** : `http://localhost:3000/colis/groupage` ou `/colis/autres-envois`
- **Clients** : `http://localhost:3000/clients`
- **Factures** : `http://localhost:3000/factures`
- **Paiements** : `http://localhost:3000/paiements`
- **Suivi Caisse** : `http://localhost:3000/caisse/suivi`
- **Paramètres** : `http://localhost:3000/settings`
- **Utilisateurs** : `http://localhost:3000/users`

## ⚠️ NOTES IMPORTANTES

### Backend non connecté

Le frontend est configuré pour se connecter au backend sur `http://localhost:3001/api`.

**Si le backend n'est pas encore lancé :**
- Les appels API échoueront (erreur 404 ou connexion refusée)
- C'est normal, le frontend peut quand même être visualisé
- L'interface sera visible mais les données ne se chargeront pas

### Mode développement

- Hot reload activé (les modifications sont rechargées automatiquement)
- Erreurs affichées dans la console du navigateur
- Source maps activés pour le débogage

## 🛠️ AUTRES COMMANDES

```bash
# Build pour production
npm run build

# Preview du build de production
npm run preview

# Linter
npm run lint
```

## 📝 CONFIGURATION

### Variables d'environnement

Créez un fichier `.env` à la racine de `lbp-frontend` :

```env
VITE_API_URL=http://localhost:3001/api
```

### Port du serveur

Le port par défaut est **3000**. Pour changer, modifiez `vite.config.ts` :

```typescript
server: {
  port: 3000, // Changez ici
}
```

## ✅ VÉRIFICATION

Une fois le serveur lancé, vous devriez voir :

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

Si vous voyez des erreurs, vérifiez :
1. ✅ Node.js installé (`node --version`)
2. ✅ Dépendances installées (`node_modules` existe)
3. ✅ Port 3000 disponible
4. ✅ Aucune erreur dans la console

---

**Bon développement ! 🎉**
