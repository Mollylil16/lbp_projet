# 🔧 Correction de la Boucle de Rechargement Infinie

## ✅ Problèmes Identifiés et Corrigés

### 1. **useAlerts dans alerts.service.ts - Boucle infinie**
- **Problème** : `finalConfig` était recréé à chaque render, déclenchant les `useEffect` en boucle.
- **Solution** : Utilisation de `useMemo` pour mémoriser `finalConfig` et retrait de `addNotification` des dépendances (stable via `useCallback`).

#### Avant :
```typescript
const finalConfig = { ...defaultConfig, ...config };

React.useEffect(() => {
  // ...
}, [finalConfig.colisNonValides, addNotification]);
```

#### Après :
```typescript
const finalConfig = React.useMemo(() => {
  const defaultConfig: AlertRules = { /* ... */ };
  return { ...defaultConfig, ...config };
}, [config]);

React.useEffect(() => {
  // ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [colisConfig.enabled, colisConfig.interval]); // Ne pas inclure addNotification
```

---

### 2. **AuthContext.tsx - Fonction checkAuth non stable**
- **Problème** : `checkAuth` n'était pas mémorisée, causant potentiellement des re-renders.
- **Solution** : Utilisation de `useCallback` pour mémoriser `checkAuth`.

#### Avant :
```typescript
useEffect(() => {
  checkAuth();
}, []);

const checkAuth = async () => { /* ... */ };
```

#### Après :
```typescript
const checkAuth = useCallback(async () => { /* ... */ }, []);

useEffect(() => {
  checkAuth();
}, [checkAuth]);
```

---

### 3. **PermissionsContext.tsx - Dépendances problématiques**
- **Problème** : `user` dans les dépendances causait des re-renders car l'objet change à chaque render.
- **Solution** : Utilisation de `user?.id` au lieu de `user` et `useCallback` pour `loadPermissions`.

#### Avant :
```typescript
useEffect(() => {
  if (isAuthenticated && user) {
    loadPermissions()
  }
}, [user, isAuthenticated]);

const loadPermissions = async () => { /* ... */ };
```

#### Après :
```typescript
const loadPermissions = useCallback(async () => { /* ... */ }, []);

useEffect(() => {
  if (isAuthenticated && user) {
    loadPermissions()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated, user?.id]); // Utiliser user?.id au lieu de user
```

---

## 📝 Points Clés

1. **Utiliser `useMemo` pour les objets créés dans le render**
2. **Utiliser `useCallback` pour les fonctions passées aux dépendances**
3. **Ne pas inclure des objets complets dans les dépendances (utiliser des propriétés spécifiques)**
4. **Vérifier que les fonctions de contexte sont stables (`useCallback`)**

---

## 🧪 Test

Après ces corrections :
1. Se connecter avec n'importe quel utilisateur
2. Vérifier que la page ne se recharge plus en boucle
3. Vérifier que les fonctionnalités fonctionnent normalement
4. Ouvrir les DevTools (F12) et vérifier l'onglet Network pour s'assurer qu'il n'y a pas de requêtes en boucle

---

## 🔍 Si le problème persiste

Vérifier :
1. Les composants qui utilisent `useAlerts()`
2. Les queries React Query avec `refetchInterval`
3. D'autres `useEffect` sans dépendances correctes
4. Les contextes qui pourraient causer des re-renders
