# 📦 Guide d'Installation Final - LBP Frontend

## 🎯 Installation des Dépendances

### 1. Dépendances de base (déjà installées)
```bash
npm install
```

### 2. Dépendances pour les Tests
```bash
npm install --save-dev \
  @testing-library/jest-dom \
  @testing-library/react \
  @testing-library/user-event \
  @types/jest \
  jest \
  jest-environment-jsdom \
  ts-jest \
  identity-obj-proxy
```

### 3. Dépendances pour Storybook
```bash
npm install --save-dev \
  @storybook/addon-essentials \
  @storybook/addon-interactions \
  @storybook/addon-links \
  @storybook/blocks \
  @storybook/react \
  @storybook/react-vite \
  @storybook/testing-library \
  storybook
```

### 4. Dépendances pour PWA
```bash
npm install --save-dev vite-plugin-pwa
```

### 5. Dépendance pour i18n (si pas encore installée)
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### 6. Installation complète en une commande
```bash
npm install --save-dev \
  @testing-library/jest-dom \
  @testing-library/react \
  @testing-library/user-event \
  @types/jest \
  jest \
  jest-environment-jsdom \
  ts-jest \
  identity-obj-proxy \
  @storybook/addon-essentials \
  @storybook/addon-interactions \
  @storybook/addon-links \
  @storybook/blocks \
  @storybook/react \
  @storybook/react-vite \
  @storybook/testing-library \
  storybook \
  vite-plugin-pwa \
  react-i18next \
  i18next \
  i18next-browser-languagedetector
```

---

## 🧪 Exécution des Tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec coverage
npm run test:coverage
```

---

## 📚 Lancement de Storybook

```bash
# Développement
npm run storybook

# Build de production
npm run build-storybook
```

Storybook sera accessible sur : http://localhost:6006

---

## 📱 Vérification PWA

1. **Build de production** :
```bash
npm run build
npm run preview
```

2. **Ouvrir dans le navigateur** :
   - Ouvrir DevTools (F12)
   - Aller dans l'onglet "Application" (Chrome) ou "Manifest" (Firefox)
   - Vérifier que le manifest est chargé
   - Vérifier que le Service Worker est enregistré

3. **Tester l'installation** :
   - Dans Chrome : Cliquer sur l'icône "Installer" dans la barre d'adresse
   - Dans Firefox : Aller dans le menu → Installer

---

## 🌍 Vérification i18n

1. **Vérifier les traductions** :
   - Changer la langue via le sélecteur dans le header
   - Vérifier que tous les textes changent de langue

2. **Ajouter une nouvelle langue** :
   - Créer un nouveau fichier dans `src/i18n/locales/` (ex: `es.json`)
   - Ajouter la langue dans `src/i18n/index.ts`
   - Utiliser le sélecteur de langue pour tester

---

## 📝 Notes Importantes

### Configuration Jest
Le fichier `jest.config.js` est configuré avec :
- Support TypeScript via `ts-jest`
- Environnement jsdom pour les tests React
- Aliases de chemins (@components, @hooks, etc.)
- Mocks pour les fichiers statiques

### Configuration Storybook
Le fichier `.storybook/main.ts` configure :
- React + Vite
- Addons essentiels
- Support TypeScript
- Auto-docs

Le fichier `.storybook/preview.ts` configure :
- Tous les providers (QueryClient, Router, Theme, etc.)
- Support Dark Mode
- Styles globaux

### Configuration PWA
Le fichier `vite.config.ts` configure :
- Service Worker avec Workbox
- Cache stratégies (NetworkFirst pour API, CacheFirst pour images)
- Manifest PWA
- Auto-update

### Structure i18n
Les traductions sont organisées par namespace :
- `common` : Actions et textes communs
- `auth` : Authentification
- `navigation` : Navigation
- `colis` : Module Colis
- `caisse` : Module Caisse
- `errors` : Messages d'erreur
- `validation` : Messages de validation
- `format` : Formats de date/devise

---

## ✅ Checklist de Vérification

- [ ] Toutes les dépendances installées
- [ ] Tests fonctionnent (`npm run test`)
- [ ] Storybook fonctionne (`npm run storybook`)
- [ ] PWA fonctionne (manifest + service worker)
- [ ] i18n fonctionne (changement de langue)
- [ ] Build de production réussi (`npm run build`)
- [ ] Preview fonctionne (`npm run preview`)

---

## 🐛 Problèmes Courants

### Tests ne fonctionnent pas
- Vérifier que toutes les dépendances de test sont installées
- Vérifier que `setupTests.ts` existe et est configuré
- Vérifier que les mocks sont bien configurés

### Storybook ne démarre pas
- Vérifier que toutes les dépendances Storybook sont installées
- Vérifier que `.storybook/main.ts` et `.storybook/preview.ts` existent
- Supprimer `.storybook/node_modules` et réinstaller

### PWA ne fonctionne pas
- Vérifier que `vite-plugin-pwa` est installé
- Vérifier que `vite.config.ts` contient la configuration PWA
- Vérifier que `public/manifest.json` existe
- Vérifier que le build de production est fait

### i18n ne fonctionne pas
- Vérifier que `react-i18next` et `i18next` sont installés
- Vérifier que `src/i18n/index.ts` est configuré
- Vérifier que les fichiers de traduction existent (`fr.json`, `en.json`)

---

## 🎉 Félicitations !

Toutes les améliorations sont maintenant implémentées et configurées ! Le système est prêt pour la production.
